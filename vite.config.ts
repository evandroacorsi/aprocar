import react from "@vitejs/plugin-react-swc";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "path";
import { Readable } from "node:stream";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv, type Plugin } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "public");
const newsDir = path.join(publicDir, "news");
const uploadsDir = path.join(publicDir, "uploads");
const documentsDir = path.join(publicDir, "documents");
const teamDir = path.join(publicDir, "team");
const partnersDir = path.join(publicDir, "partners");
const faqDir = path.join(publicDir, "faq");
const newsIndexPath = path.join(newsDir, "index.json");
const documentsIndexPath = path.join(documentsDir, "index.json");
const teamIndexPath = path.join(teamDir, "index.json");
const partnersIndexPath = path.join(partnersDir, "index.json");
const faqIndexPath = path.join(faqDir, "index.json");
const sitemapPath = path.join(publicDir, "sitemap.xml");

type NewsPayload = {
  id?: string;
  slug?: string;
  data?: string;
  titulo: string;
  descricao: string;
  conteudo: string;
  categoria?: string[];
  imagem?: string[];
  visualizacoes?: number;
};

type MediaItem = {
  name: string;
  url: string;
  size: number;
  modifiedAt: string;
};

type MediaPagination = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

type TransparencyDocument = {
  id: string;
  nome: string;
  categoria: string;
  data: string;
  arquivo: string;
};

type TeamMember = {
  id: string;
  nome: string;
  cargo: string;
  area: string;
  foto?: string;
};

type Partner = {
  id: string;
  nome: string;
  foto?: string;
  link?: string;
};

type FaqItem = {
  id: string;
  pergunta: string;
  resposta: string;
};

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

const respondJson = (res: ServerResponse, status: number, data: unknown) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
};

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const escapeFrontmatter = (value: string) => value.replace(/\r/g, "").replace(/\n/g, " ").trim();

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const siteUrlFromEnv = (env: Record<string, string>) =>
  (env.VITE_SITE_URL || env.SITE_URL || "https://www.aprocar.org.br").replace(/\/$/, "");

const supabaseUrlFromEnv = (env: Record<string, string>) =>
  (env.VITE_SUPABASE_URL || env.SUPABASE_URL || "").replace(/\/$/, "");

const supabasePublishableKeyFromEnv = (env: Record<string, string>) =>
  env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || "";

const supabaseServiceKeyFromEnv = (env: Record<string, string>) =>
  env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "";

const sitemapUrl = (env: Record<string, string>, route: string) =>
  `${siteUrlFromEnv(env)}/${route.replace(/^\//, "")}`;

const parseValue = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const looksJson =
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"));

  if (looksJson) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  return trimmed.replace(/^["']|["']$/g, "");
};

const normalizeArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const parseMarkdown = (markdown: string) => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const frontmatter = match?.[1] ?? "";
  const content = match?.[2] ?? markdown;
  const meta: Record<string, unknown> = {};

  frontmatter.split("\n").forEach((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) return;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);
    if (key) meta[key] = parseValue(value);
  });

  const imagem = normalizeArray(meta.imagem ?? meta.imagens);

  return {
    id: String(meta.id ?? meta.slug ?? ""),
    slug: String(meta.slug ?? meta.id ?? ""),
    data: String(meta.data ?? ""),
    titulo: String(meta.titulo ?? ""),
    descricao: String(meta.descricao ?? ""),
    conteudo: content.trim(),
    categoria: normalizeArray(meta.categoria),
    imagem,
    imagens: imagem,
    visualizacoes: Number(meta.visualizacoes ?? 0),
  };
};

const toMarkdown = (post: Required<NewsPayload>) => `---
id: ${post.id}
slug: ${post.slug}
data: ${post.data}
titulo: "${escapeFrontmatter(post.titulo)}"
descricao: "${escapeFrontmatter(post.descricao)}"
categoria: ${JSON.stringify(post.categoria)}
imagem: ${JSON.stringify(post.imagem)}
visualizacoes: ${post.visualizacoes}
---
${post.conteudo.trim()}
`;

const getAccessToken = (headers: Headers | Record<string, string | string[] | undefined>) => {
  const rawHeader =
    headers instanceof Headers
      ? headers.get("authorization") || headers.get("Authorization") || ""
      : (headers.authorization as string | undefined) ||
        (headers.Authorization as string | undefined) ||
        "";

  if (!rawHeader.startsWith("Bearer ")) return null;
  return rawHeader.slice(7);
};

const validateSession = async (token: string | null, env: Record<string, string>) => {
  if (!token) throw new Error("Sessão ausente.");
  const supabaseUrl = supabaseUrlFromEnv(env);
  const publishableKey = supabasePublishableKeyFromEnv(env);

  if (!supabaseUrl || !publishableKey) {
    throw new Error("Supabase não configurado.");
  }

  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("Sessão inválida.");

  const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
    _user_id: data.user.id,
    _role: "admin",
  });

  if (roleError || hasRole !== true) {
    throw new Error("Acesso negado. Apenas administradores podem gerenciar o conteúdo.");
  }

  return data.user;
};

const buildSitemap = async (
  posts: Array<{ slug?: string; id?: string; data?: string; categoria?: string[] }>,
  env: Record<string, string>,
) => {
  const today = new Date().toISOString().split("T")[0];
  const categoryRoutes = Array.from(
    new Set(
      posts
        .flatMap((post) => (Array.isArray(post.categoria) ? post.categoria : []))
        .map((category) => slugify(category))
        .filter(Boolean),
    ),
  ).map((categorySlug) => ({
    loc: sitemapUrl(env, `/noticias/categoria/${encodeURIComponent(categorySlug)}`),
    lastmod: today,
    priority: "0.7",
  }));

  const routes = [
    { loc: sitemapUrl(env, "/"), lastmod: today, priority: "1.0" },
    { loc: sitemapUrl(env, "/sobre"), lastmod: today, priority: "0.8" },
    { loc: sitemapUrl(env, "/doacoes"), lastmod: today, priority: "0.8" },
    { loc: sitemapUrl(env, "/transparencia"), lastmod: today, priority: "0.7" },
    { loc: sitemapUrl(env, "/noticias"), lastmod: today, priority: "0.9" },
    { loc: sitemapUrl(env, "/contato"), lastmod: today, priority: "0.7" },
    ...posts
      .map((post) => {
        const slug = post.slug || post.id;
        if (!slug) return null;

        return {
          loc: sitemapUrl(env, `/noticias/${encodeURIComponent(slug)}`),
          lastmod: post.data || today,
          priority: "0.8",
        };
      })
      .filter(Boolean),
    ...categoryRoutes,
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.flatMap((route) => {
      if (!route) return [];

      return [
        "  <url>",
        `    <loc>${escapeXml(route.loc)}</loc>`,
        `    <lastmod>${escapeXml(route.lastmod)}</lastmod>`,
        "    <changefreq>weekly</changefreq>",
        `    <priority>${escapeXml(route.priority)}</priority>`,
        "  </url>",
      ];
    }),
    "</urlset>",
    "",
  ].join("\n");

  await fs.writeFile(sitemapPath, xml, "utf-8");
};

const buildNewsIndex = async (env: Record<string, string>) => {
  await ensureDir(newsDir);
  const files = (await fs.readdir(newsDir)).filter((file) => file.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (file) => {
      const markdown = await fs.readFile(path.join(newsDir, file), "utf-8");
      const post = parseMarkdown(markdown);
      const { conteudo, ...summary } = post;
      return {
        ...summary,
        path: `/news/${file}`,
      };
    }),
  );

  posts.sort((a, b) => String(b.data).localeCompare(String(a.data)));
  await fs.writeFile(newsIndexPath, JSON.stringify(posts, null, 2), "utf-8");
  await buildSitemap(posts, env);
  return posts;
};

const findNewsFile = async (idOrSlug: string) => {
  await ensureDir(newsDir);
  const files = (await fs.readdir(newsDir)).filter((file) => file.endsWith(".md"));

  for (const file of files) {
    const post = parseMarkdown(await fs.readFile(path.join(newsDir, file), "utf-8"));
    if (post.id === idOrSlug || post.slug === idOrSlug) return path.join(newsDir, file);
  }

  return null;
};

const listMedia = async (page = 1, perPage = 12): Promise<{ items: MediaItem[]; pagination: MediaPagination }> => {
  await ensureDir(uploadsDir);
  const files = (await fs.readdir(uploadsDir)).filter((file) => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));

  const stats = await Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(uploadsDir, file);
      const stat = await fs.stat(fullPath);
      return {
        name: file,
        url: `/uploads/${file}`,
        size: stat.size,
        modifiedAt: stat.mtime.toISOString(),
        mtime: stat.mtimeMs,
      };
    }),
  );

  const sorted = stats
    .sort((a, b) => b.mtime - a.mtime)
    .map(({ mtime: _mtime, ...media }) => media);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  return {
    items: sorted.slice((safePage - 1) * perPage, safePage * perPage),
    pagination: {
      page: safePage,
      perPage,
      total,
      totalPages,
    },
  };
};

const deleteMedia = async (nameOrUrl: string) => {
  await ensureDir(uploadsDir);
  const parsedName = nameOrUrl.startsWith("/uploads/")
    ? path.basename(nameOrUrl)
    : path.basename(new URL(nameOrUrl, "http://localhost").pathname);

  if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(parsedName)) {
    throw new Error("Imagem inválida.");
  }

  const targetPath = path.resolve(uploadsDir, parsedName);
  const uploadsRoot = path.resolve(uploadsDir);
  if (!targetPath.startsWith(`${uploadsRoot}${path.sep}`)) {
    throw new Error("Imagem inválida.");
  }

  await fs.unlink(targetPath);
};

const readJsonFile = async <T,>(filePath: string, fallback: T): Promise<T> => {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const loadDocuments = async () => {
  await ensureDir(documentsDir);
  const data = await readJsonFile<TransparencyDocument[]>(documentsIndexPath, []);
  return Array.isArray(data) ? data : [];
};

const saveDocuments = async (documents: TransparencyDocument[]) => {
  await ensureDir(documentsDir);
  const sorted = [...documents].sort((a, b) => String(b.data).localeCompare(String(a.data), "pt-BR"));
  await fs.writeFile(documentsIndexPath, JSON.stringify(sorted, null, 2), "utf-8");
  return sorted;
};

const findDocumentIndex = (documents: TransparencyDocument[], id: string) =>
  documents.findIndex((document) => document.id === id);

const documentTargetPath = (arquivo: string) => {
  const parsedName = path.basename(new URL(arquivo, "http://localhost").pathname);
  if (!/\.pdf$/i.test(parsedName)) return null;

  const targetPath = path.resolve(documentsDir, parsedName);
  const documentsRoot = path.resolve(documentsDir);
  if (!targetPath.startsWith(`${documentsRoot}${path.sep}`)) return null;

  return targetPath;
};

const deleteDocumentFile = async (arquivo: string) => {
  const targetPath = documentTargetPath(arquivo);
  if (!targetPath) return;

  await fs.unlink(targetPath).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
};

const saveDocumentFile = async (file: File, baseName: string) => {
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("O documento deve ter no máximo 15MB.");
  }

  const isPdf =
    file.name.toLowerCase().endsWith(".pdf") ||
    ["application/pdf", "application/octet-stream", "application/x-pdf"].includes(file.type);

  if (!isPdf) {
    throw new Error("Formato inválido. Envie um arquivo PDF.");
  }

  await ensureDir(documentsDir);
  const safeName = slugify(baseName) || "documento";
  const finalName = `${safeName}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}.pdf`;
  const targetPath = path.join(documentsDir, finalName);
  await fs.writeFile(targetPath, Buffer.from(await file.arrayBuffer()));

  return `/documents/${finalName}`;
};

const getFormString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const loadTeam = async () => {
  await ensureDir(teamDir);
  const data = await readJsonFile<{ equipe?: TeamMember[] }>(teamIndexPath, { equipe: [] });
  return {
    equipe: Array.isArray(data.equipe) ? data.equipe : [],
  };
};

const saveTeam = async (data: { equipe: TeamMember[] }) => {
  await ensureDir(teamDir);
  await fs.writeFile(teamIndexPath, JSON.stringify(data, null, 2), "utf-8");
};

const loadPartners = async () => {
  await ensureDir(partnersDir);
  const data = await readJsonFile<Partner[] | { parceiros?: Partner[] }>(partnersIndexPath, []);
  if (Array.isArray(data)) return data;
  return Array.isArray(data.parceiros) ? data.parceiros : [];
};

const savePartners = async (partners: Partner[]) => {
  await ensureDir(partnersDir);
  await fs.writeFile(partnersIndexPath, JSON.stringify(partners, null, 2), "utf-8");
};

const loadFaq = async () => {
  await ensureDir(faqDir);
  const data = await readJsonFile<FaqItem[] | { perguntas?: FaqItem[] }>(faqIndexPath, []);
  if (Array.isArray(data)) return data;
  return Array.isArray(data.perguntas) ? data.perguntas : [];
};

const saveFaq = async (items: FaqItem[]) => {
  await ensureDir(faqDir);
  await fs.writeFile(faqIndexPath, JSON.stringify(items, null, 2), "utf-8");
};

const normalizeTeamText = (value: unknown, maxLength = 160) =>
  String(value ?? "").trim().slice(0, maxLength);

const normalizePartnerLink = (value: unknown) => {
  const rawLink = normalizeTeamText(value, 300);
  if (!rawLink) return "";

  const normalizedLink = /^https?:\/\//i.test(rawLink) ? rawLink : `https://${rawLink}`;

  try {
    const url = new URL(normalizedLink);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) {
      throw new Error("URL inválida.");
    }

    return url.toString();
  } catch {
    throw new Error("Link inválido. Use uma URL http ou https.");
  }
};

const createTeamMember = (
  input: Record<string, unknown>,
  fallbackId?: string,
  existingMember?: TeamMember,
): TeamMember => {
  const nome = normalizeTeamText(input.nome);
  const cargo = normalizeTeamText(input.cargo);
  const area = normalizeTeamText(input.area);
  const foto = Object.prototype.hasOwnProperty.call(input, "foto")
    ? normalizeTeamText(input.foto, 300)
    : normalizeTeamText(existingMember?.foto, 300);

  if (!nome || !cargo || !area) {
    throw new Error("Nome, cargo e área são obrigatórios.");
  }

  if (foto && !/^\/uploads\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp|gif)$/i.test(foto)) {
    throw new Error("Foto inválida. Envie a imagem pela área de upload.");
  }

  return {
    id: fallbackId || `${slugify(nome)}-${Math.random().toString(16).slice(2, 8)}`,
    nome,
    cargo,
    area,
    ...(foto ? { foto } : {}),
  };
};

const createPartner = (
  input: Record<string, unknown>,
  fallbackId?: string,
  existingPartner?: Partner,
): Partner => {
  const nome = normalizeTeamText(input.nome);
  const foto = Object.prototype.hasOwnProperty.call(input, "foto")
    ? normalizeTeamText(input.foto, 300)
    : normalizeTeamText(existingPartner?.foto, 300);
  const link = Object.prototype.hasOwnProperty.call(input, "link")
    ? normalizePartnerLink(input.link)
    : normalizePartnerLink(existingPartner?.link);

  if (!nome) {
    throw new Error("Nome do parceiro é obrigatório.");
  }

  if (foto && !/^\/uploads\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp|gif)$/i.test(foto)) {
    throw new Error("Foto inválida. Envie a imagem pela área de upload.");
  }

  return {
    id: fallbackId || `${slugify(nome)}-${Math.random().toString(16).slice(2, 8)}`,
    nome,
    ...(foto ? { foto } : {}),
    ...(link ? { link } : {}),
  };
};

const createFaqItem = (input: Record<string, unknown>, fallbackId?: string): FaqItem => {
  const pergunta = normalizeTeamText(input.pergunta, 240);
  const resposta = normalizeTeamText(input.resposta, 2000);

  if (!pergunta || !resposta) {
    throw new Error("Pergunta e resposta são obrigatórias.");
  }

  return {
    id: fallbackId || `${slugify(pergunta)}-${Math.random().toString(16).slice(2, 8)}`,
    pergunta,
    resposta,
  };
};

const serviceRequest = async (
  env: Record<string, string>,
  requestPath: string,
  method = "GET",
  payload?: unknown,
  extraHeaders: Record<string, string> = {},
) => {
  const supabaseUrl = supabaseUrlFromEnv(env);
  const serviceKey = supabaseServiceKeyFromEnv(env);
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Chave administrativa do Supabase não configurada no servidor.");
  }

  const headers: Record<string, string> = {
    apikey: serviceKey,
    ...extraHeaders,
  };

  if (!serviceKey.startsWith("sb_secret_")) {
    headers.Authorization = `Bearer ${serviceKey}`;
  }

  const response = await fetch(`${supabaseUrl}${requestPath}`, {
    method,
    headers: payload === undefined ? headers : { ...headers, "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const text = await response.text();

  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};

const serviceErrorMessage = (response: { data: unknown }, fallback: string) => {
  if (response.data && typeof response.data === "object") {
    const data = response.data as Record<string, unknown>;
    return String(data.msg || data.message || data.error_description || data.error || fallback);
  }

  return fallback;
};

const normalizeUserRole = (role: unknown) => {
  const normalized = String(role || "user").trim();
  if (!["admin", "user"].includes(normalized)) {
    throw new Error("Papel inválido.");
  }

  return normalized;
};

const setUserRole = async (env: Record<string, string>, userId: string, role: string) => {
  const encodedUserId = encodeURIComponent(userId);
  const remove = await serviceRequest(
    env,
    `/rest/v1/user_roles?user_id=eq.${encodedUserId}`,
    "DELETE",
    undefined,
    { Accept: "application/json" },
  );

  if (!remove.ok && remove.status !== 204) {
    throw new Error(serviceErrorMessage(remove, "Não foi possível atualizar permissões."));
  }

  const insert = await serviceRequest(
    env,
    "/rest/v1/user_roles",
    "POST",
    { user_id: userId, role },
    {
      Accept: "application/json",
      Prefer: "return=representation",
    },
  );

  if (!insert.ok) {
    throw new Error(serviceErrorMessage(insert, "Não foi possível salvar permissões."));
  }
};

const requestToWebRequest = async (req: IncomingMessage) => {
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : Readable.toWeb(req);

  const init: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers: req.headers as HeadersInit,
    body,
  };

  if (body) init.duplex = "half";

  return new Request(`http://localhost${req.url}`, init);
};

const devNewsApi = (env: Record<string, string>): Plugin => ({
  name: "dev-news-api",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const localApiPaths = [
        "/api/news.php",
        "/api/media.php",
        "/api/documents.php",
        "/api/team.php",
        "/api/partners.php",
        "/api/faq.php",
        "/api/users.php",
      ];

      if (!req.url || !localApiPaths.some((apiPath) => req.url?.startsWith(apiPath))) {
        return next();
      }

      try {
        await ensureDir(newsDir);
        await ensureDir(uploadsDir);
        await ensureDir(documentsDir);
        await ensureDir(teamDir);
        await ensureDir(partnersDir);
        await ensureDir(faqDir);

        const request = await requestToWebRequest(req);
        const url = new URL(request.url);

        if (url.pathname === "/api/news.php") {
          if (request.method === "GET") {
            const id = url.searchParams.get("id");
            if (id) {
              const file = await findNewsFile(id);
              if (!file) return respondJson(res, 404, { error: "Notícia não encontrada." });
              return respondJson(res, 200, parseMarkdown(await fs.readFile(file, "utf-8")));
            }

            return respondJson(res, 200, { noticias: await buildNewsIndex(env) });
          }

          const token = getAccessToken(request.headers);
          await validateSession(token, env);

          if (request.method === "POST" || request.method === "PUT") {
            const body = (await request.json()) as NewsPayload;
            const baseSlug = slugify(body.slug || body.titulo);

            if (!body.titulo || !body.descricao || !body.conteudo || !baseSlug) {
              return respondJson(res, 400, { error: "Título, descrição e conteúdo são obrigatórios." });
            }

            const id = body.id || baseSlug;
            const slug = body.slug || baseSlug;
            const existingFile = request.method === "PUT" ? await findNewsFile(id) : null;
            const filePath = existingFile ?? path.join(newsDir, `${slug}.md`);

            if (request.method === "POST") {
              const fileExists = await fs
                .access(filePath)
                .then(() => true)
                .catch(() => false);

              if (fileExists) {
                const uniqueSlug = `${baseSlug}-${Date.now()}`;
                const uniquePost = {
                  id: uniqueSlug,
                  slug: uniqueSlug,
                  data: body.data || new Date().toISOString().split("T")[0],
                  titulo: body.titulo,
                  descricao: body.descricao,
                  conteudo: body.conteudo,
                  categoria: Array.isArray(body.categoria) ? body.categoria : [],
                  imagem: Array.isArray(body.imagem) ? body.imagem : [],
                  visualizacoes: Number(body.visualizacoes ?? 0),
                };

                await fs.writeFile(path.join(newsDir, `${uniqueSlug}.md`), toMarkdown(uniquePost as Required<NewsPayload>), "utf-8");
                await buildNewsIndex(env);
                return respondJson(res, 200, { success: true, noticia: uniquePost });
              }
            }

            const post = {
              id,
              slug,
              data: body.data || new Date().toISOString().split("T")[0],
              titulo: body.titulo,
              descricao: body.descricao,
              conteudo: body.conteudo,
              categoria: Array.isArray(body.categoria) ? body.categoria : [],
              imagem: Array.isArray(body.imagem) ? body.imagem : [],
              visualizacoes: Number(body.visualizacoes ?? 0),
            };

            await fs.writeFile(filePath, toMarkdown(post as Required<NewsPayload>), "utf-8");
            await buildNewsIndex(env);
            return respondJson(res, 200, { success: true, noticia: post });
          }

          if (request.method === "DELETE") {
            const id = url.searchParams.get("id");
            if (!id) return respondJson(res, 400, { error: "ID obrigatório." });

            const file = await findNewsFile(id);
            if (!file) return respondJson(res, 404, { error: "Notícia não encontrada." });

            await fs.unlink(file);
            await buildNewsIndex(env);
            return respondJson(res, 200, { success: true });
          }

          return respondJson(res, 405, { error: "Método não permitido." });
        }

        if (url.pathname === "/api/documents.php") {
          if (request.method === "GET") {
            const documents = await loadDocuments();
            const id = url.searchParams.get("id");
            if (id) {
              const document = documents.find((item) => item.id === id);
              if (!document) return respondJson(res, 404, { error: "Documento não encontrado." });
              return respondJson(res, 200, document);
            }

            return respondJson(res, 200, { documentos: await saveDocuments(documents) });
          }

          const token = getAccessToken(request.headers);
          await validateSession(token, env);

          if (request.method === "POST") {
            const formData = await request.formData();
            const nome = getFormString(formData, "nome");
            const categoria = getFormString(formData, "categoria");
            const data = getFormString(formData, "data") || String(new Date().getFullYear());
            let id = getFormString(formData, "id") || slugify(nome);
            const isUpdate = Boolean(getFormString(formData, "id"));

            if (!nome || !categoria || !data || !id) {
              return respondJson(res, 400, { error: "Nome, categoria e data são obrigatórios." });
            }

            const documents = await loadDocuments();
            const existingIndex = isUpdate ? findDocumentIndex(documents, id) : -1;

            if (isUpdate && existingIndex === -1) {
              return respondJson(res, 404, { error: "Documento não encontrado." });
            }

            if (!isUpdate && documents.some((document) => document.id === id)) {
              id = `${slugify(nome)}-${Date.now()}`;
            }

            const file = formData.get("file");
            let arquivo = isUpdate && existingIndex >= 0 ? documents[existingIndex].arquivo : "";

            if (file instanceof File) {
              if (isUpdate && arquivo) await deleteDocumentFile(arquivo);
              arquivo = await saveDocumentFile(file, nome);
            }

            if (!arquivo) {
              return respondJson(res, 400, { error: "Arquivo PDF obrigatório." });
            }

            const document = { id, nome, categoria, data, arquivo };
            if (isUpdate && existingIndex >= 0) documents[existingIndex] = document;
            else documents.push(document);

            return respondJson(res, 200, {
              success: true,
              documento: document,
              documentos: await saveDocuments(documents),
            });
          }

          if (request.method === "DELETE") {
            const id = url.searchParams.get("id");
            if (!id) return respondJson(res, 400, { error: "ID obrigatório." });

            const documents = await loadDocuments();
            const existingIndex = findDocumentIndex(documents, id);
            if (existingIndex === -1) return respondJson(res, 404, { error: "Documento não encontrado." });

            await deleteDocumentFile(documents[existingIndex].arquivo);
            documents.splice(existingIndex, 1);
            await saveDocuments(documents);
            return respondJson(res, 200, { success: true });
          }

          return respondJson(res, 405, { error: "Método não permitido." });
        }

        if (url.pathname === "/api/media.php") {
          const token = getAccessToken(request.headers);
          await validateSession(token, env);

          if (request.method === "GET") {
            const page = Math.max(1, Number(url.searchParams.get("page") || 1));
            const perPage = Math.min(Math.max(1, Number(url.searchParams.get("perPage") || 12)), 48);
            const result = await listMedia(page, perPage);
            return respondJson(res, 200, { media: result.items, pagination: result.pagination });
          }

          if (request.method === "DELETE") {
            try {
              await deleteMedia(url.searchParams.get("name") || url.searchParams.get("url") || "");
              return respondJson(res, 200, { success: true });
            } catch (error) {
              const message = error instanceof Error ? error.message : "Não foi possível excluir a imagem.";
              const status = message === "Imagem inválida." ? 400 : 404;
              return respondJson(res, status, { error: message });
            }
          }

          if (request.method !== "POST") {
            return respondJson(res, 405, { error: "Método não permitido." });
          }

          const formData = await request.formData();
          const file = formData.get("image");

          if (!(file instanceof File)) {
            return respondJson(res, 400, { error: "Arquivo de imagem obrigatório." });
          }

          if (file.size > 5 * 1024 * 1024) {
            return respondJson(res, 400, { error: "A imagem deve ter no máximo 5MB." });
          }

          const allowedTypes: Record<string, string> = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
            "image/gif": "gif",
          };

          if (!allowedTypes[file.type]) {
            return respondJson(res, 400, { error: "Formato inválido. Use JPG, PNG, WebP ou GIF." });
          }

          const safeName = slugify(path.parse(file.name).name) || "imagem";
          const extension = allowedTypes[file.type];
          const finalName = `${safeName}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}.${extension}`;
          const targetPath = path.join(uploadsDir, finalName);
          const buffer = Buffer.from(await file.arrayBuffer());

          await fs.writeFile(targetPath, buffer);

          return respondJson(res, 200, {
            success: true,
            media: {
              name: finalName,
              url: `/uploads/${finalName}`,
              size: file.size,
              modifiedAt: new Date().toISOString(),
            },
          });
        }

        if (url.pathname === "/api/team.php") {
          if (request.method === "GET") {
            return respondJson(res, 200, await loadTeam());
          }

          const token = getAccessToken(request.headers);
          await validateSession(token, env);
          const data = await loadTeam();

          if (request.method === "POST") {
            const body = (await request.json()) as Record<string, unknown>;
            const member = createTeamMember(body);
            data.equipe.push(member);
            await saveTeam(data);
            return respondJson(res, 200, { success: true, membro: member });
          }

          if (request.method === "PUT") {
            const body = (await request.json()) as Record<string, unknown>;
            const id = normalizeTeamText(body.id, 100);
            const index = data.equipe.findIndex((member) => member.id === id);
            if (!id || index === -1) return respondJson(res, 404, { error: "Profissional não encontrado." });

            const member = createTeamMember(body, id, data.equipe[index]);
            data.equipe[index] = member;
            await saveTeam(data);
            return respondJson(res, 200, { success: true, membro: member });
          }

          if (request.method === "DELETE") {
            const id = url.searchParams.get("id") || "";
            const before = data.equipe.length;
            data.equipe = data.equipe.filter((member) => member.id !== id);
            if (data.equipe.length === before) {
              return respondJson(res, 404, { error: "Profissional não encontrado." });
            }

            await saveTeam(data);
            return respondJson(res, 200, { success: true });
          }

          return respondJson(res, 405, { error: "Método não permitido." });
        }

        if (url.pathname === "/api/partners.php") {
          if (request.method === "GET") {
            return respondJson(res, 200, { parceiros: await loadPartners() });
          }

          const token = getAccessToken(request.headers);
          await validateSession(token, env);
          const partners = await loadPartners();

          if (request.method === "POST") {
            const body = (await request.json()) as Record<string, unknown>;
            const partner = createPartner(body);
            partners.push(partner);
            await savePartners(partners);
            return respondJson(res, 200, { success: true, parceiro: partner });
          }

          if (request.method === "PUT") {
            const body = (await request.json()) as Record<string, unknown>;
            const id = normalizeTeamText(body.id, 100);
            const index = partners.findIndex((partner) => partner.id === id);
            if (!id || index === -1) return respondJson(res, 404, { error: "Parceiro não encontrado." });

            const partner = createPartner(body, id, partners[index]);
            partners[index] = partner;
            await savePartners(partners);
            return respondJson(res, 200, { success: true, parceiro: partner });
          }

          if (request.method === "DELETE") {
            const id = url.searchParams.get("id") || "";
            const before = partners.length;
            const nextPartners = partners.filter((partner) => partner.id !== id);
            if (nextPartners.length === before) {
              return respondJson(res, 404, { error: "Parceiro não encontrado." });
            }

            await savePartners(nextPartners);
            return respondJson(res, 200, { success: true });
          }

          return respondJson(res, 405, { error: "Método não permitido." });
        }

        if (url.pathname === "/api/faq.php") {
          if (request.method === "GET") {
            return respondJson(res, 200, { perguntas: await loadFaq() });
          }

          const token = getAccessToken(request.headers);
          await validateSession(token, env);
          const items = await loadFaq();

          if (request.method === "POST") {
            const body = (await request.json()) as Record<string, unknown>;
            const item = createFaqItem(body);
            items.push(item);
            await saveFaq(items);
            return respondJson(res, 200, { success: true, pergunta: item });
          }

          if (request.method === "PUT") {
            const body = (await request.json()) as Record<string, unknown>;
            const id = normalizeTeamText(body.id, 100);
            const index = items.findIndex((item) => item.id === id);
            if (!id || index === -1) return respondJson(res, 404, { error: "Pergunta não encontrada." });

            const item = createFaqItem(body, id);
            items[index] = item;
            await saveFaq(items);
            return respondJson(res, 200, { success: true, pergunta: item });
          }

          if (request.method === "DELETE") {
            const id = url.searchParams.get("id") || "";
            const before = items.length;
            const nextItems = items.filter((item) => item.id !== id);
            if (nextItems.length === before) {
              return respondJson(res, 404, { error: "Pergunta não encontrada." });
            }

            await saveFaq(nextItems);
            return respondJson(res, 200, { success: true });
          }

          return respondJson(res, 405, { error: "Método não permitido." });
        }

        if (url.pathname === "/api/users.php") {
          const token = getAccessToken(request.headers);
          const currentUser = await validateSession(token, env);

          if (request.method === "GET") {
            const usersResponse = await serviceRequest(env, "/auth/v1/admin/users?page=1&per_page=100");
            if (!usersResponse.ok) {
              return respondJson(res, 500, {
                error: serviceErrorMessage(usersResponse, "Não foi possível listar usuários."),
              });
            }

            const rolesResponse = await serviceRequest(env, "/rest/v1/user_roles?select=user_id,role", "GET", undefined, {
              Accept: "application/json",
            });
            const roles: Record<string, string[]> = {};
            const rolesData = Array.isArray(rolesResponse.data) ? rolesResponse.data : [];
            for (const row of rolesData) {
              if (!row || typeof row !== "object") continue;
              const roleRow = row as Record<string, unknown>;
              const userId = String(roleRow.user_id || "");
              const role = String(roleRow.role || "");
              if (!userId || !role) continue;
              roles[userId] = [...(roles[userId] || []), role];
            }

            const usersData =
              usersResponse.data && typeof usersResponse.data === "object"
                ? (usersResponse.data as { users?: unknown[] }).users
                : [];
            const users = (Array.isArray(usersData) ? usersData : [])
              .filter((user): user is Record<string, unknown> => Boolean(user && typeof user === "object"))
              .map((user) => {
                const id = String(user.id || "");
                const metadata = user.user_metadata && typeof user.user_metadata === "object"
                  ? (user.user_metadata as Record<string, unknown>)
                  : {};

                return {
                  id,
                  email: String(user.email || ""),
                  fullName: String(metadata.full_name || ""),
                  roles: roles[id] || [],
                  createdAt: String(user.created_at || ""),
                  lastSignInAt: String(user.last_sign_in_at || ""),
                };
              })
              .filter((user) => user.id);

            return respondJson(res, 200, {
              users,
              currentUserId: currentUser.id,
            });
          }

          if (request.method === "POST") {
            const body = (await request.json()) as Record<string, unknown>;
            const email = String(body.email || "").trim();
            const password = String(body.password || "");
            const fullName = String(body.fullName || "").replace(/<[^>]*>/g, "").trim();
            const role = normalizeUserRole(body.role);

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              return respondJson(res, 400, { error: "E-mail inválido." });
            }
            if (password.length < 8) {
              return respondJson(res, 400, { error: "A senha deve ter pelo menos 8 caracteres." });
            }
            if (fullName.length > 120) {
              return respondJson(res, 400, { error: "Nome muito longo." });
            }

            const create = await serviceRequest(env, "/auth/v1/admin/users", "POST", {
              email,
              password,
              email_confirm: true,
              user_metadata: { full_name: fullName },
            });

            if (!create.ok || !create.data || typeof create.data !== "object" || !(create.data as Record<string, unknown>).id) {
              return respondJson(res, create.status === 422 ? 409 : 500, {
                error: serviceErrorMessage(create, "Não foi possível criar usuário."),
              });
            }

            const userId = String((create.data as Record<string, unknown>).id);
            await setUserRole(env, userId, role);
            return respondJson(res, 200, { success: true, userId });
          }

          if (request.method === "PATCH") {
            const body = (await request.json()) as Record<string, unknown>;
            const userId = String(body.userId || "").replace(/[^a-f0-9-]/gi, "");
            const role = normalizeUserRole(body.role);

            if (!userId) return respondJson(res, 400, { error: "Usuário inválido." });
            if (userId === currentUser.id && role !== "admin") {
              return respondJson(res, 400, { error: "Você não pode remover seu próprio acesso de administrador." });
            }

            await setUserRole(env, userId, role);
            return respondJson(res, 200, { success: true });
          }

          if (request.method === "DELETE") {
            const userId = (url.searchParams.get("id") || "").replace(/[^a-f0-9-]/gi, "");
            if (!userId) return respondJson(res, 400, { error: "Usuário inválido." });
            if (userId === currentUser.id) {
              return respondJson(res, 400, { error: "Você não pode excluir sua própria conta." });
            }

            const remove = await serviceRequest(env, `/auth/v1/admin/users/${encodeURIComponent(userId)}`, "DELETE");
            if (!remove.ok) {
              return respondJson(res, 500, {
                error: serviceErrorMessage(remove, "Não foi possível excluir usuário."),
              });
            }

            return respondJson(res, 200, { success: true });
          }

          return respondJson(res, 405, { error: "Método não permitido." });
        }
      } catch (error) {
        return respondJson(res, 401, {
          error: error instanceof Error ? error.message : "Erro na API local.",
        });
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");

  return {
    base: "/",
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [devNewsApi(env), react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
  };
});

export type NewsPost = {
  id: string;
  slug: string;
  data: string;
  titulo: string;
  descricao: string;
  conteudo: string;
  categoria: string[];
  imagem: string[];
  imagens: string[];
  visualizacoes: number;
};

export type NewsSummary = Omit<NewsPost, "conteudo"> & {
  path: string;
};

const NEWS_INDEX_PATH = "/news/index.json";

export const BASE_NEWS_CATEGORIES = [
  "Acolhimento",
  "Doações",
  "Eventos",
  "Importante",
  "Institucional",
  "Notícias",
  "Transparência",
].sort();

export const emptyNewsPost: NewsPost = {
  id: "",
  slug: "",
  data: new Date().toISOString().split("T")[0],
  titulo: "",
  descricao: "",
  conteudo: "",
  categoria: [],
  imagem: [],
  imagens: [],
  visualizacoes: 0,
};

export const slugifyCategory = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getNewsCategories = <T extends Pick<NewsSummary, "categoria">>(posts: T[] = []) => {
  const categories = posts.flatMap((post) => post.categoria);
  return Array.from(new Set([...BASE_NEWS_CATEGORIES, ...categories].map((item) => item.trim()).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));
};

export const findCategoryBySlug = (categories: string[], slug?: string) => {
  if (!slug) return "";
  return categories.find((category) => slugifyCategory(category) === slug) ?? "";
};

const normalizeArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const parseFrontmatterValue = (value: string): unknown => {
  const trimmed = value.trim();

  if (!trimmed) return "";

  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);

  return trimmed.replace(/^["']|["']$/g, "");
};

export const parseNewsMarkdown = (markdown: string): NewsPost => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const frontmatter = match?.[1] ?? "";
  const content = match?.[2] ?? markdown;
  const meta: Record<string, unknown> = {};

  frontmatter.split("\n").forEach((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) return;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);
    if (key) meta[key] = parseFrontmatterValue(value);
  });

  const imagem = normalizeArray(meta.imagem ?? meta.imagens);

  return {
    ...emptyNewsPost,
    ...meta,
    id: String(meta.id ?? meta.slug ?? ""),
    slug: String(meta.slug ?? meta.id ?? ""),
    data: String(meta.data ?? emptyNewsPost.data),
    titulo: String(meta.titulo ?? ""),
    descricao: String(meta.descricao ?? ""),
    conteudo: content.trim(),
    categoria: normalizeArray(meta.categoria),
    imagem,
    imagens: imagem,
    visualizacoes: Number(meta.visualizacoes ?? 0),
  };
};

export const fetchPublicNews = async (): Promise<NewsSummary[]> => {
  const response = await fetch(`${NEWS_INDEX_PATH}?v=${Date.now()}`);
  if (!response.ok) return [];

  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export const fetchPublicNewsPost = async (idOrSlug: string): Promise<NewsPost | null> => {
  const posts = await fetchPublicNews();
  const summary = posts.find((post) => post.id === idOrSlug || post.slug === idOrSlug);

  if (!summary) return null;

  const response = await fetch(`${summary.path}?v=${Date.now()}`);
  if (!response.ok) return null;

  return parseNewsMarkdown(await response.text());
};

export const filterNews = <T extends Pick<NewsSummary, "titulo" | "descricao" | "categoria">>(
  posts: T[],
  searchTerm: string,
  categoriaFiltro: string,
) => {
  const search = searchTerm.trim().toLowerCase();
  const category = categoriaFiltro === "all" ? "" : categoriaFiltro;

  return posts.filter((post) => {
    const matchesSearch = !search ||
      post.titulo.toLowerCase().includes(search) ||
      post.descricao.toLowerCase().includes(search) ||
      post.categoria.some((categoria) => categoria.toLowerCase().includes(search));

    const matchesCategory = !category || post.categoria.includes(category);

    return matchesSearch && matchesCategory;
  });
};

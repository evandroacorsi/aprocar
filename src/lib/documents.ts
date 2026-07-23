import type { LucideIcon } from "lucide-react";
import { Building2, Calendar, FileText, ScrollText } from "lucide-react";

export type TransparencyDocument = {
  id: string;
  nome: string;
  categoria: string;
  data: string;
  arquivo: string;
};

export const DOCUMENTS_INDEX_PATH = "/documents/index.json";

export const BASE_DOCUMENT_CATEGORIES = [
  "Documentos Institucionais",
  "Atas e Estatuto",
  "Prestação de Contas",
  "Convênios e Parcerias",
] as const;

export type DocumentCategory = (typeof BASE_DOCUMENT_CATEGORIES)[number];

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Documentos Institucionais": Building2,
  "Atas e Estatuto": ScrollText,
  "Prestação de Contas": FileText,
  "Convênios e Parcerias": Calendar,
};

export const emptyDocument: TransparencyDocument = {
  id: "",
  nome: "",
  categoria: BASE_DOCUMENT_CATEGORIES[0],
  data: new Date().getFullYear().toString(),
  arquivo: "",
};

export const fetchPublicDocuments = async (): Promise<TransparencyDocument[]> => {
  const response = await fetch(`${DOCUMENTS_INDEX_PATH}?v=${Date.now()}`);
  if (!response.ok) return [];

  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export const groupDocumentsByCategory = (documents: TransparencyDocument[]) => {
  const grouped = new Map<string, TransparencyDocument[]>();

  for (const category of BASE_DOCUMENT_CATEGORIES) {
    grouped.set(category, []);
  }

  for (const doc of documents) {
    const category = doc.categoria.trim() || "Outros";
    const items = grouped.get(category) ?? [];
    items.push(doc);
    grouped.set(category, items);
  }

  return Array.from(grouped.entries())
    .filter(([, items]) => items.length > 0)
    .map(([categoria, items]) => ({
      categoria,
      icon: CATEGORY_ICONS[categoria] ?? FileText,
      items: items.sort((a, b) => b.data.localeCompare(a.data, "pt-BR")),
    }));
};

export const filterDocuments = (
  documents: TransparencyDocument[],
  searchTerm: string,
  categoriaFiltro: string,
) => {
  const search = searchTerm.trim().toLowerCase();
  const category = categoriaFiltro === "all" ? "" : categoriaFiltro;

  return documents.filter((doc) => {
    const matchesSearch =
      !search ||
      doc.nome.toLowerCase().includes(search) ||
      doc.categoria.toLowerCase().includes(search) ||
      doc.data.toLowerCase().includes(search);

    const matchesCategory = !category || doc.categoria === category;

    return matchesSearch && matchesCategory;
  });
};

export const getDocumentCategories = (documents: TransparencyDocument[] = []) => {
  const categories = documents.map((doc) => doc.categoria.trim()).filter(Boolean);
  return Array.from(new Set([...BASE_DOCUMENT_CATEGORIES, ...categories])).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
};

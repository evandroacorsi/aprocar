import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchJson } from "@/lib/api";
import { filterNews, getNewsCategories, NewsPost, NewsSummary } from "@/lib/news";
import { ChevronLeft, ChevronRight, Edit, Eye, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface NewsListProps {
  onEdit: (news: NewsPost) => void;
}

const getSessionToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Sessão inválida");
  return session.access_token;
};

const PAGE_SIZE = 9;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Ocorreu um erro inesperado.";

const getPageWindow = (currentPage: number, totalPages: number) => {
  const windowSize = 5;
  const halfWindow = Math.floor(windowSize / 2);
  const start = Math.max(1, Math.min(currentPage - halfWindow, totalPages - windowSize + 1));
  const end = Math.min(totalPages, start + windowSize - 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export function NewsList({ onEdit }: NewsListProps) {
  const [news, setNews] = useState<NewsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchJson<{ noticias: NewsSummary[] }>("/api/news.php");
      setNews(Array.isArray(data.noticias) ? data.noticias : []);
    } catch (error: unknown) {
      toast({
        title: "Erro ao carregar notícias",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoriaFiltro]);

  const filteredNews = useMemo(
    () => filterNews(news, searchTerm, categoriaFiltro),
    [news, searchTerm, categoriaFiltro],
  );
  const categorias = useMemo(() => getNewsCategories(news), [news]);
  const totalPages = Math.max(1, Math.ceil(filteredNews.length / PAGE_SIZE));
  const visibleNews = filteredNews.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const pageWindow = getPageWindow(currentPage, totalPages);

  const changePage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const handleEdit = async (id: string) => {
    try {
      const data = await fetchJson<NewsPost>(`/api/news.php?id=${encodeURIComponent(id)}`);
      onEdit(data);
    } catch (error: unknown) {
      toast({
        title: "Erro ao editar",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const token = await getSessionToken();
      const result = await fetchJson<{ success?: boolean; error?: string }>(`/api/news.php?id=${encodeURIComponent(deleteId)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (result.error) throw new Error(result.error || "Erro ao deletar");

      toast({ title: "Notícia deletada" });
      setNews((prev) => prev.filter((item) => item.id !== deleteId));
    } catch (error: unknown) {
      toast({
        title: "Erro ao deletar",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-muted/30 p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pelo título..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-10 bg-white"
          />
          {searchTerm && (
            <X
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => setSearchTerm("")}
            />
          )}
        </div>

        <Select
          value={categoriaFiltro || "all"}
          onValueChange={(value) => setCategoriaFiltro(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-full md:w-[220px] bg-white">
            <SelectValue placeholder="Todas categorias" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">Todas categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="p-8 text-center animate-pulse">Carregando notícias...</div>
      ) : filteredNews.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-muted-foreground">Nenhuma notícia encontrada para estes filtros.</p>
          {(searchTerm || categoriaFiltro) && (
            <Button variant="link" onClick={() => { setSearchTerm(""); setCategoriaFiltro(""); }}>
              Limpar filtros
            </Button>
          )}
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Exibindo {visibleNews.length} de {filteredNews.length} notícia(s)
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleNews.map((item) => (
              <Card key={item.id} className="overflow-hidden flex flex-col group">
                <div className="h-40 overflow-hidden bg-muted relative">
                  {item.imagem[0] ? (
                    <img
                      src={item.imagem[0]}
                      alt={item.titulo}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Sem imagem</div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button size="icon" variant="secondary" className="h-8 w-8 shadow-md" onClick={() => handleEdit(item.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8 shadow-md" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardHeader className="p-4 flex-1">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.categoria.map((cat) => (
                      <Badge key={cat} variant="secondary">{cat}</Badge>
                    ))}
                  </div>
                  <h3 className="font-bold text-md line-clamp-2 leading-tight">{item.titulo}</h3>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.descricao}</p>
                  <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground border-t pt-3">
                    <span>{item.data ? new Date(`${item.data}T00:00:00`).toLocaleDateString("pt-BR") : "-"}</span>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {item.visualizacoes}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    size="default"
                    onClick={(event) => {
                      event.preventDefault();
                      changePage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </PaginationLink>
                </PaginationItem>

                {pageWindow.map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(event) => {
                        event.preventDefault();
                        changePage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationLink
                    href="#"
                    size="default"
                    onClick={(event) => {
                      event.preventDefault();
                      changePage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta notícia? O arquivo Markdown será removido da pasta news no servidor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

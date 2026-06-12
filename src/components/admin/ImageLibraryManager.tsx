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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchJson } from "@/lib/api";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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

const MEDIA_PAGE_SIZE = 12;

const getSessionToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Sessão inválida");
  return session.access_token;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Ocorreu um erro inesperado.";

const getPageWindow = (currentPage: number, totalPages: number) => {
  const windowSize = 5;
  const halfWindow = Math.floor(windowSize / 2);
  const start = Math.max(1, Math.min(currentPage - halfWindow, totalPages - windowSize + 1));
  const end = Math.min(totalPages, start + windowSize - 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

export function ImageLibraryManager() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pagination, setPagination] = useState<MediaPagination>({
    page: 1,
    perPage: MEDIA_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const { toast } = useToast();

  const fetchMedia = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const token = await getSessionToken();
        const data = await fetchJson<{ media: MediaItem[]; pagination?: MediaPagination }>(
          `/api/media.php?page=${page}&perPage=${MEDIA_PAGE_SIZE}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setMedia(Array.isArray(data.media) ? data.media : []);
        setPagination(
          data.pagination ?? {
            page,
            perPage: MEDIA_PAGE_SIZE,
            total: Array.isArray(data.media) ? data.media.length : 0,
            totalPages: 1,
          },
        );
      } catch (error: unknown) {
        toast({
          title: "Erro ao carregar biblioteca",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchMedia(1);
  }, [fetchMedia]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const token = await getSessionToken();
      await fetchJson<{ success: boolean }>(`/api/media.php?name=${encodeURIComponent(deleteTarget.name)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({ title: "Imagem excluída" });
      setDeleteTarget(null);
      const nextPage = media.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await fetchMedia(nextPage);
    } catch (error: unknown) {
      toast({
        title: "Erro ao excluir imagem",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {loading ? "Carregando imagens..." : `${pagination.total} imagem(ns) encontrada(s)`}
          </div>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={loading}
            onClick={() => fetchMedia(pagination.page)}
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {loading ? (
          <div className="rounded-lg border bg-white p-10 text-center text-muted-foreground">
            <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
            Carregando biblioteca...
          </div>
        ) : media.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-white p-10 text-center text-muted-foreground">
            <ImageIcon className="mx-auto mb-3 h-8 w-8" />
            Nenhuma imagem enviada ainda.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {media.map((item) => (
              <Card key={item.url} className="overflow-hidden bg-white">
                <div className="aspect-video bg-muted">
                  <img
                    src={item.url}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="space-y-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-xs text-primary hover:underline"
                    >
                      Visualizar
                    </a>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="shrink-0 gap-2"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <Pagination className="pt-2">
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  size="default"
                  onClick={(event) => {
                    event.preventDefault();
                    fetchMedia(pagination.page - 1);
                  }}
                  className={pagination.page === 1 ? "pointer-events-none opacity-50" : ""}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </PaginationLink>
              </PaginationItem>

              {getPageWindow(pagination.page, pagination.totalPages).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    size="default"
                    isActive={page === pagination.page}
                    onClick={(event) => {
                      event.preventDefault();
                      fetchMedia(page);
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
                    fetchMedia(pagination.page + 1);
                  }}
                  className={pagination.page === pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir imagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove o arquivo do servidor. Se a imagem estiver em uso em alguma notícia ou card, ela deixará de aparecer no site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="min-w-0 rounded-lg border bg-muted/40 p-3 text-sm">
            <p className="min-w-0 break-words font-medium [overflow-wrap:anywhere]">{deleteTarget?.name}</p>
            <p className="text-muted-foreground">{deleteTarget ? formatFileSize(deleteTarget.size) : ""}</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Excluindo..." : "Excluir imagem"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

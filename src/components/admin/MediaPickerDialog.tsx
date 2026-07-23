import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchJson } from "@/lib/api";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Loader2 } from "lucide-react";
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

type MediaPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  title: string;
  description?: string;
};

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  title,
  description,
}: MediaPickerDialogProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pagination, setPagination] = useState<MediaPagination>({
    page: 1,
    perPage: MEDIA_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMedia = useCallback(async (page = 1) => {
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
    } catch (error) {
      toast({
        title: "Erro ao carregar biblioteca",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!open) return;
    fetchMedia(1);
  }, [fetchMedia, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}

        {loading ? (
          <div className="p-10 text-center text-muted-foreground">
            <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
            Carregando biblioteca...
          </div>
        ) : media.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            <ImageIcon className="mx-auto mb-3 h-8 w-8" />
            Nenhuma imagem enviada ainda.
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Exibindo {media.length} de {pagination.total} imagem(ns)
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {media.map((item) => (
                <button
                  type="button"
                  key={item.url}
                  className="group overflow-hidden rounded-lg border bg-white text-left transition-all hover:border-primary hover:shadow-md"
                  onClick={() => {
                    onSelect(item.url);
                    onOpenChange(false);
                  }}
                >
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={item.url}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-medium">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {Math.ceil(item.size / 1024)} KB
                    </p>
                  </div>
                </button>
              ))}
            </div>

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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

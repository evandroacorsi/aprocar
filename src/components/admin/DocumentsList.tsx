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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchJson } from "@/lib/api";
import {
  filterDocuments,
  getDocumentCategories,
  type TransparencyDocument,
} from "@/lib/documents";
import { Edit, ExternalLink, FileText, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface DocumentsListProps {
  onEdit: (document: TransparencyDocument) => void;
}

const getSessionToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Sessão inválida");
  return session.access_token;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Ocorreu um erro inesperado.";

export function DocumentsList({ onEdit }: DocumentsListProps) {
  const [documents, setDocuments] = useState<TransparencyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchJson<{ documentos: TransparencyDocument[] }>("/api/documents.php");
      setDocuments(Array.isArray(data.documentos) ? data.documentos : []);
    } catch (error: unknown) {
      toast({
        title: "Erro ao carregar documentos",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const categorias = useMemo(() => getDocumentCategories(documents), [documents]);
  const filteredDocuments = useMemo(
    () => filterDocuments(documents, searchTerm, categoriaFiltro),
    [documents, searchTerm, categoriaFiltro],
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const token = await getSessionToken();
      await fetchJson<{ success?: boolean; error?: string }>(
        `/api/documents.php?id=${encodeURIComponent(deleteId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast({ title: "Documento excluído" });
      setDocuments((prev) => prev.filter((item) => item.id !== deleteId));
    } catch (error: unknown) {
      toast({
        title: "Erro ao excluir",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar pelo nome..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="bg-white pl-10"
          />
          {searchTerm && (
            <X
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => setSearchTerm("")}
            />
          )}
        </div>

        <Select
          value={categoriaFiltro || "all"}
          onValueChange={(value) => setCategoriaFiltro(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-full bg-white md:w-[260px]">
            <SelectValue placeholder="Todas categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categorias.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="p-8 text-center animate-pulse">Carregando documentos...</div>
      ) : filteredDocuments.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <p className="text-muted-foreground">Nenhum documento encontrado.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="bg-white p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <FileText className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge variant="secondary">{document.categoria}</Badge>
                      <Badge variant="outline">{document.data}</Badge>
                    </div>
                    <h3 className="break-words font-semibold text-foreground">{document.nome}</h3>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={document.arquivo} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir
                    </a>
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onEdit(document)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteId(document.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? O PDF enviado pelo painel será removido do servidor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

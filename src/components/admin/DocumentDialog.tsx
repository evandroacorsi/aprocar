import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BASE_DOCUMENT_CATEGORIES, type TransparencyDocument } from "@/lib/documents";
import { FileText, Loader2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDocument?: TransparencyDocument | null;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const isPdfFile = (file: File) => {
  const extension = file.name.toLowerCase().endsWith(".pdf");
  const mime = file.type.toLowerCase();
  return extension || mime === "application/pdf" || mime === "application/x-pdf" || mime === "application/octet-stream";
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Ocorreu um erro inesperado.";

const getSessionToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Sessão inválida");
  return session.access_token;
};

export function DocumentDialog({
  open,
  onOpenChange,
  editingDocument,
  onSuccess,
}: DocumentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    categoria: BASE_DOCUMENT_CATEGORIES[0],
    data: new Date().getFullYear().toString(),
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;

    if (editingDocument) {
      setFormData({
        nome: editingDocument.nome,
        categoria: editingDocument.categoria,
        data: editingDocument.data,
      });
    } else {
      setFormData({
        nome: "",
        categoria: BASE_DOCUMENT_CATEGORIES[0],
        data: new Date().getFullYear().toString(),
      });
    }

    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [editingDocument, open]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isPdfFile(file)) {
      toast({
        title: "Formato inválido",
        description: "Envie um arquivo PDF.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Arquivo muito grande",
        description: "O documento deve ter no máximo 15 MB.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingDocument && !selectedFile) {
      toast({
        title: "Arquivo obrigatório",
        description: "Selecione um PDF para publicar o documento.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = await getSessionToken();
      const body = new FormData();
      body.append("nome", formData.nome.trim());
      body.append("categoria", formData.categoria);
      body.append("data", formData.data.trim());

      if (editingDocument) body.append("id", editingDocument.id);
      if (selectedFile) body.append("file", selectedFile);

      const response = await fetch("/api/documents.php", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      const contentType = response.headers.get("content-type") || "";
      const text = await response.text();
      const data = contentType.includes("application/json") && text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(data?.error || `Erro HTTP ${response.status}`);
      }

      toast({
        title: editingDocument ? "Documento atualizado" : "Documento publicado",
        description: "As alterações foram salvas com sucesso.",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: unknown) {
      toast({
        title: "Erro ao salvar",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingDocument ? "Editar Documento" : "Novo Documento"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="document-name">Nome do documento</Label>
            <Input
              id="document-name"
              className="bg-background"
              placeholder="Ex.: Estatuto Social"
              value={formData.nome}
              onChange={(event) => setFormData({ ...formData, nome: event.target.value })}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {BASE_DOCUMENT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-date">Data de referência</Label>
              <Input
                id="document-date"
                className="bg-background"
                placeholder="Ex.: 2025 ou 06/2025"
                value={formData.data}
                onChange={(event) => setFormData({ ...formData, data: event.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Arquivo PDF</Label>
            <div className="flex flex-col gap-3 rounded-lg border border-dashed p-4">
              {editingDocument?.arquivo && !selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Arquivo atual mantido. Envie um novo PDF apenas se quiser substituir.</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />

              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {selectedFile ? "Trocar PDF" : editingDocument ? "Substituir PDF" : "Selecionar PDF"}
              </Button>

              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  {selectedFile.name} ({Math.ceil(selectedFile.size / 1024)} KB)
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingDocument ? "Salvar alterações" : "Publicar documento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchJson } from "@/lib/api";
import { MediaPickerDialog } from "@/components/admin/MediaPickerDialog";
import type { Partner } from "@/lib/partners";
import { Building2, Edit, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Ocorreu um erro inesperado.";

const getSessionToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Sessão inválida");
  return session.access_token;
};

type PartnerDialogProps = {
  partner: Partner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

function PartnerDialog({ partner, open, onOpenChange, onSuccess }: PartnerDialogProps) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", foto: "", link: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setForm(
      partner
        ? { nome: partner.nome, foto: partner.foto ?? "", link: partner.link ?? "" }
        : { nome: "", foto: "", link: "" },
    );
    if (fileRef.current) fileRef.current.value = "";
  }, [partner, open]);

  useEffect(() => {
    if (!open) setLibraryOpen(false);
  }, [open]);

  const uploadPhoto = async (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE) {
      toast({
        title: "Imagem inválida",
        description: "Use uma imagem de até 5 MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const token = await getSessionToken();
      const data = new FormData();
      data.append("image", file);

      const response = await fetch("/api/media.php", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Não foi possível enviar a imagem.");

      setForm((current) => ({ ...current, foto: result.media.url }));
    } catch (error) {
      toast({
        title: "Erro ao enviar imagem",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      const token = await getSessionToken();
      await fetchJson("/api/partners.php", {
        method: partner ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, id: partner?.id }),
      });

      toast({ title: partner ? "Parceiro atualizado" : "Parceiro adicionado" });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{partner ? "Editar parceiro" : "Novo parceiro"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partner-name">Nome da empresa parceira</Label>
              <Input
                id="partner-name"
                value={form.nome}
                onChange={(event) => setForm({ ...form, nome: event.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partner-link">Link do site (opcional)</Label>
              <Input
                id="partner-link"
                value={form.link}
                onChange={(event) => setForm({ ...form, link: event.target.value })}
                placeholder="https://empresa.com.br"
              />
            </div>

            <div className="space-y-2">
              <Label>Foto ou logo</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => uploadPhoto(event.target.files?.[0])}
              />
              <div className="flex flex-wrap items-center gap-3">
                {form.foto ? (
                  <img src={form.foto} alt="Prévia" className="h-16 w-24 rounded-lg border object-contain p-1" />
                ) : (
                  <div className="flex h-16 w-24 items-center justify-center rounded-lg border bg-muted">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="h-10 basis-0 flex-1 justify-center gap-2"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  {form.foto ? "Trocar imagem" : "Enviar imagem"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 basis-0 flex-1 justify-center gap-2"
                  onClick={() => setLibraryOpen(true)}
                >
                  <Building2 className="h-4 w-4" />
                  Escolher da biblioteca
                </Button>
                {form.foto && (
                  <Button type="button" variant="ghost" onClick={() => setForm({ ...form, foto: "" })}>
                    Remover
                  </Button>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {partner ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <MediaPickerDialog
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        onSelect={(url) => setForm((current) => ({ ...current, foto: url }))}
        title="Escolher foto da biblioteca"
        description="Selecione uma imagem já enviada para usar como foto ou logo do parceiro."
      />
    </>
  );
}

export function PartnersManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchJson<{ parceiros: Partner[] }>("/api/partners.php");
      setPartners(Array.isArray(data.parceiros) ? data.parceiros : []);
    } catch (error) {
      toast({
        title: "Erro ao carregar parceiros",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (partner: Partner) => {
    if (!window.confirm(`Excluir ${partner.nome} da lista de parceiros?`)) return;

    try {
      const token = await getSessionToken();
      await fetchJson(`/api/partners.php?id=${encodeURIComponent(partner.id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Parceiro excluído" });
      load();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          Cadastre empresas parceiras exibidas em carrossel na página inicial.
        </p>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo parceiro
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Carregando parceiros...</div>
      ) : partners.length === 0 ? (
        <Card className="border-dashed bg-white p-12 text-center text-muted-foreground">
          Nenhum parceiro cadastrado.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {partners.map((partner) => (
            <Card key={partner.id} className="bg-white">
              <CardContent className="flex items-center gap-4 p-4">
                {partner.foto ? (
                  <img src={partner.foto} alt={partner.nome} className="h-14 w-20 rounded-lg border object-contain p-1" />
                ) : (
                  <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg border bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{partner.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {partner.foto ? "Com imagem" : "Sem imagem"} • {partner.link ? "Com link" : "Sem link"}
                  </p>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Editar ${partner.nome}`}
                    title="Editar"
                    onClick={() => {
                      setEditing(partner);
                      setDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    aria-label={`Excluir ${partner.nome}`}
                    title="Excluir"
                    onClick={() => remove(partner)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PartnerDialog
        partner={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={load}
      />
    </>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchJson } from "@/lib/api";
import type { FaqItem } from "@/lib/faq";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Ocorreu um erro inesperado.";

const getSessionToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Sessão inválida");
  return session.access_token;
};

type FaqDialogProps = {
  item: FaqItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

function FaqDialog({ item, open, onOpenChange, onSuccess }: FaqDialogProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ pergunta: "", resposta: "" });
  const { toast } = useToast();

  useEffect(() => {
    setForm(item ? { pergunta: item.pergunta, resposta: item.resposta } : { pergunta: "", resposta: "" });
  }, [item, open]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      const token = await getSessionToken();
      await fetchJson("/api/faq.php", {
        method: item ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, id: item?.id }),
      });

      toast({ title: item ? "Pergunta atualizada" : "Pergunta adicionada" });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? "Editar pergunta" : "Nova pergunta"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="faq-question">Pergunta</Label>
            <Input
              id="faq-question"
              value={form.pergunta}
              onChange={(event) => setForm({ ...form, pergunta: event.target.value })}
              maxLength={240}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="faq-answer">Resposta</Label>
            <Textarea
              id="faq-answer"
              value={form.resposta}
              onChange={(event) => setForm({ ...form, resposta: event.target.value })}
              className="min-h-40"
              maxLength={2000}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {item ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function FaqManager() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchJson<{ perguntas: FaqItem[] }>("/api/faq.php");
      setItems(Array.isArray(data.perguntas) ? data.perguntas : []);
    } catch (error) {
      toast({
        title: "Erro ao carregar perguntas",
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

  const remove = async (item: FaqItem) => {
    if (!window.confirm("Excluir esta pergunta frequente?")) return;

    try {
      const token = await getSessionToken();
      await fetchJson(`/api/faq.php?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Pergunta excluída" });
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
          Cadastre perguntas e respostas exibidas na página inicial.
        </p>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nova pergunta
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Carregando perguntas...</div>
      ) : items.length === 0 ? (
        <Card className="border-dashed bg-white p-12 text-center text-muted-foreground">
          Nenhuma pergunta cadastrada. A seção não será exibida na página inicial.
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="bg-white">
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{item.pergunta}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.resposta}</p>
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Editar pergunta"
                    title="Editar"
                    onClick={() => {
                      setEditing(item);
                      setDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    aria-label="Excluir pergunta"
                    title="Excluir"
                    onClick={() => remove(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FaqDialog
        item={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={load}
      />
    </>
  );
}

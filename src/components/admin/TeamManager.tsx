import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { fetchJson } from "@/lib/api";
import { compareTeamMembers, groupTeamByArea, TEAM_AREAS, type TeamMember } from "@/lib/team";
import { Edit, ImagePlus, Loader2, Plus, Trash2, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MediaPickerDialog } from "@/components/admin/MediaPickerDialog";

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

type TeamDialogProps = {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

function TeamDialog({ member, open, onOpenChange, onSuccess }: TeamDialogProps) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", cargo: "", area: TEAM_AREAS[0], foto: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const areaOptions = Array.from(new Set([...TEAM_AREAS, form.area].filter(Boolean)));

  useEffect(() => {
    setForm(
      member
        ? { nome: member.nome, cargo: member.cargo, area: member.area, foto: member.foto ?? "" }
        : { nome: "", cargo: "", area: TEAM_AREAS[0], foto: "" },
    );
    if (fileRef.current) fileRef.current.value = "";
  }, [member, open]);

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
      if (!response.ok) throw new Error(result?.error || "Não foi possível enviar a foto.");

      setForm((current) => ({ ...current, foto: result.media.url }));
    } catch (error) {
      toast({
        title: "Erro ao enviar foto",
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
      await fetchJson("/api/team.php", {
        method: member ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, id: member?.id }),
      });

      toast({ title: member ? "Profissional atualizado" : "Profissional adicionado" });
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
            <DialogTitle>{member ? "Editar profissional" : "Novo profissional"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="team-name">Nome</Label>
                <Input
                  id="team-name"
                  value={form.nome}
                  onChange={(event) => setForm({ ...form, nome: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-role">Cargo</Label>
                <Input
                  id="team-role"
                  value={form.cargo}
                  onChange={(event) => setForm({ ...form, cargo: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Área</Label>
                <Select
                  value={form.area}
                  onValueChange={(area) => setForm({ ...form, area })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areaOptions.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Foto</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => uploadPhoto(event.target.files?.[0])}
              />
              <div className="flex flex-wrap items-center gap-3">
                {form.foto ? (
                  <img src={form.foto} alt="Prévia" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <Users className="h-5 w-5" />
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
                  {form.foto ? "Trocar foto" : "Enviar foto"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 basis-0 flex-1 justify-center gap-2"
                  onClick={() => setLibraryOpen(true)}
                >
                  <Users className="h-4 w-4" />
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
                {member ? "Salvar" : "Adicionar"}
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
        description="Selecione uma imagem já enviada para usar como foto do profissional."
      />
    </>
  );
}

export function TeamManager() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const groupedTeam = useMemo(() => groupTeamByArea(team), [team]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchJson<{ equipe: TeamMember[] }>("/api/team.php");
      setTeam(Array.isArray(data.equipe) ? [...data.equipe].sort(compareTeamMembers) : []);
    } catch (error) {
      toast({
        title: "Erro ao carregar equipe",
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

  const remove = async (member: TeamMember) => {
    if (!window.confirm(`Excluir ${member.nome} da equipe?`)) return;

    try {
      const token = await getSessionToken();
      await fetchJson(`/api/team.php?id=${encodeURIComponent(member.id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Profissional excluído" });
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
          Cadastre profissionais, cargos, áreas e fotos exibidos na página Sobre.
        </p>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo profissional
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Carregando equipe...</div>
      ) : team.length === 0 ? (
        <Card className="border-dashed bg-white p-12 text-center text-muted-foreground">
          Nenhum profissional cadastrado.
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedTeam.map((group) => (
            <section key={group.area} className="space-y-4">
              <div className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{group.area}</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                  {group.membros.length} profissional(is)
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.membros.map((member) => (
                  <Card key={member.id} className="bg-white">
                    <CardContent className="flex items-center gap-4 p-4">
                      {member.foto ? (
                        <img src={member.foto} alt={member.nome} className="h-14 w-14 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{member.nome}</p>
                        <p className="truncate text-sm text-muted-foreground">{member.cargo}</p>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Editar ${member.nome}`}
                          title="Editar"
                          onClick={() => {
                            setEditing(member);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          aria-label={`Excluir ${member.nome}`}
                          title="Excluir"
                          onClick={() => remove(member)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <TeamDialog
        member={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={load}
      />
    </>
  );
}

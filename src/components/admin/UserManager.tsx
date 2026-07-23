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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
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
import { Loader2, RefreshCw, Trash2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  createdAt: string;
  lastSignInAt: string;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Ocorreu um erro inesperado.";

async function getSessionToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Sessão inválida.");
  return session.access_token;
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
}

export function UserManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "user",
  });
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getSessionToken();
      const data = await fetchJson<{ users: AdminUser[]; currentUserId: string }>("/api/users.php", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(Array.isArray(data.users) ? data.users : []);
      setCurrentUserId(data.currentUserId || "");
    } catch (error: unknown) {
      toast({
        title: "Erro ao carregar usuários",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      const token = await getSessionToken();
      await fetchJson<{ success: boolean }>("/api/users.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      toast({ title: "Usuário criado" });
      setFormData({ fullName: "", email: "", password: "", role: "user" });
      await fetchUsers();
    } catch (error: unknown) {
      toast({
        title: "Erro ao criar usuário",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      const token = await getSessionToken();
      await fetchJson<{ success: boolean }>("/api/users.php", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role }),
      });

      toast({ title: "Permissão atualizada" });
      await fetchUsers();
    } catch (error: unknown) {
      toast({
        title: "Erro ao atualizar permissão",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSaving(true);
      const token = await getSessionToken();
      await fetchJson<{ success: boolean }>(`/api/users.php?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({ title: "Usuário excluído" });
      setDeleteTarget(null);
      await fetchUsers();
    } catch (error: unknown) {
      toast({
        title: "Erro ao excluir usuário",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit bg-white">
          <CardHeader>
            <h3 className="text-xl font-bold">Novo usuário</h3>
            <p className="text-sm text-muted-foreground">
              Crie uma conta com senha provisória e escolha se ela terá acesso administrativo.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-user-name">Nome</Label>
                <Input
                  id="new-user-name"
                  value={formData.fullName}
                  onChange={(event) => setFormData((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Nome completo"
                  maxLength={120}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-email">E-mail</Label>
                <Input
                  id="new-user-email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                  placeholder="usuario@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-password">Senha provisória</Label>
                <PasswordInput
                  id="new-user-password"
                  value={formData.password}
                  onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label>Permissão</Label>
                <Select
                  value={formData.role}
                  onValueChange={(role) => setFormData((current) => ({ ...current, role }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Sem acesso administrativo</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full gap-2" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Criar usuário
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {loading ? "Carregando usuários..." : `${users.length} usuário(s) encontrado(s)`}
            </p>
            <Button type="button" variant="outline" className="gap-2" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>

          {loading ? (
            <div className="rounded-lg border bg-white p-10 text-center text-muted-foreground">
              <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
              Carregando usuários...
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-white p-10 text-center text-muted-foreground">
              Nenhum usuário encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const role = user.roles.includes("admin") ? "admin" : "user";
                const isCurrentUser = user.id === currentUserId;

                return (
                  <Card key={user.id} className="bg-white">
                    <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h4 className="truncate font-semibold">{user.email}</h4>
                          {isCurrentUser && <Badge variant="secondary">Você</Badge>}
                          <Badge variant={role === "admin" ? "default" : "outline"}>
                            {role === "admin" ? "Administrador" : "Sem acesso administrativo"}
                          </Badge>
                        </div>
                        {user.fullName && <p className="text-sm text-muted-foreground">{user.fullName}</p>}
                        <p className="text-xs text-muted-foreground">
                          Criado em {formatDate(user.createdAt)} · Último login {formatDate(user.lastSignInAt)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Select
                          value={role}
                          onValueChange={(nextRole) => handleChangeRole(user.id, nextRole)}
                          disabled={isCurrentUser}
                        >
                          <SelectTrigger className="w-full bg-background sm:w-[220px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Sem acesso administrativo</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          variant="destructive"
                          className="gap-2"
                          disabled={isCurrentUser}
                          onClick={() => setDeleteTarget(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove o usuário do Supabase Auth e revoga o acesso ao painel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-md border bg-muted/40 p-3 text-sm">{deleteTarget?.email}</div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? "Excluindo..." : "Excluir usuário"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

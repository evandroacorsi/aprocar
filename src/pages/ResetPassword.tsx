import logo from "@/assets/logo-remove-bg.png";
import { Turnstile } from "@/components/security/Turnstile";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { AUTH_PATH } from "@/lib/adminRoutes";
import { isTurnstileConfigured } from "@/lib/security";
import { AlertCircle, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type Mode = "request" | "update";

export default function ResetPassword() {
  const [mode, setMode] = useState<Mode>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          toast({
            title: "Link inválido",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        setMode("update");
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (hashParams.get("type") === "recovery" || hashParams.get("access_token")) {
      setMode("update");
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("update");
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleRequestReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error("Configure as credenciais do Supabase no arquivo .env.");
      }
      if (isTurnstileConfigured && !turnstileToken) {
        throw new Error("Confirme a validação anti-spam antes de continuar.");
      }

      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
        captchaToken: turnstileToken || undefined,
      });

      if (error) throw error;

      toast({
        title: "E-mail enviado",
        description: "Se o endereço estiver cadastrado, você receberá o link para redefinir a senha.",
      });
    } catch (error: unknown) {
      toast({
        title: "Erro ao enviar recuperação",
        description: error instanceof Error ? error.message : "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (password.length < 8) {
        throw new Error("Use uma senha com pelo menos 8 caracteres.");
      }
      if (password !== passwordConfirmation) {
        throw new Error("As senhas nao conferem.");
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      await supabase.auth.signOut();
      toast({
        title: "Senha atualizada",
        description: "Entre novamente com sua nova senha.",
      });
      navigate(AUTH_PATH);
    } catch (error: unknown) {
      toast({
        title: "Erro ao atualizar senha",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-foreground p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <img src={logo} alt="APROCAR" className="mx-auto h-20 w-auto" />
          <CardTitle className="text-2xl font-bold">
            {mode === "request" ? "Recuperar senha" : "Definir nova senha"}
          </CardTitle>
          <CardDescription>
            {mode === "request"
              ? "Informe seu e-mail para receber o link de recuperação."
              : "Crie uma nova senha para sua conta administrativa."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSupabaseConfigured && (
            <div className="mb-4 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Preencha o `.env` antes de usar a recuperação.</span>
            </div>
          )}

          {mode === "request" ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={loading || !isSupabaseConfigured}
                />
              </div>
              <Turnstile
                onVerify={handleTurnstileVerify}
                onExpire={() => setTurnstileToken("")}
              />
              <Button type="submit" className="w-full" disabled={loading || !isSupabaseConfigured}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar link
              </Button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <PasswordInput
                  id="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password-confirmation">Confirmar senha</Label>
                <PasswordInput
                  id="new-password-confirmation"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar nova senha
              </Button>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            <Link to={AUTH_PATH} className="text-primary hover:underline">
              Voltar ao login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

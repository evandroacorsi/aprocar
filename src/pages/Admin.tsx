import { DocumentDialog } from "@/components/admin/DocumentDialog";
import { DocumentsList } from "@/components/admin/DocumentsList";
import { FaqManager } from "@/components/admin/FaqManager";
import { ImageLibraryManager } from "@/components/admin/ImageLibraryManager";
import { NewsDialog } from "@/components/admin/NewsDialog";
import { NewsList } from "@/components/admin/NewsList";
import { PartnersManager } from "@/components/admin/PartnersManager";
import { TeamManager } from "@/components/admin/TeamManager";
import { UserManager } from "@/components/admin/UserManager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { AUTH_PATH } from "@/lib/adminRoutes";
import type { TransparencyDocument } from "@/lib/documents";
import type { NewsPost } from "@/lib/news";
import logo from "@/assets/logo-remove-bg.png";
import type { User } from "@supabase/supabase-js";
import { AlertCircle, CircleHelp, FileText, FolderOpen, Handshake, Image as ImageIcon, LogOut, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsPost | null>(null);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<TransparencyDocument | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [documentsRefreshKey, setDocumentsRefreshKey] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const validateAdmin = async (sessionUser: User | null) => {
      if (!sessionUser) {
        setUser(null);
        setIsAdmin(false);
        navigate(AUTH_PATH);
        return;
      }

      setUser(sessionUser);
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: sessionUser.id,
        _role: "admin",
      });

      if (error || data !== true) {
        setIsAdmin(false);
        toast({
          title: "Acesso negado",
          description: "Sua conta não possui permissão de administrador.",
          variant: "destructive",
        });
        return;
      }

      setIsAdmin(true);
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await validateAdmin(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      validateAdmin(session?.user ?? null).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logout realizado", description: "Você saiu com sucesso." });
    navigate(AUTH_PATH);
  };

  const handleEditNews = (news: NewsPost) => {
    setEditingNews(news);
    setIsNewsDialogOpen(true);
  };

  const handleCloseNewsDialog = () => {
    setIsNewsDialogOpen(false);
    setEditingNews(null);
  };

  const handleEditDocument = (document: TransparencyDocument) => {
    setEditingDocument(document);
    setIsDocumentDialogOpen(true);
  };

  const handleCloseDocumentDialog = () => {
    setIsDocumentDialogOpen(false);
    setEditingDocument(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary p-6">
        <div className="max-w-lg rounded-lg border bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h1 className="mb-3 text-display text-3xl font-semibold text-foreground">
            Supabase não configurado
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no arquivo `.env` para acessar o painel administrativo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-foreground text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <img src={logo} alt="APROCAR" className="h-16 w-auto" />
            <div className="min-w-0">
              <h1 className="text-xl font-bold">Painel Administrativo</h1>
              <p className="truncate text-sm text-primary-foreground/70">
                {user?.email ?? "APROCAR"}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-primary"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="news" className="w-full">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <TabsList className="h-auto flex-wrap justify-start bg-white">
              <TabsTrigger value="news" className="gap-2">
                <FileText className="h-4 w-4" /> Notícias
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2">
                <FolderOpen className="h-4 w-4" /> Transparência
              </TabsTrigger>
              <TabsTrigger value="image-library" className="gap-2">
                <ImageIcon className="h-4 w-4" /> Biblioteca de Imagens
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2">
                <Users className="h-4 w-4" /> Equipe
              </TabsTrigger>
              <TabsTrigger value="partners" className="gap-2">
                <Handshake className="h-4 w-4" /> Parceiros
              </TabsTrigger>
              <TabsTrigger value="faq" className="gap-2">
                <CircleHelp className="h-4 w-4" /> FAQ
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" /> Usuários
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="news">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Gerenciar Notícias</h2>
                <p className="mt-1 text-muted-foreground">
                  Crie, edite e gerencie as notícias do site.
                </p>
              </div>
              {isAdmin && (
                <Button onClick={() => setIsNewsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Nova Notícia
                </Button>
              )}
            </div>

            {isAdmin ? (
              <NewsList onEdit={handleEditNews} key={`news-${refreshKey}`} />
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-white p-8 text-center text-muted-foreground">
                Esta conta está autenticada, mas não possui permissão de administrador.
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Documentos de Transparência</h2>
                <p className="mt-1 text-muted-foreground">
                  Publique PDFs exibidos na página de transparência do site.
                </p>
              </div>
              {isAdmin && (
                <Button
                  onClick={() => {
                    setEditingDocument(null);
                    setIsDocumentDialogOpen(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" /> Novo Documento
                </Button>
              )}
            </div>

            {isAdmin ? (
              <DocumentsList onEdit={handleEditDocument} key={`documents-${documentsRefreshKey}`} />
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-white p-8 text-center text-muted-foreground">
                Esta conta está autenticada, mas não possui permissão de administrador.
              </div>
            )}
          </TabsContent>

          <TabsContent value="image-library">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground">Biblioteca de Imagens</h2>
              <p className="mt-1 text-muted-foreground">
                Visualize e exclua as imagens salvas na pasta de uploads do servidor.
              </p>
            </div>

            {isAdmin ? (
              <ImageLibraryManager />
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-white p-8 text-center text-muted-foreground">
                Esta conta está autenticada, mas não possui permissão de administrador.
              </div>
            )}
          </TabsContent>

          <TabsContent value="team">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground">Gerenciar Equipe</h2>
              <p className="mt-1 text-muted-foreground">
                Atualize profissionais, cargos, áreas e fotos exibidos na página Sobre.
              </p>
            </div>

            {isAdmin ? (
              <TeamManager />
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-white p-8 text-center text-muted-foreground">
                Esta conta está autenticada, mas não possui permissão de administrador.
              </div>
            )}
          </TabsContent>

          <TabsContent value="partners">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground">Gerenciar Parceiros</h2>
              <p className="mt-1 text-muted-foreground">
                Cadastre empresas parceiras exibidas no carrossel da página inicial.
              </p>
            </div>

            {isAdmin ? (
              <PartnersManager />
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-white p-8 text-center text-muted-foreground">
                Esta conta está autenticada, mas não possui permissão de administrador.
              </div>
            )}
          </TabsContent>

          <TabsContent value="faq">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground">Perguntas Frequentes</h2>
              <p className="mt-1 text-muted-foreground">
                Cadastre perguntas e respostas exibidas na página inicial.
              </p>
            </div>

            {isAdmin ? (
              <FaqManager />
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-white p-8 text-center text-muted-foreground">
                Esta conta está autenticada, mas não possui permissão de administrador.
              </div>
            )}
          </TabsContent>

          <TabsContent value="users">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground">Controle de Usuários</h2>
              <p className="mt-1 text-muted-foreground">
                Crie contas e controle quem pode acessar o painel administrativo.
              </p>
            </div>

            {isAdmin ? (
              <UserManager />
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-white p-8 text-center text-muted-foreground">
                Esta conta está autenticada, mas não possui permissão de administrador.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <NewsDialog
        open={isNewsDialogOpen}
        onOpenChange={handleCloseNewsDialog}
        editingNews={editingNews}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
      />

      <DocumentDialog
        open={isDocumentDialogOpen}
        onOpenChange={handleCloseDocumentDialog}
        editingDocument={editingDocument}
        onSuccess={() => setDocumentsRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
}

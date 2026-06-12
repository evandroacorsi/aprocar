import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx";
import Sobre from "./pages/Sobre.tsx";
import Doacoes from "./pages/Doacoes.tsx";
import Transparencia from "./pages/Transparencia.tsx";
import Noticias from "./pages/Noticias.tsx";
import NoticiaDetalhe from "./pages/NoticiaDetalhe.tsx";
import Contato from "./pages/Contato.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Admin from "./pages/Admin.tsx";
import { ADMIN_PATH, AUTH_PATH } from "@/lib/adminRoutes";

const queryClient = new QueryClient();

const RedirectLegacyNewsPost = () => {
  const { id } = useParams();
  return <Navigate to={`/noticias/${id ?? ""}`} replace />;
};

const AppRoutes = () => {
  const location = useLocation();
  const hideLayout = [AUTH_PATH, ADMIN_PATH].includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/doacoes" element={<Doacoes />} />
        <Route path="/transparencia" element={<Transparencia />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/noticias/categoria/:categorySlug" element={<Noticias />} />
        <Route path="/noticias/:id" element={<NoticiaDetalhe />} />
        <Route path="/noticia/:id" element={<RedirectLegacyNewsPost />} />
        <Route path="/contato" element={<Contato />} />
        <Route path={AUTH_PATH} element={<Auth />} />
        <Route path={ADMIN_PATH} element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideLayout && <Footer />}
      {!hideLayout && <WhatsAppButton />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

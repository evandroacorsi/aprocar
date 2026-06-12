import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchPublicNewsPost, type NewsPost } from "@/lib/news";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const isEmptyBlock = (element: Element) => {
  const tag = element.tagName.toLowerCase();
  if (!["p", "div", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) return false;
  if (element.querySelector("img, iframe, video, audio, table, ul, ol, blockquote")) return false;
  return !element.textContent?.trim();
};

const normalizeHtml = (content: string) => {
  if (typeof DOMParser === "undefined") return content;

  const parser = new DOMParser();
  const documentHtml = parser.parseFromString(`<div id="news-content-root">${content}</div>`, "text/html");
  const root = documentHtml.getElementById("news-content-root");
  if (!root) return content;

  root.querySelectorAll("script, style").forEach((element) => element.remove());

  root.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();

      if (name.startsWith("on")) element.removeAttribute(attribute.name);
      if ((name === "href" || name === "src") && value.startsWith("javascript:")) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  root.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((heading) => {
    const figures = Array.from(heading.querySelectorAll("figure"));
    figures.reverse().forEach((figure) => heading.after(figure));
  });

  Array.from(root.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const paragraph = documentHtml.createElement("p");
      paragraph.textContent = node.textContent;
      node.replaceWith(paragraph);
      return;
    }

    if (node instanceof HTMLElement && node.tagName.toLowerCase() === "span") {
      const paragraph = documentHtml.createElement("p");
      paragraph.innerHTML = node.outerHTML;
      node.replaceWith(paragraph);
    }
  });

  root.querySelectorAll("p,div,h1,h2,h3,h4,h5,h6").forEach((element) => {
    if (isEmptyBlock(element)) element.remove();
  });

  return root.innerHTML;
};

const contentToHtml = (content: string) => {
  if (!content) return "";
  if (/<[a-z][\s\S]*>/i.test(content)) return normalizeHtml(content);

  return content
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
};

const formatLongDate = (date: string) => {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const NoticiaDetalhe = () => {
  const { id } = useParams();
  const [noticia, setNoticia] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagemAberta, setImagemAberta] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchNoticia = async () => {
      try {
        if (!id) return;
        const post = await fetchPublicNewsPost(id);
        if (mounted) setNoticia(post);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchNoticia();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!noticia?.imagens || noticia.imagens.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % noticia.imagens.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [noticia]);

  useEffect(() => {
    if (!noticia) return;
    document.title = `${noticia.titulo} | APROCAR`;

    const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (descriptionMeta) descriptionMeta.content = noticia.descricao;
  }, [noticia]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center pt-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </main>
    );
  }

  if (!noticia) {
    return (
      <main className="pt-24">
        <section className="section-padding">
          <div className="container-narrow text-center">
            <h1 className="text-display mb-4 text-4xl font-semibold text-foreground">
              Notícia não encontrada
            </h1>
            <Button variant="outline" asChild>
              <Link to="/noticias">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para notícias
              </Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  const images = noticia.imagens?.length ? noticia.imagens : noticia.imagem;

  return (
    <main className="pt-24">
      <article className="section-padding">
        <div className="container-narrow">
          <Button variant="ghost" className="mb-8 pl-0 text-muted-foreground hover:bg-transparent" asChild>
            <Link to="/noticias">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para notícias
            </Link>
          </Button>

          {images.length > 0 && (
            <section className="group relative mb-10 h-64 w-full overflow-hidden rounded-[2rem] bg-muted shadow-sm sm:h-80 md:h-[460px]">
              {images.map((img, index) => (
                <div
                  key={`${img}-${index}`}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    index === currentSlide ? "z-10 opacity-100" : "z-0 opacity-0"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${noticia.titulo} - imagem ${index + 1}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="h-full w-full cursor-zoom-in object-cover"
                    onClick={() => setImagemAberta(img)}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                </div>
              ))}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Imagem anterior"
                    onClick={() => setCurrentSlide(currentSlide === 0 ? images.length - 1 : currentSlide - 1)}
                    className="absolute left-3 top-1/2 z-20 rounded-full bg-black/35 p-2 text-white transition hover:bg-black/60"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    type="button"
                    aria-label="Próxima imagem"
                    onClick={() => setCurrentSlide((currentSlide + 1) % images.length)}
                    className="absolute right-3 top-1/2 z-20 rounded-full bg-black/35 p-2 text-white transition hover:bg-black/60"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
            </section>
          )}

          <header className="mb-10">
            <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1">
                <Calendar className="mr-2 h-4 w-4" />
                {formatLongDate(noticia.data)}
              </span>
              {noticia.categoria.map((categoria) => (
                <span key={categoria} className="rounded-full bg-accent-pink-soft px-3 py-1 text-foreground">
                  {categoria}
                </span>
              ))}
            </div>
            <h1 className="editorial-title mb-6 text-foreground">
              {noticia.titulo}
            </h1>
            {noticia.descricao && (
              <p className="editorial-body max-w-3xl text-xl">
                {noticia.descricao}
              </p>
            )}
          </header>

          <Card className="border-none bg-transparent shadow-none">
            <CardContent className="p-0">
              <div
                className="prose prose-lg max-w-none break-words text-foreground prose-headings:font-display prose-a:text-foreground prose-a:underline prose-blockquote:rounded-r-lg prose-blockquote:border-l-4 prose-blockquote:border-accent-yellow prose-blockquote:bg-secondary prose-blockquote:px-4 prose-blockquote:py-2 prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: contentToHtml(noticia.conteudo) }}
              />
            </CardContent>
          </Card>

          <div className="mt-16 border-t border-border pt-8 text-center">
            <h2 className="text-display mb-3 text-3xl font-semibold text-foreground">
              Continue acompanhando
            </h2>
            <p className="mb-8 text-muted-foreground">
              Veja outras notícias, eventos e informações da APROCAR.
            </p>
            <Button asChild className="rounded-full">
              <Link to="/noticias">Ver mais notícias</Link>
            </Button>
          </div>
        </div>
      </article>

      {imagemAberta && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setImagemAberta(null)}
        >
          <button
            type="button"
            aria-label="Fechar imagem"
            onClick={() => setImagemAberta(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={imagemAberta}
            alt="Imagem ampliada"
            decoding="async"
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
};

export default NoticiaDetalhe;

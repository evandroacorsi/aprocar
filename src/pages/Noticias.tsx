import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchPublicNews,
  filterNews,
  findCategoryBySlug,
  getNewsCategories,
  slugifyCategory,
  type NewsSummary,
} from "@/lib/news";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, ImageOff, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import noticiasHero from "@/assets/noticias.jpg";

const PAGE_SIZE = 6;

const formatDate = (date: string) => {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getPageWindow = (currentPage: number, totalPages: number) => {
  const windowSize = 5;
  const halfWindow = Math.floor(windowSize / 2);
  const start = Math.max(1, Math.min(currentPage - halfWindow, totalPages - windowSize + 1));
  const end = Math.min(totalPages, start + windowSize - 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const Noticias = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [noticias, setNoticias] = useState<NewsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPublicNews()
      .then(setNoticias)
      .finally(() => setLoading(false));
  }, []);

  const categorias = useMemo(() => getNewsCategories(noticias), [noticias]);
  const routeCategory = useMemo(
    () => findCategoryBySlug(categorias, categorySlug),
    [categorias, categorySlug],
  );
  const activeCategory = routeCategory || categoriaFiltro;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory]);

  const noticiasFiltradas = useMemo(
    () => filterNews(noticias, searchTerm, activeCategory),
    [noticias, searchTerm, activeCategory],
  );

  const featuredNews = noticiasFiltradas[0];
  const remainingNews = noticiasFiltradas.slice(1);
  const totalPages = Math.max(1, Math.ceil(remainingNews.length / PAGE_SIZE));
  const paginatedNews = remainingNews.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const pageWindow = getPageWindow(currentPage, totalPages);
  const hasFilters = Boolean(searchTerm || activeCategory);

  const resetFilters = () => {
    setSearchTerm("");
    setCategoriaFiltro("");
    navigate("/noticias");
  };

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      setCategoriaFiltro("");
      navigate("/noticias");
      return;
    }

    setCategoriaFiltro(value);
    navigate(`/noticias/categoria/${slugifyCategory(value)}`);
  };

  const changePage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="pt-24">
      <PageHero
        eyebrow="Atualizações"
        title="Notícias e"
        highlight="novidades"
        description="Acompanhe as últimas atualizações, eventos e informações relevantes da APROCAR."
        image={noticiasHero}
        imageAlt="Notícias e novidades da APROCAR"
        accentClass="accent-pink-text"
        imagePosition="center"
      />

      <section className="border-y border-border bg-secondary py-8">
        <div className="container-wide">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por título, resumo ou categoria..."
                className="h-12 w-full rounded-full border border-border bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-foreground"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <Select value={activeCategory || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="h-12 w-full rounded-full bg-white md:w-[260px]">
                <SelectValue placeholder="Todas categorias" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">Todas categorias</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="section-padding bg-background">
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        </section>
      ) : noticiasFiltradas.length === 0 ? (
        <section className="section-padding bg-background">
          <div className="container-narrow text-center">
            <div className="rounded-2xl border border-dashed bg-card p-10">
              <p className="mb-3 text-display text-2xl font-semibold text-foreground">
                Nenhuma notícia encontrada.
              </p>
              {hasFilters ? (
                <>
                  <p className="mb-6 text-muted-foreground">
                    Tente limpar os filtros ou buscar por outro termo.
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Limpar filtros
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Volte mais tarde para conferir as próximas publicações da APROCAR.
                </p>
              )}
            </div>
          </div>
        </section>
      ) : (
        <>
          {featuredNews && (
            <section className="section-padding bg-background pt-16">
              <div className="container-wide">
                <AnimatedSection>
                  <article className="grid overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm lg:grid-cols-5">
                    <div className="min-h-[300px] bg-muted lg:col-span-2">
                      {featuredNews.imagem[0] ? (
                        <img
                          src={featuredNews.imagem[0]}
                          alt={featuredNews.titulo}
                          fetchPriority="high"
                          decoding="async"
                          className="h-full min-h-[300px] w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full min-h-[300px] items-center justify-center accent-pink-bg text-muted-foreground">
                          <ImageOff className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center p-8 md:p-12 lg:col-span-3">
                      <div className="mb-4 flex flex-wrap gap-2">
                        <Badge className="rounded-full">Destaque</Badge>
                        {featuredNews.categoria.map((cat) => (
                          <Link
                            key={cat}
                            to={`/noticias/categoria/${slugifyCategory(cat)}`}
                            className="inline-flex items-center rounded-full border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
                          >
                            {cat}
                          </Link>
                        ))}
                      </div>
                      <h2 className="text-display mb-4 text-3xl font-semibold leading-tight text-foreground md:text-4xl">
                        {featuredNews.titulo}
                      </h2>
                      <p className="mb-6 leading-relaxed text-muted-foreground">
                        {featuredNews.descricao}
                      </p>
                      <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={16} />
                        {formatDate(featuredNews.data)}
                      </div>
                      <Button asChild className="w-fit rounded-full">
                        <Link to={`/noticias/${featuredNews.slug}`}>
                          Ler notícia completa
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </article>
                </AnimatedSection>
              </div>
            </section>
          )}

          <section className="section-padding bg-secondary pt-16">
            <div className="container-wide">
              {paginatedNews.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  Nenhuma outra notícia para exibir.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedNews.map((noticia, index) => (
                    <AnimatedSection key={noticia.id} delay={index * 0.08}>
                      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-lg">
                        <Link to={`/noticias/${noticia.slug}`} className="block h-48 bg-muted">
                          {noticia.imagem[0] ? (
                            <img
                              src={noticia.imagem[0]}
                              alt={noticia.titulo}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center accent-blue-bg text-muted-foreground">
                              <ImageOff className="h-8 w-8" />
                            </div>
                          )}
                        </Link>
                        <div className="flex flex-1 flex-col p-6">
                          <div className="mb-4 flex flex-wrap gap-2">
                            {noticia.categoria.map((cat) => (
                              <Link
                                key={cat}
                                to={`/noticias/categoria/${slugifyCategory(cat)}`}
                                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                              >
                                {cat}
                              </Link>
                            ))}
                          </div>
                          <h3 className="text-display mb-3 text-2xl font-semibold leading-tight text-foreground">
                            <Link to={`/noticias/${noticia.slug}`}>{noticia.titulo}</Link>
                          </h3>
                          <p className="mb-6 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                            {noticia.descricao}
                          </p>
                          <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-4">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar size={14} />
                              {formatDate(noticia.data)}
                            </span>
                            <Link
                              to={`/noticias/${noticia.slug}`}
                              className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-all duration-300 hover:gap-3"
                            >
                              Ler mais
                              <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </article>
                    </AnimatedSection>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <Pagination className="mt-12">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        size="default"
                        onClick={(event) => {
                          event.preventDefault();
                          changePage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </PaginationLink>
                    </PaginationItem>

                    {pageWindow.map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                          onClick={(event) => {
                            event.preventDefault();
                            changePage(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        size="default"
                        onClick={(event) => {
                          event.preventDefault();
                          changePage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </PaginationLink>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default Noticias;

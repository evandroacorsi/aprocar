import aboutImg from "@/assets/about-activities.jpg";
import donationImg from "@/assets/donation.jpg";
import fachada from "@/assets/fachada.jpeg";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo-remove-bg.png";
import AnimatedSection from "@/components/AnimatedSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { fetchPublicFaq, type FaqItem } from "@/lib/faq";
import { fetchPublicNews, type NewsSummary } from "@/lib/news";
import { fetchPublicPartners, type Partner } from "@/lib/partners";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Calendar,
  CircleHelp,
  FileText,
  Heart,
  Home,
  ImageOff,
  MessageCircle,
  Newspaper,
  Shield,
  Star,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const valores = [
  { icon: Heart, title: "Respeito", desc: "Reconhecemos a singularidade e a história de cada criança e adolescente.", color: "accent-pink" },
  { icon: Shield, title: "Ética", desc: "Atuamos com responsabilidade, transparência e compromisso social.", color: "accent-blue" },
  { icon: Users, title: "Cooperação", desc: "Acreditamos no trabalho em equipe e na construção coletiva do cuidado.", color: "accent-yellow" },
  { icon: Home, title: "Cuidado", desc: "Promovemos um ambiente acolhedor, protetivo e afetivo.", color: "accent-pink" },
  { icon: Star, title: "Compromisso", desc: "Investimos no crescimento emocional, social e cognitivo de cada indivíduo.", color: "accent-blue" },
];

const sitemapLinks = [
  {
    label: "Sobre a APROCAR",
    path: "/sobre",
    desc: "História, missão, valores, diretoria e equipe.",
    icon: Home,
    bgClass: "accent-blue-bg",
    iconClass: "accent-blue-text",
    borderClass: "hover:border-accent-blue/45",
  },
  {
    label: "Doações",
    path: "/doacoes",
    desc: "Formas de contribuir com a casa de acolhimento.",
    icon: Heart,
    bgClass: "accent-pink-bg",
    iconClass: "accent-pink-text",
    borderClass: "hover:border-accent-pink/45",
  },
  {
    label: "Transparência",
    path: "/transparencia",
    desc: "Documentos institucionais e prestação de contas.",
    icon: FileText,
    bgClass: "accent-yellow-bg",
    iconClass: "accent-yellow-text",
    borderClass: "hover:border-accent-yellow/55",
  },
  {
    label: "Notícias",
    path: "/noticias",
    desc: "Atualizações, comunicados e novidades da APROCAR.",
    icon: Newspaper,
    bgClass: "accent-blue-bg",
    iconClass: "accent-blue-text",
    borderClass: "hover:border-accent-blue/45",
  },
  {
    label: "Contato",
    path: "/contato",
    desc: "Telefone, e-mail, localização e formulário de contato.",
    icon: MessageCircle,
    bgClass: "accent-pink-bg",
    iconClass: "accent-pink-text",
    borderClass: "hover:border-accent-pink/45",
  },
];

const formatNewsDate = (date: string) => {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
};

const PartnerItem = ({ partner }: { partner: Partner }) => {
  const content = (
    <>
      <div className="mb-5 flex h-36 w-full items-center justify-center">
        {partner.foto ? (
          <img
            src={partner.foto}
            alt={partner.nome}
            loading="lazy"
            decoding="async"
            className="max-h-32 max-w-[220px] object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full accent-blue-bg transition-transform duration-300 group-hover:scale-105">
            <Building2 size={42} className="accent-blue-text" />
          </div>
        )}
      </div>
      <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-foreground md:text-xl">
        {partner.nome}
      </h3>
    </>
  );

  const className =
    "group flex min-h-56 flex-col items-center justify-center rounded-2xl p-5 text-center opacity-80 transition-all duration-300 hover:-translate-y-1 hover:bg-card/70 hover:opacity-100";

  if (partner.link) {
    return (
      <a
        href={partner.link}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={`Acessar site de ${partner.nome}`}
      >
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
};

const Index = () => {
  const [noticias, setNoticias] = useState<NewsSummary[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersCarouselApi, setPartnersCarouselApi] = useState<CarouselApi | null>(null);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);

  useEffect(() => {
    fetchPublicNews().then((posts) => setNoticias(posts.slice(0, 3)));
    fetchPublicPartners().then(setPartners);
    fetchPublicFaq().then(setFaqItems);
  }, []);

  useEffect(() => {
    if (!partnersCarouselApi || partners.length < 2) return;

    const interval = window.setInterval(() => {
      if (document.hidden) return;

      if (partnersCarouselApi.canScrollNext()) {
        partnersCarouselApi.scrollNext();
        return;
      }

      partnersCarouselApi.scrollTo(0);
    }, 1500);

    return () => window.clearInterval(interval);
  }, [partnersCarouselApi, partners.length]);

  return (
    <main>
      {/* HERO */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pb-12 pt-24 sm:pb-16 sm:pt-28 md:min-h-screen md:p-0">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Acolhimento e cuidado"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/72 via-foreground/56 to-foreground/78" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(23,42,74,0.88)_0%,rgba(23,42,74,0.62)_36%,rgba(23,42,74,0.16)_66%,transparent_84%)]" />
        </div>
        <div className="relative z-10 container-wide text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={logo}
              alt="APROCAR Casa de Acolhimento"
              className="mx-auto mb-6 h-24 w-auto drop-shadow-2xl sm:mb-8 sm:h-28 md:h-36"
            />
            <p className="mb-6 text-xs uppercase tracking-[0.18em] text-primary-foreground/95 font-body sm:mb-8 sm:text-sm sm:tracking-[0.3em]">
              Associação de Proteção à Criança e Adolescente de Rancharia
            </p>
            <h1 className="home-hero-title mx-auto mb-6 max-w-4xl text-primary-foreground sm:mb-8">
              Onde o cuidado se transforma em oportunidade de recomeço.
            </h1>
            <p className="editorial-body mx-auto mb-8 max-w-2xl text-primary-foreground/95 sm:mb-12">
              Desde 2001, acolhemos crianças e adolescentes com respeito, afeto e compromisso,
              garantindo proteção integral e oportunidades de desenvolvimento.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/sobre"
                className="inline-flex items-center gap-2 px-8 py-4 border border-primary-foreground/30 text-primary-foreground text-sm font-medium tracking-wide hover:bg-primary-foreground/10 transition-all duration-300 rounded-full"
              >
                Conheça a APROCAR
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/doacoes"
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent-yellow text-foreground text-sm font-medium tracking-wide hover:opacity-90 transition-all duration-300 rounded-full"
              >
                Faça uma doação
                <Heart size={16} />
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60" />
          </div>
        </motion.div>
      </section>

      {/* ABOUT EDITORIAL */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <AnimatedSection>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
                Sobre a instituição
              </p>
              <h2 className="editorial-title text-foreground mb-8">
                Uma história de<br />
                <span className="accent-yellow-text italic">cuidado</span> e proteção
              </h2>
              <p className="editorial-body mb-6">
                A APROCAR possui uma trajetória marcada pelo compromisso com o cuidado e a proteção
                da infância. Desde 1993, quando nasceu de uma iniciativa solidária de uma cidadã da
                comunidade, a instituição cresceu e se consolidou como referência local no acolhimento
                de crianças e adolescentes em situação de vulnerabilidade.
              </p>
              <p className="editorial-body mb-8">
                Oficialmente fundada em 2001, a APROCAR é uma entidade filantrópica que permanece
                ativa até os dias atuais, desenvolvendo um trabalho essencial na garantia de direitos.
              </p>
              <Link
                to="/sobre"
                className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-foreground hover:gap-4 transition-all duration-300"
              >
                Saiba mais
                <ArrowRight size={16} />
              </Link>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="relative">
                <div className="image-editorial-rounded">
                  <img
                    src={aboutImg}
                    alt="Crianças em atividades recreativas"
                    loading="lazy"
                    className="w-full h-[500px] lg:h-[600px] object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 accent-yellow-bg rounded-2xl -z-10" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* IMPACT BLOCK */}
      <section className="accent-blue-bg section-padding py-24 md:py-32">
        <div className="container-narrow text-center">
        <AnimatedSection>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
            Nosso impacto
          </p>
          <h2 className="editorial-subtitle text-foreground max-w-3xl mx-auto mb-8">
            Acolhemos crianças e adolescentes de
            <span className="accent-blue-text italic"> 0 a 17 anos, 11 meses e 29 dias</span>,
            assegurando proteção integral em um ambiente seguro, estruturado e afetivo.
          </h2>
          <p className="editorial-body max-w-2xl mx-auto">
            O atendimento é realizado sem qualquer tipo de discriminação, contemplando crianças
            e adolescentes independentemente de condição socioeconômica, etnia, religião, gênero
            ou presença de deficiência e necessidades específicas de saúde.
          </p>
        </AnimatedSection>
      </div>
      </section>

      {/* MISSION & VALUES */}
      <section className="section-padding">
        <div className="container-wide">
          <AnimatedSection>
            <div className="text-center mb-20">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
                Propósito
              </p>
              <h2 className="editorial-title text-foreground">
                Missão & <span className="accent-pink-text italic">Valores</span>
              </h2>
            </div>
          </AnimatedSection>

          {/* Mission */}
          <AnimatedSection>
            <div className="accent-pink-bg rounded-3xl p-10 md:p-16 mb-20 max-w-4xl mx-auto">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Nossa missão
              </p>
              <p className="editorial-subtitle text-foreground">
                Oferecer acolhimento seguro, respeitoso e afetivo a crianças e adolescentes,
                garantindo um ambiente que favoreça o cuidado integral, o fortalecimento de vínculos
                e o desenvolvimento humano.
              </p>
            </div>
          </AnimatedSection>

          {/* Values - redesigned as horizontal alternating list */}
          <div className="max-w-4xl mx-auto">
            {valores.map((value, i) => (
              <AnimatedSection key={value.title} delay={i * 0.08}>
                <div className={`flex items-start gap-6 py-8 ${i < valores.length - 1 ? "border-b border-border" : ""}`}>
                  <div className={`w-14 h-14 rounded-2xl ${value.color === "accent-pink" ? "accent-pink-bg" : value.color === "accent-blue" ? "accent-blue-bg" : "accent-yellow-bg"} flex items-center justify-center shrink-0`}>
                    <value.icon size={24} className={`${value.color}-text`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-display text-2xl font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="editorial-body text-base">{value.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FACHADA / INSTITUTION */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <AnimatedSection>
              <div className="image-editorial-rounded">
                <img
                  src={fachada}
                  alt="Fachada da APROCAR"
                  loading="lazy"
                  className="w-full h-[450px] object-cover"
                />
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
                Nossa sede
              </p>
              <h2 className="editorial-title text-foreground mb-8">
                Um espaço de<br />
                <span className="accent-blue-text italic">acolhimento</span>
              </h2>
              <p className="editorial-body">
                Localizada em Rancharia, a APROCAR oferece um ambiente seguro e estruturado
                para crianças e adolescentes, com atendimento 24 horas, alimentação balanceada
                e atividades recreativas para o desenvolvimento integral.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* DOAÇÕES */}
      <section className="section-padding accent-yellow-bg">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <AnimatedSection>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
                Como ajudar
              </p>
              <h2 className="editorial-title text-foreground mb-8">
                Sua ajuda<br />
                <span className="accent-yellow-text italic">transforma</span> vidas
              </h2>
              <p className="editorial-body mb-6">
                Existem diversas formas de apoiar a APROCAR. Desde doações de nota fiscal até a
                destinação do Imposto de Renda para o Fundo da Criança e do Adolescente —
                cada contribuição faz a diferença.
              </p>
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-yellow" />
                  <span className="text-foreground">Doação de nota fiscal</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-yellow" />
                  <span className="text-foreground">Destinação do Imposto de Renda ao Fundo da Criança e do Adolescente</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-yellow" />
                  <span className="text-foreground">Doações diretas e parcerias</span>
                </div>
              </div>
              <Link
                to="/doacoes"
                className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-primary-foreground text-sm font-medium tracking-wide hover:opacity-90 transition-all duration-300 rounded-full"
              >
                Saiba como ajudar
                <ArrowRight size={16} />
              </Link>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="image-editorial-rounded">
                <img
                  src={donationImg}
                  alt="Apoio e doação"
                  loading="lazy"
                  className="w-full h-[450px] object-cover"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* QUOTE BLOCK */}
      <section className="section-padding">
        <div className="container-narrow text-center">
          <AnimatedSection>
            <div className="py-8">
              <div className="w-16 h-0.5 bg-accent-yellow mx-auto mb-12" />
              <blockquote className="editorial-title text-foreground italic max-w-4xl mx-auto leading-snug">
                "Cada criança acolhida carrega uma história — e é no cuidado diário que construímos
                novas possibilidades de futuro."
              </blockquote>
              <div className="w-16 h-0.5 bg-accent-yellow mx-auto mt-12" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {partners.length > 0 && (
        <section className="section-padding bg-secondary">
          <div className="container-wide">
            <AnimatedSection>
              <div className="mx-auto mb-14 max-w-3xl text-center">
                <p className="mb-6 text-sm uppercase tracking-[0.3em] text-muted-foreground">
                  Rede de apoio
                </p>
                <h2 className="editorial-title text-foreground">
                  Nossos <span className="accent-blue-text italic">parceiros</span>
                </h2>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <Carousel
                setApi={setPartnersCarouselApi}
                opts={{
                  align: "start",
                  loop: partners.length > 3,
                }}
                className="mx-auto max-w-6xl"
              >
                <CarouselContent className="-ml-4">
                  {partners.map((partner) => (
                    <CarouselItem key={partner.id} className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <PartnerItem partner={partner} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {partners.length > 3 && (
                  <>
                    <CarouselPrevious className="left-0 top-[calc(100%+1.5rem)] translate-y-0 md:-left-12 md:top-1/2 md:-translate-y-1/2" />
                    <CarouselNext className="right-0 top-[calc(100%+1.5rem)] translate-y-0 md:-right-12 md:top-1/2 md:-translate-y-1/2" />
                  </>
                )}
              </Carousel>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ÚLTIMAS NOTÍCIAS */}
      <section className={`section-padding ${partners.length > 0 ? "bg-background" : "bg-secondary"}`}>
        <div className="container-wide">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
                  Atualizações
                </p>
                <h2 className="editorial-title text-foreground">
                  Últimas <span className="accent-pink-text italic">notícias</span>
                </h2>
              </div>
              <Link
                to="/noticias"
                className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-foreground hover:gap-4 transition-all duration-300 mt-6 md:mt-0"
              >
                Ver todas
                <ArrowRight size={16} />
              </Link>
            </div>
          </AnimatedSection>

          {noticias.length === 0 ? (
            <AnimatedSection>
              <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-muted-foreground">
                Nenhuma notícia publicada ainda.
              </div>
            </AnimatedSection>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {noticias.map((noticia, i) => (
                <AnimatedSection key={noticia.id} delay={i * 0.1}>
                  <article className="rounded-2xl bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                    <Link to={`/noticias/${noticia.slug}`} className="block h-44 bg-muted overflow-hidden">
                      {noticia.imagem[0] ? (
                        <img
                          src={noticia.imagem[0]}
                          alt={noticia.titulo}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full accent-pink-bg flex items-center justify-center text-muted-foreground">
                          <ImageOff size={28} />
                        </div>
                      )}
                    </Link>
                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        {noticia.categoria.slice(0, 1).map((categoria) => (
                          <span key={categoria} className="text-xs font-medium px-3 py-1 rounded-full accent-yellow-bg">
                            {categoria}
                          </span>
                        ))}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar size={12} />
                          {formatNewsDate(noticia.data)}
                        </span>
                      </div>
                      <h3 className="text-display text-xl font-semibold text-foreground mb-3">
                        <Link to={`/noticias/${noticia.slug}`}>{noticia.titulo}</Link>
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed flex-1 line-clamp-3">
                        {noticia.descricao}
                      </p>
                      <Link
                        to={`/noticias/${noticia.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-foreground mt-6 hover:gap-4 transition-all duration-300"
                      >
                        Ler mais
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* SITEMAP */}
      <section className="section-padding bg-accent-blue-soft/45">
        <div className="container-wide">
          <AnimatedSection>
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
                Explore
              </p>
              <h2 className="editorial-title text-foreground">
                Mapa do <span className="accent-blue-text italic">site</span>
              </h2>
              <p className="editorial-body mx-auto mt-6 max-w-2xl">
                Acesse rapidamente as principais áreas do site da APROCAR.
              </p>
            </div>
          </AnimatedSection>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
            {sitemapLinks.map((item, i) => (
              <AnimatedSection
                key={item.path}
                delay={i * 0.08}
                className={`h-full lg:col-span-2 ${i === 3 ? "lg:col-start-2" : ""}`}
              >
                <Link
                  to={item.path}
                  className={`soft-card group flex h-full min-h-48 flex-col justify-between p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${item.borderClass}`}
                >
                  <div>
                    <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${item.bgClass}`}>
                      <item.icon size={22} className={item.iconClass} />
                    </div>
                    <h3 className="mb-3 text-display text-2xl font-semibold text-foreground transition-colors group-hover:text-primary">
                      {item.label}
                    </h3>
                    <p className="text-base leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-all duration-300 group-hover:gap-3">
                    Acessar
                    <ArrowRight size={16} />
                  </span>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {faqItems.length > 0 && (
        <section className="section-padding bg-background">
          <div className="container-narrow">
            <AnimatedSection>
              <div className="mb-12 text-center">
                <p className="mb-6 text-sm uppercase tracking-[0.3em] text-muted-foreground">
                  Dúvidas comuns
                </p>
                <h2 className="editorial-title text-foreground">
                  Perguntas <span className="accent-yellow-text italic">frequentes</span>
                </h2>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <Accordion type="single" collapsible className="soft-card divide-y divide-border p-2 md:p-4">
                {faqItems.map((item) => (
                  <AccordionItem key={item.id} value={item.id} className="border-0 px-4">
                    <AccordionTrigger className="gap-4 py-7 text-left text-display text-[1.35rem] font-semibold leading-snug hover:no-underline md:text-2xl">
                      <span className="flex items-center gap-4">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl accent-yellow-bg">
                          <CircleHelp size={18} className="accent-yellow-text" />
                        </span>
                        <span>
                          {item.pergunta}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-0 text-lg leading-relaxed text-muted-foreground sm:pl-[4.25rem] md:text-xl">
                      <p className="whitespace-pre-line">{item.resposta}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* QUICK CONTACT */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <AnimatedSection>
            <p className="mb-6 text-sm uppercase tracking-[0.3em] text-primary-foreground/70">
              Fale conosco
            </p>
            <h2 className="editorial-subtitle mb-8 text-primary-foreground">
              Entre em contato
            </h2>
            <p className="mx-auto mb-12 max-w-lg text-base leading-relaxed text-primary-foreground/82 md:text-lg">
              Estamos à disposição para esclarecer dúvidas, receber doações ou simplesmente ouvir você.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/5518997319946"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-base font-semibold tracking-wide text-white transition-all duration-300 hover:opacity-90"
              >
                WhatsApp
                <ArrowRight size={16} />
              </a>
              <Link
                to="/contato"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-8 py-4 text-base font-semibold tracking-wide text-primary-foreground transition-all duration-300 hover:bg-primary-foreground hover:text-primary"
              >
                Formulário de contato
                <ArrowRight size={16} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Index;

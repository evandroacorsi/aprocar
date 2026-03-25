import { Link } from "react-router-dom";
import { ArrowRight, Heart, Shield, Users, Home, Star, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import heroBg from "@/assets/hero-bg.jpg";
import aboutImg from "@/assets/about-activities.jpg";
import donationImg from "@/assets/donation.jpg";
import fachada from "@/assets/fachada.jpeg";

const noticias = [
  {
    id: 1,
    title: "Declaração do Imposto de Renda 2026",
    excerpt: "A partir de 23/03/2026, você pode destinar parte do seu imposto para o Fundo da Criança e do Adolescente de Rancharia.",
    date: "Março 2026",
    tag: "Importante",
    tagColor: "accent-yellow-bg",
  },
  {
    id: 2,
    title: "APROCAR celebra mais de 20 anos de atuação",
    excerpt: "Desde 2001, a instituição se consolidou como referência local na proteção e acolhimento de crianças e adolescentes.",
    date: "2024",
    tag: "Institucional",
    tagColor: "accent-blue-bg",
  },
  {
    id: 3,
    title: "Doe sua nota fiscal e ajude a APROCAR",
    excerpt: "Saiba como a doação de notas fiscais pode gerar recursos para a instituição sem nenhum custo para você.",
    date: "2024",
    tag: "Doações",
    tagColor: "accent-pink-bg",
  },
];

const valores = [
  { icon: Heart, title: "Respeito", desc: "Reconhecemos a singularidade e a história de cada criança e adolescente.", color: "accent-pink" },
  { icon: Shield, title: "Ética", desc: "Atuamos com responsabilidade, transparência e compromisso social.", color: "accent-blue" },
  { icon: Users, title: "Cooperação", desc: "Acreditamos no trabalho em equipe e na construção coletiva do cuidado.", color: "accent-yellow" },
  { icon: Home, title: "Cuidado", desc: "Promovemos um ambiente acolhedor, protetivo e afetivo.", color: "accent-pink" },
  { icon: Star, title: "Compromisso", desc: "Investimos no crescimento emocional, social e cognitivo de cada indivíduo.", color: "accent-blue" },
];

const sitemapLinks = [
  { label: "Sobre a APROCAR", path: "/sobre", desc: "História, missão, valores e equipe" },
  { label: "Doações", path: "/doacoes", desc: "Formas de contribuir e apoiar" },
  { label: "Transparência", path: "/transparencia", desc: "Documentos e prestação de contas" },
  { label: "Notícias", path: "/noticias", desc: "Atualizações e novidades" },
  { label: "Contato", path: "/contato", desc: "Fale conosco e localização" },
];

const Index = () => {
  return (
    <main>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Acolhimento e cuidado"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/50" />
        </div>
        <div className="relative z-10 container-wide text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-primary-foreground/70 text-sm uppercase tracking-[0.3em] mb-8 font-body">
              Associação de Proteção à Criança e Adolescente de Rancharia
            </p>
            <h1 className="editorial-title text-primary-foreground max-w-4xl mx-auto mb-8">
              Onde o cuidado se transforma em oportunidade de recomeço.
            </h1>
            <p className="editorial-body text-primary-foreground/70 max-w-2xl mx-auto mb-12">
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
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
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
      <section className="accent-blue-bg section-padding py-24 md:py-32">        <div className="container-narrow text-center">
        <AnimatedSection>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
            Nosso impacto
          </p>
          <h2 className="editorial-subtitle text-foreground max-w-3xl mx-auto mb-8">
            Acolhemos crianças e adolescentes de
            <span className="accent-blue-text italic"> 0 a 17 anos</span>,
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
      <section className="section-padding bg-secondary">
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
                destinação do Imposto de Renda — cada contribuição faz a diferença.
              </p>
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-yellow" />
                  <span className="text-foreground">Doação de nota fiscal</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-yellow" />
                  <span className="text-foreground">Destinação do Imposto de Renda</span>
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

      {/* ÚLTIMAS NOTÍCIAS */}
      <section className="section-padding bg-secondary">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {noticias.map((noticia, i) => (
              <AnimatedSection key={noticia.id} delay={i * 0.1}>
                <article className="rounded-2xl bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  <div className={`h-2 ${noticia.tagColor}`} />
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${noticia.tagColor}`}>
                        {noticia.tag}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar size={12} />
                        {noticia.date}
                      </span>
                    </div>
                    <h3 className="text-display text-xl font-semibold text-foreground mb-3">
                      {noticia.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                      {noticia.excerpt}
                    </p>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>


      {/* SITEMAP */}
      <section className="section-padding">
        <div className="container-wide">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
                Explore
              </p>
              <h2 className="editorial-title text-foreground">
                Mapa do <span className="accent-blue-text italic">site</span>
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {sitemapLinks.map((item, i) => (
              <AnimatedSection key={item.path} delay={i * 0.08}>
                <Link
                  to={item.path}
                  className="group block p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-accent-yellow transition-all duration-300 text-center h-full"
                >
                  <h3 className="text-display text-lg font-semibold text-foreground mb-2 group-hover:accent-yellow-text transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK CONTACT */}
      <section className="section-padding bg-secondary">
        <div className="container-narrow text-center">
          <AnimatedSection>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Fale conosco
            </p>
            <h2 className="editorial-subtitle text-foreground mb-8">
              Entre em contato
            </h2>
            <p className="editorial-body mb-12 max-w-lg mx-auto">
              Estamos à disposição para esclarecer dúvidas, receber doações ou simplesmente ouvir você.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/5518997319946"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] text-[#fff] text-sm font-medium tracking-wide hover:opacity-90 transition-all duration-300 rounded-full"
              >
                WhatsApp
                <ArrowRight size={16} />
              </a>
              <Link
                to="/contato"
                className="inline-flex items-center gap-2 px-8 py-4 border border-foreground text-foreground text-sm font-medium tracking-wide hover:bg-foreground hover:text-primary-foreground transition-all duration-300 rounded-full"
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

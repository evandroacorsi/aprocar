import AnimatedSection from "@/components/AnimatedSection";
import { Calendar, ArrowRight } from "lucide-react";

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

const Noticias = () => {
  return (
    <main className="pt-20">
      <section className="section-padding">
        <div className="container-wide">
          <AnimatedSection>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Atualizações
            </p>
            <h1 className="editorial-title text-foreground max-w-3xl mb-8">
              Notícias e<br />
              <span className="accent-pink-text italic">novidades</span>
            </h1>
            <p className="editorial-body max-w-2xl">
              Acompanhe as últimas atualizações, eventos e informações relevantes da APROCAR.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <button className="inline-flex items-center gap-2 text-sm font-medium text-foreground mt-6 hover:gap-4 transition-all duration-300">
                      Ler mais
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow text-center">
          <AnimatedSection>
            <p className="text-muted-foreground mb-4">
              Em breve, mais notícias e atualizações serão publicadas aqui.
            </p>
            <p className="text-sm text-muted-foreground">
              Siga-nos no{" "}
              <a
                href="https://www.instagram.com/aprocaracolhimento"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline"
              >
                Instagram
              </a>{" "}
              para acompanhar as novidades.
            </p>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Noticias;

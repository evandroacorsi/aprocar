import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import transparenciaHero from "@/assets/transparencia2.jpg";
import { fetchPublicDocuments, groupDocumentsByCategory, type TransparencyDocument } from "@/lib/documents";
import { BookOpen, ExternalLink, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const fundamentosLegais = [
  {
    titulo: "Lei de Acesso à Informação",
    lei: "Lei nº 12.527/2011",
    desc: "Esta lei aplica-se às entidades privadas sem fins lucrativos que recebem recursos públicos para a realização de ações de interesse público.",
    href: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm",
  },
  {
    titulo: "Marco Regulatório (MROSC)",
    lei: "Lei nº 13.019/2014",
    desc: "Estabelece o regime jurídico das parcerias entre a administração pública e as organizações da sociedade civil (OSC).",
    href: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13019.htm",
  },
];

const Transparencia = () => {
  const [documents, setDocuments] = useState<TransparencyDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  useEffect(() => {
    fetchPublicDocuments()
      .then((items) => setDocuments(items))
      .catch(() => setDocuments([]))
      .finally(() => setLoadingDocuments(false));
  }, []);

  const groupedDocuments = useMemo(() => groupDocumentsByCategory(documents), [documents]);

  return (
    <main className="pt-24">
      <PageHero
        eyebrow="Transparência"
        title="Compromisso com a"
        highlight="transparência"
        description="A APROCAR preza pela transparência em todas as suas ações. Aqui você encontra documentos institucionais e informações sobre nossa gestão."
        image={transparenciaHero}
        imageAlt="Documentos de transparência da APROCAR"
        accentClass="accent-blue-text"
        imagePosition="center"
      />

      {/* Documents */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <AnimatedSection>
            <h2 className="editorial-subtitle text-foreground mb-12">
              Documentos institucionais
            </h2>
          </AnimatedSection>

          {loadingDocuments ? (
            <div className="max-w-4xl rounded-lg border bg-white p-8 text-center text-muted-foreground">
              Carregando documentos...
            </div>
          ) : groupedDocuments.length === 0 ? (
            <div className="soft-card max-w-4xl p-8 text-center text-muted-foreground">
              Nenhum documento publicado no momento.
            </div>
          ) : (
            <div className="max-w-5xl space-y-10">
              {groupedDocuments.map((group, groupIndex) => (
                <AnimatedSection key={group.categoria} delay={groupIndex * 0.06}>
                  <div>
                    <h3 className="mb-4 flex items-center gap-3 text-display text-2xl font-semibold text-foreground">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl accent-blue-bg">
                        <group.icon size={20} className="accent-blue-text" />
                      </span>
                      {group.categoria}
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {group.items.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.arquivo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="soft-card group flex items-center gap-4 p-6 transition-all duration-300 hover:shadow-lg"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl accent-blue-bg">
                            <FileText size={20} className="accent-blue-text" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="break-words font-medium text-foreground">{doc.nome}</p>
                            <p className="text-base text-muted-foreground">{doc.data}</p>
                          </div>
                          <ExternalLink size={16} className="shrink-0 text-foreground transition-transform group-hover:translate-x-1" />
                        </a>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Legal basis */}
      <section className="bg-background py-20 md:py-24 lg:py-28">
        <div className="container-wide">
          <AnimatedSection>
            <div className="mb-12 max-w-3xl">
              <p className="mb-6 text-sm uppercase tracking-[0.3em] text-muted-foreground">
                Transparência pública
              </p>
              <h2 className="editorial-subtitle text-foreground">
                Fundamentação Legal
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
            {fundamentosLegais.map((item, i) => (
              <AnimatedSection key={item.lei} delay={i * 0.08}>
                <article className="soft-card flex h-full flex-col p-8 transition-all duration-300 hover:shadow-xl">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl accent-blue-bg">
                    <BookOpen size={22} className="accent-blue-text" />
                  </div>
                  <h3 className="mb-2 text-display text-2xl font-semibold text-foreground">
                    {item.titulo}
                  </h3>
                  <p className="mb-5 text-base font-semibold text-primary">{item.lei}</p>
                  <p className="mb-8 flex-1 text-base leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-base font-semibold text-foreground transition-all duration-300 hover:gap-3"
                  >
                    Ler lei completa
                    <ExternalLink size={16} />
                  </a>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="section-padding">
        <div className="container-narrow">
          <AnimatedSection>
            <div className="soft-card accent-yellow-bg p-10 text-center md:p-16">
              <h2 className="editorial-subtitle text-foreground mb-6">
                Informações institucionais
              </h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Razão Social:</strong> APROCAR – Associação de Proteção à Criança e Adolescente de Rancharia</p>
                <p><strong className="text-foreground">CNPJ:</strong> 04.349.290/0001-34</p>
                <p><strong className="text-foreground">Natureza:</strong> Entidade filantrópica, sem fins lucrativos</p>
                <p><strong className="text-foreground">Fundação:</strong> 2001</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Transparencia;

import AnimatedSection from "@/components/AnimatedSection";
import { FileText, Download, ExternalLink } from "lucide-react";

const documentos = [
  { nome: "Balanço Anual", desc: "Prestação de contas financeira da instituição" },
  { nome: "Relatório de Atividades", desc: "Resumo das ações realizadas no período" },
  { nome: "Estatuto Social", desc: "Documento constitutivo da APROCAR" },
  { nome: "Ata de Eleição e Posse", desc: "Registro da eleição da diretoria" },
  { nome: "Cartão CNPJ", desc: "Cadastro Nacional da Pessoa Jurídica" },
];

const Transparencia = () => {
  return (
    <main className="pt-20">
      <section className="section-padding">
        <div className="container-wide">
          <AnimatedSection>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Transparência
            </p>
            <h1 className="editorial-title text-foreground max-w-3xl mb-8">
              Compromisso com a<br />
              <span className="accent-blue-text italic">transparência</span>
            </h1>
            <p className="editorial-body max-w-2xl">
              A APROCAR preza pela transparência em todas as suas ações.
              Aqui você encontra documentos institucionais e informações sobre nossa gestão.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Documents */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <AnimatedSection>
            <h2 className="editorial-subtitle text-foreground mb-12">
              Documentos institucionais
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            {documentos.map((doc, i) => (
              <AnimatedSection key={doc.nome} delay={i * 0.05}>
                <a
                  href="https://drive.google.com/drive/folders/1V3GvUKCudOnFWFvEDkHuuXH6KQWaFOiB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl accent-blue-bg flex items-center justify-center shrink-0">
                    <FileText size={20} className="accent-blue-text" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{doc.nome}</p>
                    <p className="text-muted-foreground text-sm">{doc.desc}</p>
                  </div>
                  <ExternalLink size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection>
            <div className="mt-12">
              <a
                href="https://drive.google.com/drive/folders/1V3GvUKCudOnFWFvEDkHuuXH6KQWaFOiB"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-primary-foreground text-sm font-medium tracking-wide hover:opacity-90 transition-all duration-300 rounded-full"
              >
                <Download size={16} />
                Acessar pasta de documentos
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Info */}
      <section className="section-padding">
        <div className="container-narrow">
          <AnimatedSection>
            <div className="p-10 md:p-16 rounded-3xl accent-yellow-bg text-center">
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

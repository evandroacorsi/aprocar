import AnimatedSection from "@/components/AnimatedSection";
import careImg from "@/assets/care.jpg";
import aboutImg from "@/assets/about-activities.jpg";
import { Heart, Shield, Users, Home, Star } from "lucide-react";

const diretoria = [
  { nome: "Érica Cristina Chezini Mellotti", cargo: "Presidente" },
  { nome: "Érica Maria Acorsi Lima", cargo: "Vice Presidente" },
  { nome: "Juliana Fernanda Gemente Thomé", cargo: "Secretária" },
  { nome: "Natanael Jose Ribeiro", cargo: "Tesoureiro" },
  { nome: "Vinicius Ferro Roberto", cargo: "Procurador Jurídico" },
];

const conselhoDeliberativo = [
  { nome: "Rachel de Almeida Calvo", cargo: "Presidente" },
  { nome: "Jansen Franco Branco", cargo: "Vice Presidente" },
  { nome: "Vanessa Cristina de Oliveira", cargo: "Secretária" },
];

const conselhoFiscal = [
  { nome: "Camila Reginato Pedro", cargo: "Conselheira" },
  { nome: "Soraya El Gharib Jorge Estevam", cargo: "Conselheira" },
  { nome: "Luzia Trova", cargo: "Conselheira" },
];

const colaboradores = [
  { nome: "Júlia Maria Dos Santos", cargo: "Coordenadora" },
  { nome: "Cristiane Lima da Silva", cargo: "Auxiliar Administrativo" },
  { nome: "Janaina S. Vieira Da Silva", cargo: "Psicóloga Institucional" },
  { nome: "Patrícia Altieri", cargo: "Educadora Social" },
  { nome: "Patrícia Peixoto da Cruz", cargo: "Assistente Social" },
  { nome: "Ana Maria Rodrigues Da Silva", cargo: "Auxiliar de Educador" },
  { nome: "Jeane Tenorio da Silva Sumida", cargo: "Auxiliar de Educador" },
  { nome: "Lourdes Pereira da Silva", cargo: "Auxiliar de Educador" },
  { nome: "Maria Auxiliadora da Silva", cargo: "Auxiliar de Educador" },
  { nome: "Maria Benedita de Oliveira Ribeiro", cargo: "Auxiliar de Educador" },
  { nome: "Valdeli Dos Santos Souza", cargo: "Auxiliar de Educador" },
  { nome: "Silvana Batista Moura", cargo: "Auxiliar de Cozinha" },
  { nome: "Karina Biaggio Roca Monti", cargo: "Nutricionista" },
];

const getInitials = (name: string) =>
  name.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

const getRoleColor = (cargo: string) => {
  if (cargo.includes("Coordenadora") || cargo.includes("Presidente")) return "from-accent-yellow to-accent-yellow/60";
  if (cargo.includes("Psicólog") || cargo.includes("Assistente") || cargo.includes("Educador")) return "from-accent-pink to-accent-pink/60";
  return "from-accent-blue to-accent-blue/60";
};

const getRoleBg = (cargo: string) => {
  if (cargo.includes("Coordenadora") || cargo.includes("Presidente")) return "accent-yellow-bg";
  if (cargo.includes("Psicólog") || cargo.includes("Assistente") || cargo.includes("Educador")) return "accent-pink-bg";
  return "accent-blue-bg";
};

const Sobre = () => {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="section-padding">
        <div className="container-wide">
          <AnimatedSection>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Sobre a APROCAR
            </p>
            <h1 className="editorial-title text-foreground max-w-3xl mb-8">
              Uma trajetória de<br />
              <span className="accent-yellow-text italic">compromisso</span> com a infância
            </h1>
            <p className="editorial-body max-w-2xl">
              Conheça a história, missão e valores que guiam nosso trabalho diário na proteção
              de crianças e adolescentes.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* History timeline */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <AnimatedSection>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
                Nossa história
              </p>
              <h2 className="editorial-subtitle text-foreground mb-12">
                De uma iniciativa solidária à referência em acolhimento
              </h2>

              <div className="space-y-12">
                {[
                  { year: "1993", title: "O início", desc: "Uma cidadã da comunidade de Rancharia iniciou ações de acolhimento voltadas a crianças e adolescentes em situação de vulnerabilidade." },
                  { year: "2000", title: "Parceria e crescimento", desc: "Com o crescimento da demanda, a Prefeitura Municipal e a Igreja Batista colaboraram na organização e manutenção do atendimento." },
                  { year: "2001", title: "Fundação oficial", desc: "O CMDCA impulsionou a criação da APROCAR, constituindo-se como entidade filantrópica com estatuto registrado em cartório." },
                  { year: "Hoje", title: "Referência local", desc: "Com 11 gestões, a APROCAR se mantém como referência no acolhimento, atuando de forma integrada com a rede de garantia de direitos." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full accent-yellow-bg flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-foreground">{item.year}</span>
                      </div>
                      {i < 3 && <div className="w-px h-full bg-border mt-2" />}
                    </div>
                    <div className="pb-2">
                      <h3 className="text-display text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="sticky top-28">
                <div className="image-editorial-rounded">
                  <img src={careImg} alt="Cuidado e acolhimento" loading="lazy" className="w-full h-[500px] object-cover" />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding">
        <div className="container-narrow text-center">
          <AnimatedSection>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Nossa missão
            </p>
            <h2 className="editorial-subtitle text-foreground max-w-3xl mx-auto mb-8">
              Oferecer acolhimento seguro, respeitoso e afetivo a crianças e adolescentes,
              garantindo um ambiente que favoreça o cuidado integral, o fortalecimento de vínculos
              e o desenvolvimento humano em todas as suas dimensões.
            </h2>
          </AnimatedSection>
        </div>
      </section>

      {/* Values - redesigned as clean list */}
      <section className="section-padding accent-pink-bg">
        <div className="container-wide">
          <AnimatedSection>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6 text-center">
              Nossos valores
            </p>
            <h2 className="editorial-title text-foreground text-center mb-16">
              O que nos <span className="accent-pink-text italic">move</span>
            </h2>
          </AnimatedSection>

          <div className="max-w-3xl mx-auto">
            {[
              { icon: Heart, title: "Respeito", desc: "Reconhecemos a singularidade e a história de cada criança e adolescente." },
              { icon: Shield, title: "Ética", desc: "Atuamos com responsabilidade, transparência e compromisso social." },
              { icon: Users, title: "Cooperação", desc: "Acreditamos no trabalho em equipe e na construção coletiva do cuidado." },
              { icon: Home, title: "Cuidado", desc: "Promovemos um ambiente acolhedor, protetivo e afetivo." },
              { icon: Star, title: "Compromisso com o desenvolvimento", desc: "Investimos no crescimento emocional, social e cognitivo de cada indivíduo." },
            ].map((value, i) => (
              <AnimatedSection key={value.title} delay={i * 0.08}>
                <div className={`flex items-start gap-6 py-8 ${i < 4 ? "border-b border-border" : ""}`}>
                  <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                    <value.icon size={22} className="accent-pink-text" />
                  </div>
                  <div>
                    <h3 className="text-display text-2xl font-semibold mb-2 text-foreground">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{value.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Public */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <div className="image-editorial-rounded">
                <img src={aboutImg} alt="Público atendido" loading="lazy" className="w-full h-[450px] object-cover" />
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
                Público atendido
              </p>
              <h2 className="editorial-subtitle text-foreground mb-6">
                Crianças e adolescentes de 0 a 17 anos
              </h2>
              <p className="editorial-body mb-4">
                A APROCAR realiza o acolhimento institucional assegurando proteção integral
                em um ambiente seguro, estruturado e afetivo.
              </p>
              <p className="editorial-body">
                O atendimento é realizado sem qualquer tipo de discriminação, contemplando
                crianças e adolescentes independentemente de condição socioeconômica, etnia,
                religião, gênero, orientação sexual ou presença de deficiência.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Institution type */}
      <section className="section-padding accent-blue-bg">
        <div className="container-narrow text-center">
          <AnimatedSection>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Tipo de instituição
            </p>
            <h2 className="editorial-subtitle text-foreground max-w-3xl mx-auto mb-6">
              Entidade filantrópica, de caráter privado e sem fins lucrativos
            </h2>
            <p className="editorial-body max-w-2xl mx-auto">
              Constituída com o objetivo de atuar na proteção e garantia de direitos de crianças
              e adolescentes, em articulação com o poder público e integração com a rede socioassistencial.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* EQUIPE - Diretoria */}
      <section className="section-padding">
        <div className="container-wide">
          <AnimatedSection>
            <div className="text-center mb-20">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
                Nossa Equipe
              </p>
              <h2 className="editorial-title text-foreground">
                As pessoas por trás do <span className="accent-pink-text italic">cuidado</span>
              </h2>
            </div>
          </AnimatedSection>

          {/* Diretoria */}
          <AnimatedSection>
            <h3 className="text-display text-2xl font-semibold text-foreground mb-10 flex items-center gap-3">
              <div className="w-8 h-1 bg-accent-yellow rounded-full" />
              Diretoria
            </h3>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
            {diretoria.map((p, i) => (
              <AnimatedSection key={p.nome} delay={i * 0.05}>
                <div className="relative group p-6 rounded-2xl border border-border bg-card hover:shadow-xl transition-all duration-500 overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getRoleColor(p.cargo)}`} />
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${getRoleBg(p.cargo)} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                      <span className="text-foreground text-sm font-bold">{getInitials(p.nome)}</span>
                    </div>
                    <div>
                      <p className="text-foreground font-semibold">{p.nome}</p>
                      <p className="text-muted-foreground text-sm">{p.cargo}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Conselhos side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            <div>
              <AnimatedSection>
                <h3 className="text-display text-2xl font-semibold text-foreground mb-10 flex items-center gap-3">
                  <div className="w-8 h-1 bg-accent-blue rounded-full" />
                  Conselho Deliberativo
                </h3>
              </AnimatedSection>
              <div className="space-y-4">
                {conselhoDeliberativo.map((p, i) => (
                  <AnimatedSection key={p.nome} delay={i * 0.05}>
                    <div className="relative group p-5 rounded-2xl border border-border bg-card hover:shadow-xl transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-blue to-accent-blue/60" />
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl accent-blue-bg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                          <span className="text-foreground text-xs font-bold">{getInitials(p.nome)}</span>
                        </div>
                        <div>
                          <p className="text-foreground font-semibold text-sm">{p.nome}</p>
                          <p className="text-muted-foreground text-xs">{p.cargo}</p>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
            <div>
              <AnimatedSection>
                <h3 className="text-display text-2xl font-semibold text-foreground mb-10 flex items-center gap-3">
                  <div className="w-8 h-1 bg-accent-pink rounded-full" />
                  Conselho Fiscal
                </h3>
              </AnimatedSection>
              <div className="space-y-4">
                {conselhoFiscal.map((p, i) => (
                  <AnimatedSection key={p.nome} delay={i * 0.05}>
                    <div className="relative group p-5 rounded-2xl border border-border bg-card hover:shadow-xl transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-pink to-accent-pink/60" />
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl accent-pink-bg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                          <span className="text-foreground text-xs font-bold">{getInitials(p.nome)}</span>
                        </div>
                        <div>
                          <p className="text-foreground font-semibold text-sm">{p.nome}</p>
                          <p className="text-muted-foreground text-xs">{p.cargo}</p>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>

          {/* Colaboradores */}
          <AnimatedSection>
            <h3 className="text-display text-2xl font-semibold text-foreground mb-10 flex items-center gap-3">
              <div className="w-8 h-1 bg-accent-pink rounded-full" />
              Colaboradores
            </h3>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colaboradores.map((p, i) => (
              <AnimatedSection key={p.nome} delay={i * 0.03}>
                <div className="relative group p-5 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-500 overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getRoleColor(p.cargo)}`} />
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl ${getRoleBg(p.cargo)} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                      <span className="text-foreground text-xs font-bold">{getInitials(p.nome)}</span>
                    </div>
                    <div>
                      <p className="text-foreground font-medium text-sm">{p.nome}</p>
                      <p className="text-muted-foreground text-xs">{p.cargo}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Sobre;

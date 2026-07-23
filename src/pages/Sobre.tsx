import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import careImg from "@/assets/care.jpg";
import aboutImg from "@/assets/about-activities.jpg";
import fachadaImg from "@/assets/fachada.jpeg";
import { fetchPublicTeam, groupTeamByArea, initialTeam, type TeamMember } from "@/lib/team";
import { Heart, Shield, Users, Home, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const getInitials = (name: string) =>
  name.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

const getRoleColor = (member: TeamMember) => {
  if (member.area.includes("Diretoria") || member.cargo.includes("Coordenadora")) return "from-accent-yellow to-accent-yellow/60";
  if (member.area.includes("Fiscal") || member.cargo.includes("Psicólog") || member.cargo.includes("Assistente") || member.cargo.includes("Educador")) return "from-accent-pink to-accent-pink/60";
  return "from-accent-blue to-accent-blue/60";
};

const getRoleBg = (member: TeamMember) => {
  if (member.area.includes("Diretoria") || member.cargo.includes("Coordenadora")) return "accent-yellow-bg";
  if (member.area.includes("Fiscal") || member.cargo.includes("Psicólog") || member.cargo.includes("Assistente") || member.cargo.includes("Educador")) return "accent-pink-bg";
  return "accent-blue-bg";
};

const getAreaLineColor = (area: string) => {
  if (area.includes("Diretoria")) return "bg-accent-yellow";
  if (area.includes("Fiscal")) return "bg-accent-pink";
  return "bg-accent-blue";
};

const TeamCard = ({
  member,
  compact = false,
  onPhotoClick,
}: {
  member: TeamMember;
  compact?: boolean;
  onPhotoClick: (member: TeamMember) => void;
}) => (
  <div className={`soft-card relative group overflow-hidden ${compact ? "p-5" : "p-6"} transition-all duration-500 hover:shadow-xl`}>
    <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${getRoleColor(member)}`} />
    <div className="flex items-center gap-4">
      {member.foto ? (
        <button
          type="button"
          className={`${compact ? "h-12 w-12 rounded-xl" : "h-14 w-14 rounded-2xl"} shrink-0 overflow-hidden cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
          onClick={() => onPhotoClick(member)}
          aria-label={`Ampliar foto de ${member.nome}`}
          title={`Ampliar foto de ${member.nome}`}
        >
          <img
            src={member.foto}
            alt={member.nome}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </button>
      ) : (
        <div className={`${compact ? "h-12 w-12 rounded-xl" : "h-14 w-14 rounded-2xl"} ${getRoleBg(member)} flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
          <span className={`text-foreground ${compact ? "text-xs" : "text-sm"} font-bold`}>
            {getInitials(member.nome)}
          </span>
        </div>
      )}
      <div className="min-w-0">
        <p className={`break-words text-foreground ${compact ? "text-sm" : ""} font-semibold`}>
          {member.nome}
        </p>
        <p className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>{member.cargo}</p>
      </div>
    </div>
  </div>
);

const Sobre = () => {
  const [equipe, setEquipe] = useState<TeamMember[]>(initialTeam);
  const [selectedPhotoMember, setSelectedPhotoMember] = useState<TeamMember | null>(null);

  const loadTeam = useCallback(() => {
    fetchPublicTeam()
      .then((team) => {
        if (team.length > 0) setEquipe(team);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    loadTeam();

    const handleFocus = () => loadTeam();
    const handleVisibilityChange = () => {
      if (!document.hidden) loadTeam();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadTeam]);

  const equipePorArea = useMemo(() => groupTeamByArea(equipe), [equipe]);

  return (
    <main className="pt-24">
      <PageHero
        eyebrow="Sobre a APROCAR"
        title="Uma trajetória de"
        highlight="compromisso"
        suffix="com a infância"
        description="Conheça a história, missão e valores que guiam nosso trabalho diário na proteção de crianças e adolescentes."
        image={fachadaImg}
        imageAlt="Fachada da APROCAR"
        accentClass="accent-yellow-text"
        imagePosition="center"
      />

      {/* History timeline */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
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
                        <span className="text-sm font-bold text-foreground">{item.year}</span>
                      </div>
                      {i < 3 && <div className="w-px h-full bg-border mt-2" />}
                    </div>
                    <div className="pb-2">
                      <h3 className="text-display text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-base leading-relaxed text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="lg:pl-4">
                <div className="image-editorial-rounded">
                  <img src={careImg} alt="Cuidado e acolhimento" loading="lazy" className="h-[420px] w-full object-cover object-center md:h-[520px]" />
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
                    <p className="text-base leading-relaxed text-muted-foreground">{value.desc}</p>
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
                Crianças e adolescentes de 0 a 17 anos, 11 meses e 29 dias
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

      {/* Team */}
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

          <div className="space-y-20">
            {equipePorArea.map((grupo) => {
              const compact = grupo.membros.length <= 3;
              return (
                <div key={grupo.area}>
                  <AnimatedSection>
                    <h3 className="mb-10 flex items-center gap-3 text-display text-2xl font-semibold text-foreground">
                      <div className={`h-1 w-8 rounded-full ${getAreaLineColor(grupo.area)}`} />
                      {grupo.area}
                    </h3>
                  </AnimatedSection>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {grupo.membros.map((member, index) => (
                      <AnimatedSection key={member.id} delay={index * 0.04}>
                        <TeamCard
                          member={member}
                          compact={compact}
                          onPhotoClick={setSelectedPhotoMember}
                        />
                      </AnimatedSection>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Dialog
        open={!!selectedPhotoMember}
        onOpenChange={(open) => {
          if (!open) setSelectedPhotoMember(null);
        }}
      >
        <DialogContent className="max-w-[min(92vw,760px)] border-0 bg-transparent p-0 shadow-none [&>button]:right-3 [&>button]:top-3 [&>button]:rounded-full [&>button]:bg-white/90 [&>button]:p-2 [&>button]:text-foreground">
          <DialogTitle className="sr-only">
            {selectedPhotoMember ? `Foto de ${selectedPhotoMember.nome}` : "Foto ampliada"}
          </DialogTitle>
          {selectedPhotoMember?.foto && (
            <div className="overflow-hidden rounded-lg bg-background shadow-2xl">
              <div className="bg-black">
                <img
                  src={selectedPhotoMember.foto}
                  alt={selectedPhotoMember.nome}
                  className="max-h-[78vh] w-full object-contain"
                />
              </div>
              <div className="p-4">
                <p className="font-semibold text-foreground">{selectedPhotoMember.nome}</p>
                <p className="text-sm text-muted-foreground">{selectedPhotoMember.cargo}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Sobre;

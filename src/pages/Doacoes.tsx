import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import donationHero from "@/assets/doações.jpg";
import { Heart, FileText, Receipt, ArrowRight } from "lucide-react";

const Doacoes = () => {
  return (
    <main className="pt-24">
      <PageHero
        eyebrow="Como ajudar"
        title="Cada gesto de"
        highlight="generosidade"
        suffix="conta"
        description="Existem diversas formas de apoiar a APROCAR e contribuir com a proteção de crianças e adolescentes. Conheça as opções e escolha a que melhor se encaixa para você."
        image={donationHero}
        imageAlt="Apoio e doações para a APROCAR"
        accentClass="accent-yellow-text"
        imagePosition="center"
      />

      {/* Nota Fiscal */}
      <section className="section-padding accent-yellow-bg">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <AnimatedSection>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center">
                  <Receipt size={28} className="accent-yellow-text" />
                </div>
                <h2 className="editorial-subtitle text-foreground">Doação de Nota Fiscal</h2>
              </div>
              <div className="space-y-4 editorial-body">
                <p>
                  Ao fazer compras, você pode destinar suas notas fiscais à APROCAR. Os créditos
                  gerados são revertidos em recursos para a instituição — sem custo algum para você.
                </p>
                <p>
                  É uma forma simples e prática de ajudar: basta guardar suas notas fiscais e enviá-las
                  para a APROCAR. Você pode enviar a foto da notinha diretamente pelo WhatsApp para que
                  nossa equipe lance no sistema.
                </p>
              </div>
              <div className="mt-8">
                <a
                  href="https://wa.me/5518997319946?text=Olá! Gostaria de enviar minha nota fiscal para doação."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-primary-foreground text-sm font-medium tracking-wide hover:opacity-90 transition-all duration-300 rounded-full"
                >
                  Enviar nota por WhatsApp
                  <ArrowRight size={16} />
                </a>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="soft-card p-8 md:p-12">
                <h3 className="text-display text-xl font-semibold text-foreground mb-6">
                  Como funciona?
                </h3>
                <div className="space-y-6">
                  {[
                    { step: "01", text: "Faça suas compras normalmente e peça a nota fiscal" },
                    { step: "02", text: "Tire uma foto da nota fiscal" },
                    { step: "03", text: "Envie a foto pelo WhatsApp para a APROCAR" },
                    { step: "04", text: "Nossa equipe lança no sistema e os créditos são revertidos para a instituição" },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <span className="text-display text-2xl font-bold accent-yellow-text shrink-0">
                        {item.step}
                      </span>
                      <p className="text-muted-foreground text-sm leading-relaxed pt-1">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Imposto de Renda */}
      <section className="section-padding">
        <div className="container-narrow">
          <AnimatedSection>
            <div className="soft-card accent-blue-bg p-10 md:p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center mx-auto mb-8">
                <FileText size={28} className="accent-blue-text" />
              </div>
              <h2 className="editorial-subtitle text-foreground mb-6">
                Destinação do Imposto de Renda
              </h2>
              <p className="editorial-body max-w-2xl mx-auto mb-6">
                No dia 23/03/2026, começa a Declaração do Imposto de Renda. Quem declara pode
                destinar parte do imposto, <strong className="text-foreground">sem pagar nada a mais</strong>,
                para o Fundo da Criança e do Adolescente de Rancharia.
              </p>
              <div className="p-6 rounded-2xl bg-card border border-border max-w-xl mx-auto mb-8">
                <p className="text-foreground font-medium">
                  ✅ Seu imposto pode ficar na cidade e ajudar quem mais precisa.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Na hora da declaração, avise seu contador que deseja fazer a destinação.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="flex min-h-[50svh] items-center bg-foreground py-16 text-primary-foreground md:min-h-[calc(100svh-24rem)] md:py-20">
        <div className="container-narrow text-center">
          <AnimatedSection>
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
              <Heart size={40} className="accent-pink-text" />
            </div>
            <h2 className="hero-title mx-auto mb-8 max-w-4xl text-primary-foreground">
              Toda ajuda faz a diferença
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-primary-foreground/78 md:text-xl">
              Entre em contato para saber mais sobre como você pode contribuir com a APROCAR.
            </p>
            <a
              href="https://wa.me/5518997319946"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent-yellow px-8 py-4 text-base font-semibold tracking-wide text-foreground transition-all duration-300 hover:opacity-90"
            >
              Fale conosco no WhatsApp
              <ArrowRight size={16} />
            </a>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Doacoes;

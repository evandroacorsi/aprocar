import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import donationImg from "@/assets/donation.jpg";
import { Heart, FileText, Receipt, ArrowRight } from "lucide-react";

const Doacoes = () => {
  return (
    <main className="pt-20">
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <AnimatedSection>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
                Como ajudar
              </p>
              <h1 className="editorial-title text-foreground mb-8">
                Cada gesto de<br />
                <span className="accent-yellow-text italic">generosidade</span> conta
              </h1>
              <p className="editorial-body">
                Existem diversas formas de apoiar a APROCAR e contribuir com a proteção de
                crianças e adolescentes. Conheça as opções e escolha a que melhor se encaixa
                para você.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="image-editorial-rounded">
                <img src={donationImg} alt="Doação" loading="lazy" className="w-full h-[400px] object-cover" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

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
              <div className="p-8 md:p-12 rounded-3xl bg-card border border-border">
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
            <div className="p-10 md:p-16 rounded-3xl accent-blue-bg text-center">
              <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center mx-auto mb-8">
                <FileText size={28} className="accent-blue-text" />
              </div>
              <h2 className="editorial-subtitle text-foreground mb-6">
                Destinação do Imposto de Renda
              </h2>
              <p className="editorial-body max-w-2xl mx-auto mb-6">
                No dia 23/03/2026, começa a Declaração do Imposto de Renda. Quem declara pode
                destinar parte do imposto, <strong className="text-foreground">sem pagar nada a mais</strong>,
                para o Fundo da Criança e do Adolescente e para o Fundo do Idoso de Rancharia.
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
      <section className="section-padding bg-foreground">
        <div className="container-narrow text-center">
          <AnimatedSection>
            <Heart size={40} className="accent-pink-text mx-auto mb-8" />
            <h2 className="editorial-title text-primary-foreground mb-8">
              Toda ajuda faz a diferença
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-12 max-w-xl mx-auto">
              Entre em contato para saber mais sobre como você pode contribuir com a APROCAR.
            </p>
            <a
              href="https://wa.me/5518997319946"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent-yellow text-foreground text-sm font-medium tracking-wide hover:opacity-90 transition-all duration-300 rounded-full"
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

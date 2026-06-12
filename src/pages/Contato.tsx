import { useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import contatoHero from "@/assets/contato.jpg";
import { Phone, Mail, MapPin, Send, Instagram, Facebook } from "lucide-react";

const Contato = () => {
  const [formData, setFormData] = useState({ nome: "", telefone: "", mensagem: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contato de ${formData.nome}`);
    const body = encodeURIComponent(`Nome: ${formData.nome}\nTelefone: ${formData.telefone}\n\n${formData.mensagem}`);
    window.location.href = `mailto:casadeacolhimentoaprocar@yahoo.com.br?subject=${subject}&body=${body}`;
  };

  return (
    <main className="pt-24">
      <PageHero
        eyebrow="Fale conosco"
        title="Entre em"
        highlight="contato"
        description="Estamos à disposição para esclarecer dúvidas, receber doações ou ouvir você."
        image={contatoHero}
        imageAlt="Atendimento e contato da APROCAR"
        accentClass="accent-blue-text"
        imagePosition="center"
      />

      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="grid grid-cols-1 items-stretch gap-16 lg:grid-cols-2 lg:gap-24">
            {/* Form */}
            <AnimatedSection className="h-full">
              <div className="soft-card h-full p-8 md:p-10">
              <h2 className="editorial-subtitle text-foreground mb-8">Envie uma mensagem</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="mb-2 block text-base font-medium text-foreground">Nome</label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-base font-medium text-foreground">Telefone</label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-base font-medium text-foreground">Mensagem</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/30 resize-none"
                    placeholder="Como podemos ajudar?"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-base font-medium tracking-wide text-primary-foreground transition-all duration-300 hover:opacity-90"
                >
                  <Send size={16} />
                  Enviar mensagem
                </button>
              </form>
              </div>
            </AnimatedSection>

            {/* Info */}
            <AnimatedSection delay={0.2} className="h-full">
              <div className="soft-card flex h-full flex-col p-8 md:p-10">
              <h2 className="editorial-subtitle text-foreground mb-8">Informações</h2>
              <div className="space-y-6">
                <a href="tel:+5518997319946" className="flex items-center gap-4 rounded-2xl border border-border bg-background/80 p-5 transition-shadow hover:shadow-md">
                  <div className="w-11 h-11 rounded-full accent-blue-bg flex items-center justify-center shrink-0">
                    <Phone size={18} className="accent-blue-text" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">(18) 99731-9946</p>
                  </div>
                </a>

                <a href="mailto:casadeacolhimentoaprocar@yahoo.com.br" className="flex items-center gap-4 rounded-2xl border border-border bg-background/80 p-5 transition-shadow hover:shadow-md">
                  <div className="w-11 h-11 rounded-full accent-yellow-bg flex items-center justify-center shrink-0">
                    <Mail size={18} className="accent-yellow-text" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">E-mail</p>
                    <p className="text-sm text-muted-foreground">casadeacolhimentoaprocar@yahoo.com.br</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 rounded-2xl border border-border bg-background/80 p-5">
                  <div className="w-11 h-11 rounded-full accent-pink-bg flex items-center justify-center shrink-0">
                    <MapPin size={18} className="accent-pink-text" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">Endereço</p>
                    <p className="text-sm text-muted-foreground">Rua Leoncio Vieira Dos Santos, nº 1345 – Vila Guaçu, Rancharia - SP</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-10">
                <p className="mb-4 text-base font-medium text-foreground">Redes sociais</p>
                <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/aprocar.rancharia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://www.facebook.com/share/1Ai8MSwq3P/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <Facebook size={18} />
                </a>
                </div>
              </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="overflow-hidden border-y border-border shadow-[0_18px_60px_rgba(30,64,75,0.08)]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3704.558!2d-50.8935!3d-22.2388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDE0JzE5LjciUyA1MMKwNTMnMzYuNiJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
            width="100%"
            height="500"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização APROCAR"
            className="block min-h-[440px] w-full"
          />
        </div>
      </section>
    </main>
  );
};

export default Contato;

import { useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";
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
    <main className="pt-20">
      <section className="section-padding">
        <div className="container-wide">
          <AnimatedSection>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Fale conosco
            </p>
            <h1 className="editorial-title text-foreground max-w-3xl mb-8">
              Entre em<br />
              <span className="accent-blue-text italic">contato</span>
            </h1>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Form */}
            <AnimatedSection>
              <h2 className="editorial-subtitle text-foreground mb-8">Envie uma mensagem</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Nome</label>
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
                  <label className="text-sm font-medium text-foreground mb-2 block">Telefone</label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Mensagem</label>
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
                  className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-primary-foreground text-sm font-medium tracking-wide hover:opacity-90 transition-all duration-300 rounded-full"
                >
                  <Send size={16} />
                  Enviar mensagem
                </button>
              </form>
            </AnimatedSection>

            {/* Info + Map */}
            <AnimatedSection delay={0.2}>
              <h2 className="editorial-subtitle text-foreground mb-8">Informações</h2>
              <div className="space-y-6 mb-12">
                <a href="tel:+5518997319946" className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-full accent-blue-bg flex items-center justify-center shrink-0">
                    <Phone size={18} className="accent-blue-text" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium text-sm">WhatsApp</p>
                    <p className="text-muted-foreground text-xs">(18) 99731-9946</p>
                  </div>
                </a>

                <a href="mailto:casadeacolhimentoaprocar@yahoo.com.br" className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-full accent-yellow-bg flex items-center justify-center shrink-0">
                    <Mail size={18} className="accent-yellow-text" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium text-sm">E-mail</p>
                    <p className="text-muted-foreground text-xs">casadeacolhimentoaprocar@yahoo.com.br</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card">
                  <div className="w-11 h-11 rounded-full accent-pink-bg flex items-center justify-center shrink-0">
                    <MapPin size={18} className="accent-pink-text" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium text-sm">Endereço</p>
                    <p className="text-muted-foreground text-xs">Rua Leoncio Vieira Dos Santos, nº 1345 – Vila Guaçu, Rancharia - SP</p>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div className="flex gap-4 mb-12">
                <a
                  href="https://www.instagram.com/aprocaracolhimento"
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

              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3704.558!2d-50.8935!3d-22.2388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDE0JzE5LjciUyA1MMKwNTMnMzYuNiJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização APROCAR"
                />
              </div>
              <a
                href="https://www.google.com/maps/search/Rua+Leoncio+Vieira+Dos+Santos+1345+Vila+Guaçu+Rancharia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
              >
                <MapPin size={14} />
                Abrir no Google Maps
              </a>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contato;

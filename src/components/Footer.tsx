import { Link } from "react-router-dom";
import { Heart, Instagram, Facebook, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-display text-2xl font-semibold mb-4">APROCAR</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              Associação de Proteção à Criança e Adolescente de Rancharia
            </p>
            <p className="text-primary-foreground/50 text-xs">
              CNPJ: 04.349.290/0001-34
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-6 text-primary-foreground/50">
              Navegação
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { label: "Sobre", path: "/sobre" },
                { label: "Doações", path: "/doacoes" },
                { label: "Transparência", path: "/transparencia" },
                { label: "Notícias", path: "/noticias" },
                { label: "Contato", path: "/contato" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-6 text-primary-foreground/50">
              Contato
            </h4>
            <div className="flex flex-col gap-4 text-sm text-primary-foreground/70">
              <a href="tel:+5518997319946" className="flex items-center gap-3 hover:text-primary-foreground transition-colors">
                <Phone size={16} />
                (18) 99731-9946
              </a>
              <a href="mailto:casadeacolhimentoaprocar@yahoo.com.br" className="flex items-center gap-3 hover:text-primary-foreground transition-colors">
                <Mail size={16} />
                casadeacolhimentoaprocar@yahoo.com.br
              </a>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                Rua Leoncio Vieira Dos Santos, nº 1345 – Vila Guaçu, Rancharia - SP
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-6 text-primary-foreground/50">
              Redes Sociais
            </h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/aprocaracolhimento"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/10 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.facebook.com/share/1Ai8MSwq3P/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/10 transition-colors"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} APROCAR. Todos os direitos reservados.
          </p>
          <p className="text-xs text-primary-foreground/40 flex items-center gap-1">
            Feito com <Heart size={12} className="accent-pink-text" /> para quem mais precisa
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import logo from "@/assets/logo-remove-bg.png";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container-wide py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img src={logo} alt="APROCAR" className="mb-5 h-24 w-auto drop-shadow-lg" />
            <p className="text-primary-foreground/80 mb-6 text-base leading-relaxed">
              Associação de Proteção à Criança e Adolescente de Rancharia
            </p>
            <p className="text-sm text-primary-foreground/65">
              CNPJ: 04.349.290/0001-34
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-6 text-primary-foreground/65">
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
                  className="text-base text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-6 text-primary-foreground/65">
              Contato
            </h4>
            <div className="flex flex-col gap-4 text-base text-primary-foreground/80">
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
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-6 text-primary-foreground/65">
              Redes Sociais
            </h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/aprocar.rancharia"
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

        <div className="mt-10 flex flex-col items-center justify-center gap-4 border-t border-primary-foreground/10 pt-6 md:flex-row">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} APROCAR. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

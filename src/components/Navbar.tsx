import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo-remove-bg.png";

const navItems = [
  { label: "Início", path: "/" },
  { label: "Sobre", path: "/sobre" },
  { label: "Doações", path: "/doacoes" },
  { label: "Transparência", path: "/transparencia" },
  { label: "Notícias", path: "/noticias" },
  { label: "Contato", path: "/contato" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolledHomeHero, setHasScrolledHomeHero] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const showLogo = !isHome || hasScrolledHomeHero;
  const showInitialMobileBrand = isHome && !showLogo;

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolledHomeHero(window.scrollY > 80);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    if (location.pathname === "/") {
      setHasScrolledHomeHero(false);
      return;
    }

    setHasScrolledHomeHero(true);
  }, [location.pathname]);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/80 bg-background/95 shadow-[0_12px_40px_rgba(21,45,96,0.12)] backdrop-blur-xl">
      <motion.div
        layout
        transition={{ layout: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } }}
        className={`container-wide relative flex min-h-20 items-center gap-4 py-2 sm:min-h-24 ${showLogo ? "justify-between" : "justify-between lg:justify-center"}`}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {showInitialMobileBrand && (
            <motion.div
              key="navbar-mobile-brand"
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="mr-auto flex min-w-0 items-center lg:hidden"
            >
              <Link to="/" className="min-w-0 leading-tight text-foreground" aria-label="Início">
                <span className="block text-base font-extrabold uppercase tracking-[0.14em]">
                  Aprocar
                </span>
                <span className="block truncate text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Casa de Acolhimento - Rancharia/SP
                </span>
              </Link>
            </motion.div>
          )}

          {showLogo && (
            <motion.div
              key="navbar-logo"
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="mr-auto flex min-w-0 items-center"
            >
              <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Início">
                <img
                  src={logo}
                  alt="APROCAR Casa de Acolhimento"
                  className="h-12 w-auto shrink-0 drop-shadow-md sm:h-16 lg:h-20"
                />
                <span className="min-w-0 leading-tight text-foreground">
                  <span className="block text-[0.62rem] font-bold uppercase tracking-[0.12em] sm:text-sm sm:tracking-[0.18em]">
                    Casa de acolhimento
                  </span>
                  <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs sm:tracking-[0.22em]">
                    Rancharia/SP
                  </span>
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } }}
          className="hidden items-center gap-2 rounded-full border border-border/80 bg-white/90 p-1 shadow-sm lg:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-colors ${
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/78 hover:bg-accent-yellow-soft hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </motion.div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full border border-border bg-white/90 p-2 text-foreground shadow-sm lg:hidden"
          aria-label="Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/98 border-b border-border overflow-hidden shadow-lg"
          >
            <div className="container-wide py-6 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-lg font-semibold transition-colors ${
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent-yellow-soft"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

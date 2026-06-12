import AnimatedSection from "@/components/AnimatedSection";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  highlight: string;
  suffix?: string;
  description?: string;
  image: string;
  imageAlt: string;
  accentClass?: string;
  imagePosition?: string;
}

const PageHero = ({
  eyebrow,
  title,
  highlight,
  suffix,
  description,
  image,
  imageAlt,
  accentClass = "accent-yellow-text",
  imagePosition = "center",
}: PageHeroProps) => {
  const accentBarClass = accentClass.includes("pink")
    ? "bg-accent-pink"
    : accentClass.includes("blue")
      ? "bg-accent-blue"
      : "bg-accent-yellow";

  return (
    <section className="relative flex min-h-[520px] items-center overflow-hidden py-24 md:min-h-[620px]">
      <div className="absolute inset-0">
        <img
          src={image}
          alt={imageAlt}
          className="h-full w-full object-cover"
          style={{ objectPosition: imagePosition }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/78 via-foreground/58 to-foreground/70" />
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-foreground/92 via-foreground/76 to-foreground/35 md:w-[78%] md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-foreground/24" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent-yellow/30 blur-3xl" />
        <div className="absolute -top-24 left-10 h-64 w-64 rounded-full bg-accent-pink/20 blur-3xl" />
      </div>

      <div className="container-wide relative z-10">
        <AnimatedSection className="relative max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/15 px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)] md:px-8 lg:rounded-[2rem]">
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/76 to-foreground/35 backdrop-blur-[1px]" />
          <div className="relative z-10">
            <p className="mb-6 max-w-3xl text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground/90">
              {eyebrow}
            </p>
            <h1 className="hero-title mb-6 max-w-4xl text-primary-foreground">
              {title}
              <br />
              <span>{highlight}</span>
              {suffix ? <span> {suffix}</span> : null}
            </h1>
            <div className={`mb-8 h-1.5 w-28 rounded-full ${accentBarClass}`} />
            {description && (
              <p className="editorial-body max-w-2xl text-primary-foreground/95">
                {description}
              </p>
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PageHero;

import { Button } from "@/components/ui/Button";

interface HeroDateParts {
  weekday: string;
  day: string;
  month: string;
  year: string;
}

interface HeroProps {
  eyebrow: string;
  subtitle: string;
  /** Localized name conjunction — "e" (pt), "&" (en), "y" (es) */
  joiner: string;
  dateParts: HeroDateParts;
  /** Localized time line, e.g. "às 16:00h" */
  timeLabel: string;
  venue: string;
  cta?: string;
  couple: readonly [string, string];
  rsvpHref?: string;
  secondaryCtas?: Array<{ label: string; href: string }>;
  id?: string;
  className?: string;
}

export default function Hero({
  eyebrow,
  subtitle,
  joiner,
  dateParts,
  timeLabel,
  venue,
  cta,
  couple,
  rsvpHref,
  secondaryCtas = [],
  id,
  className = "",
}: HeroProps) {
  const [first, second] = couple;

  return (
    <section
      id={id}
      className={[
        "relative min-h-dvh flex flex-col items-center justify-center bg-warm-white overflow-hidden pt-20",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Watercolor florals from the physical invite — diagonal corners */}
      <img
        src="/assets/florals/bouquet.webp"
        alt=""
        aria-hidden="true"
        className="absolute -top-14 -left-14 w-44 md:-top-20 md:-left-20 md:w-72 lg:w-80 opacity-90 pointer-events-none select-none animate-sway"
      />
      <img
        src="/assets/florals/bouquet.webp"
        alt=""
        aria-hidden="true"
        className="absolute -bottom-14 -right-14 w-40 md:-bottom-20 md:-right-20 md:w-64 lg:w-72 rotate-180 opacity-90 pointer-events-none select-none"
      />

      {/* Content with corner frame — staged entrance, mirroring the invite */}
      <div className="corner-frame relative z-10 text-center px-8 py-12 md:px-14 md:py-16 max-w-2xl mx-auto">
        {/* Eyebrow — "Junto de suas famílias," */}
        <p className="animate-fade-in-up font-body text-muted text-xs md:text-sm uppercase tracking-[0.25em] mb-6">
          {eyebrow}
        </p>

        {/* Couple names */}
        <h1 className="animate-fade-in-up [animation-delay:150ms] font-script font-normal text-script text-5xl md:text-7xl lg:text-8xl tracking-wide leading-none mb-6">
          {first} {joiner} {second}
        </h1>

        {/* Invitation line */}
        <p className="animate-fade-in-up [animation-delay:300ms] font-body text-body/90 text-base md:text-lg mb-8 leading-relaxed max-w-md mx-auto">
          {subtitle}
        </p>

        {/* Date block — month arch, big day flanked by ruled labels, year */}
        <div className="animate-fade-in-up [animation-delay:450ms] mb-8">
          <svg
            viewBox="0 0 260 44"
            className="mx-auto w-44 md:w-52 text-script"
            aria-hidden="true"
          >
            <defs>
              <path id="hero-month-arc" d="M 10 40 Q 130 2 250 40" fill="none" />
            </defs>
            <text
              fill="currentColor"
              fontSize="17"
              letterSpacing="5"
              className="font-body font-medium"
            >
              <textPath href="#hero-month-arc" startOffset="50%" textAnchor="middle">
                {dateParts.month.toUpperCase()}
              </textPath>
            </text>
          </svg>

          <p className="sr-only">
            {dateParts.weekday}, {dateParts.day} {dateParts.month} {dateParts.year}, {timeLabel}
          </p>

          <div
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-5 max-w-md mx-auto"
            aria-hidden="true"
          >
            <span className="border-y border-script/40 py-1.5 font-body font-medium text-heading text-sm md:text-base uppercase tracking-[0.15em]">
              {dateParts.weekday}
            </span>
            <span className="font-body font-light text-script text-6xl md:text-7xl leading-none tabular-nums px-1">
              {dateParts.day}
            </span>
            <span className="border-y border-script/40 py-1.5 font-body font-medium text-heading text-sm md:text-base uppercase tracking-[0.15em]">
              {timeLabel}
            </span>
          </div>

          <p
            className="mt-3 font-body font-medium text-script text-base md:text-lg tracking-[0.4em]"
            aria-hidden="true"
          >
            {dateParts.year}
          </p>
        </div>

        {/* Venue */}
        <p className="animate-fade-in-up [animation-delay:600ms] font-body text-muted text-sm md:text-base mb-8">
          {venue}
        </p>

        {/* CTA */}
        {(cta && rsvpHref) || secondaryCtas.length > 0 ? (
          <div className="animate-fade-in-up [animation-delay:750ms] flex flex-wrap items-center justify-center gap-3">
            {cta && rsvpHref && (
              <a href={rsvpHref}>
                <Button variant="primary" size="lg">
                  {cta}
                </Button>
              </a>
            )}
            {secondaryCtas.map((item) => (
              <a key={item.href} href={item.href}>
                <Button variant="secondary" size="lg">
                  {item.label}
                </Button>
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

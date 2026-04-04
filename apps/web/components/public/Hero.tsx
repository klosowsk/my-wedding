import { Button } from "@/components/ui/Button";
import Divider from "./Divider";

interface HeroProps {
  subtitle: string;
  date: string;
  venue: string;
  cta?: string;
  couple: readonly [string, string];
  rsvpHref?: string;
  secondaryCtas?: Array<{ label: string; href: string }>;
  className?: string;
}

export default function Hero({
  subtitle,
  date,
  venue,
  cta,
  couple,
  rsvpHref,
  secondaryCtas = [],
  className = "",
}: HeroProps) {
  const [first, second] = couple;

  return (
    <section
      className={[
        "relative min-h-dvh flex flex-col items-center justify-center bg-warm-white overflow-hidden pt-20",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Botanical SVG corners */}
      <img
        src="/assets/vectors/leaves-top-left.svg"
        alt=""
        aria-hidden="true"
        className="hidden md:block absolute top-0 left-0 w-44 lg:w-56 xl:w-72 opacity-25 pointer-events-none select-none animate-sway"
      />
      <img
        src="/assets/vectors/leaves-bottom-right.svg"
        alt=""
        aria-hidden="true"
        className="hidden md:block absolute bottom-0 right-0 w-40 lg:w-52 xl:w-64 opacity-25 pointer-events-none select-none"
      />


      {/* Content with corner frame */}
      <div className="corner-frame relative z-10 text-center px-8 py-12 md:px-14 md:py-16 max-w-2xl mx-auto">
        {/* Subtitle above names — italic, like the invite */}
        <p className="font-body italic text-muted text-base md:text-lg mb-5 leading-relaxed max-w-md mx-auto">
          {subtitle}
        </p>

        {/* Couple names */}
        <h1 className="font-script font-normal text-script text-5xl md:text-7xl lg:text-8xl tracking-wide leading-none mb-6">
          {first} & {second}
        </h1>

        {/* Divider ornament */}
        <Divider className="mb-6" />

        {/* Date */}
        <p className="font-body font-semibold text-heading text-lg md:text-xl mb-1 tracking-wide">
          {date}
        </p>

        {/* Venue */}
        <p className="font-body text-muted text-sm md:text-base mb-8">
          {venue}
        </p>

        {/* CTA */}
        {(cta && rsvpHref) || secondaryCtas.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
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

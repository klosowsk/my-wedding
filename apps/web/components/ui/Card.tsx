interface CardProps {
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
}

function Card({ hover = false, className = "", children }: CardProps) {
  return (
    <div
      className={[
        "bg-warm-white border border-secondary rounded-xl p-6",
        "shadow-[0_4px_16px_rgba(60,53,48,0.06)]",
        hover &&
          "hover:shadow-[0_8px_24px_rgba(60,53,48,0.08)] hover:scale-[1.01] transition-all duration-300",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export { Card };
export type { CardProps };

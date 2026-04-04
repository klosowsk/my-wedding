interface BotanicalDividerProps {
  className?: string;
}

export default function BotanicalDivider({
  className = "",
}: BotanicalDividerProps) {
  return (
    <div
      className={[
        "flex items-center justify-center gap-3 py-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="block w-12 md:w-20 h-px bg-secondary" />
      <span className="block w-1.5 h-1.5 rotate-45 bg-secondary" />
      <span className="block w-1 h-1 rounded-full bg-secondary/60" />
      <span className="block w-1.5 h-1.5 rotate-45 bg-secondary" />
      <span className="block w-12 md:w-20 h-px bg-secondary" />
    </div>
  );
}

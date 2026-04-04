interface DividerProps {
  className?: string;
}

export default function Divider({ className = "" }: DividerProps) {
  return (
    <div
      className={[
        "flex items-center justify-center gap-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <span className="block w-12 h-px bg-secondary" />
      <span className="block w-1.5 h-1.5 rounded-full bg-secondary" />
      <span className="block w-12 h-px bg-secondary" />
    </div>
  );
}

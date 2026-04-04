type BadgeVariant = "confirmed" | "pending" | "declined" | "info" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  confirmed: "bg-accent-faint text-accent border border-accent/20",
  pending: "bg-warning-bg text-warning border border-warning/20",
  declined: "bg-error-bg text-error border border-error/20",
  info: "bg-info-bg text-info border border-info/20",
  default: "bg-surface text-muted border border-secondary",
};

function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };

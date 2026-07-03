type StatusIconVariant = "success" | "error" | "warning";

interface StatusIconProps {
  variant: StatusIconVariant;
  className?: string;
}

const variantStyles: Record<StatusIconVariant, { bg: string; icon: string }> = {
  success: { bg: "bg-accent-faint", icon: "text-accent" },
  error: { bg: "bg-error-bg", icon: "text-error" },
  warning: { bg: "bg-primary-faint", icon: "text-primary" },
};

const icons: Record<StatusIconVariant, React.ReactNode> = {
  success: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16h.01" />
    </svg>
  ),
};

function StatusIcon({ variant, className = "" }: StatusIconProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={[
        "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
        styles.bg,
        styles.icon,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icons[variant]}
    </div>
  );
}

export { StatusIcon };
export type { StatusIconProps, StatusIconVariant };

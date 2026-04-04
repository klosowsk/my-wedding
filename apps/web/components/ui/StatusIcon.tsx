type StatusIconVariant = "success" | "error";

interface StatusIconProps {
  variant: StatusIconVariant;
  className?: string;
}

const variantStyles: Record<StatusIconVariant, { bg: string; icon: string }> = {
  success: { bg: "bg-accent-faint", icon: "text-accent" },
  error: { bg: "bg-error-bg", icon: "text-error" },
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

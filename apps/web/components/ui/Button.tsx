import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-text-on-primary hover:bg-primary-hover active:bg-primary-active shadow-[0_2px_8px_rgba(180,105,66,0.2)] hover:shadow-[0_4px_12px_rgba(180,105,66,0.25)]",
  secondary:
    "bg-transparent border-2 border-primary text-primary hover:bg-primary-faint active:bg-primary-faint/80",
  ghost:
    "bg-transparent text-primary hover:bg-surface active:bg-surface-hover",
  danger:
    "bg-error text-text-on-primary hover:bg-error/90 active:bg-error/80 shadow-[0_2px_8px_rgba(196,69,54,0.2)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-sm min-h-[36px]",
  md: "px-8 py-3 text-base min-h-[44px]",
  lg: "px-10 py-4 text-lg min-h-[52px]",
};

function Spinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    children,
    className = "",
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center rounded-full font-semibold font-body",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-px active:translate-y-0",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
});

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };

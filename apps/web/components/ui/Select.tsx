import { type SelectHTMLAttributes, forwardRef, useId } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  children: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    error,
    helperText,
    className = "",
    id: externalId,
    children,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const id = externalId || generatedId;
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText && !error ? `${id}-helper` : undefined;
  const describedBy =
    [errorId, helperId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-heading mb-1"
        >
          {label}
          {props.required && (
            <span className="text-error ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          aria-required={props.required || undefined}
          className={[
            "w-full px-4 py-3 pr-10 rounded-lg font-body text-body",
            "bg-surface border border-secondary",
            "focus:ring-2 focus:ring-primary focus:border-primary outline-none",
            "transition-[border-color,box-shadow] duration-200",
            "appearance-none cursor-pointer",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-error focus:ring-error focus:border-error",
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        >
          {children}
        </select>
        {/* Custom chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error && (
        <p id={errorId} className="text-error text-xs mt-1" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-text-muted text-xs mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
});

export { Select };
export type { SelectProps };

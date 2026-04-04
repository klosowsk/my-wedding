import { type InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, className = "", id: externalId, ...props },
  ref
) {
  const generatedId = useId();
  const id = externalId || generatedId;
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText && !error ? `${id}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

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
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        aria-required={props.required || undefined}
        className={[
          "w-full px-4 py-3 rounded-lg font-body text-body",
          "bg-surface border border-secondary",
          "placeholder:text-muted-light",
          "focus:ring-2 focus:ring-primary focus:border-primary outline-none",
          "transition-[border-color,box-shadow] duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-error focus:ring-error focus:border-error",
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
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

export { Input };
export type { InputProps };

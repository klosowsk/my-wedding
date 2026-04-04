"use client";

import { useId } from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  className?: string;
}

function Toggle({
  checked,
  onChange,
  label,
  description,
  className = "",
}: ToggleProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={[
        "flex items-center gap-3 cursor-pointer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-6 bg-surface border border-secondary rounded-full peer-checked:bg-primary transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-warm-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
      </div>
      <div>
        <span className="text-sm font-semibold text-heading">{label}</span>
        {description && (
          <p className="text-xs text-muted">{description}</p>
        )}
      </div>
    </label>
  );
}

export { Toggle };
export type { ToggleProps };

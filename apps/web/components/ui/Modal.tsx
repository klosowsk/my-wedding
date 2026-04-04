"use client";

import {
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type MouseEvent,
} from "react";

type ModalSize = "sm" | "md" | "lg";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  children: ReactNode;
  className?: string;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

function Modal({
  open,
  onClose,
  title,
  size = "md",
  children,
  className = "",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const wasOpenRef = useRef(false);

  // Keep onClose ref up to date without causing effect re-runs
  onCloseRef.current = onClose;

  // Stable handleKeyDown — never changes identity
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onCloseRef.current();
      return;
    }

    if (e.key === "Tab" && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first) return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
  }, []);

  // Manage focus and body scroll — only reacts to `open` changes
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);

      // Focus the dialog container on open (not the close button)
      // Only do this when modal first opens, not on every re-render
      if (!wasOpenRef.current) {
        requestAnimationFrame(() => {
          dialogRef.current?.focus();
        });
      }
      wasOpenRef.current = true;
    } else {
      wasOpenRef.current = false;
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      if (!open) {
        previousFocusRef.current?.focus();
      }
    };
  }, [open, handleKeyDown]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
        tabIndex={-1}
        className={[
          "relative z-10 w-full max-h-[calc(100dvh-2rem)] flex flex-col",
          "bg-warm-white rounded-2xl p-8",
          "shadow-[0_8px_32px_rgba(60,53,48,0.12)]",
          "animate-[modal-enter_250ms_ease-out]",
          sizeStyles[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          {
            "--tw-enter-opacity": "0",
            "--tw-enter-scale": "0.95",
          } as React.CSSProperties
        }
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-muted hover:text-body hover:bg-surface transition-colors duration-200 cursor-pointer"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Title */}
        {title && (
          <h2 className="text-xl font-bold text-heading pr-8 mb-6">{title}</h2>
        )}

        {/* Content */}
        <div className="min-h-0 overflow-y-auto pr-1 -mr-1">
          {children}
        </div>
      </div>

      {/* Animation keyframes injected via style tag */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export { Modal };
export type { ModalProps, ModalSize };

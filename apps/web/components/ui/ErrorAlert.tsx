interface ErrorAlertProps {
  children: React.ReactNode;
  className?: string;
}

function ErrorAlert({ children, className = "" }: ErrorAlertProps) {
  return (
    <div
      className={[
        "bg-error-bg border border-error/20 text-error rounded-lg px-4 py-3 text-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="alert"
    >
      {children}
    </div>
  );
}

export { ErrorAlert };
export type { ErrorAlertProps };

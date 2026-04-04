import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
  className?: string;
}

function PageHeader({ title, children, className = "" }: PageHeaderProps) {
  return (
    <div
      className={[
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h1 className="text-2xl font-bold text-heading font-body">{title}</h1>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export { PageHeader };
export type { PageHeaderProps };

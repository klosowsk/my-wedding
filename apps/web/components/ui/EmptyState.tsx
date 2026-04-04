import { Card } from "./Card";

interface EmptyStateProps {
  message: string;
  className?: string;
}

function EmptyState({ message, className = "" }: EmptyStateProps) {
  return (
    <Card className={className}>
      <p className="text-center text-muted py-8">{message}</p>
    </Card>
  );
}

export { EmptyState };
export type { EmptyStateProps };

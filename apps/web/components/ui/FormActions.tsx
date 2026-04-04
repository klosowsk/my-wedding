import { Button } from "./Button";

interface FormActionsProps {
  onCancel: () => void;
  onSubmit?: () => void;
  submitLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  className?: string;
}

function FormActions({
  onCancel,
  onSubmit,
  submitLabel,
  cancelLabel = "Cancel",
  loading = false,
  className = "",
}: FormActionsProps) {
  return (
    <div
      className={[
        "flex justify-end gap-3 pt-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Button variant="ghost" type="button" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button
        type={onSubmit ? "button" : "submit"}
        onClick={onSubmit}
        loading={loading}
      >
        {submitLabel}
      </Button>
    </div>
  );
}

export { FormActions };
export type { FormActionsProps };

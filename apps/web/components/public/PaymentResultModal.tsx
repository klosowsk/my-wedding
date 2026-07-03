"use client";

import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { StatusIcon } from "@/components/ui/StatusIcon";

export type PaymentResult = "success" | "cancelled" | "error";

interface PaymentResultModalProps {
  result: PaymentResult | null;
  /** Gift name, shown as context on cancelled/error so guests know what to retry. */
  giftName?: string | null;
  onClose: () => void;
  /** When provided (cancelled/error), shows a "try again" button. */
  onRetry?: () => void;
}

const copyByResult: Record<
  PaymentResult,
  { variant: "success" | "warning" | "error"; titleKey: string; messageKey: string }
> = {
  success: { variant: "success", titleKey: "successTitle", messageKey: "successMessage" },
  cancelled: { variant: "warning", titleKey: "cancelledTitle", messageKey: "cancelledMessage" },
  error: { variant: "error", titleKey: "errorTitle", messageKey: "errorMessage" },
};

export default function PaymentResultModal({
  result,
  giftName,
  onClose,
  onRetry,
}: PaymentResultModalProps) {
  const t = useTranslations("payment");
  const tCommon = useTranslations("common");

  if (!result) return null;

  const { variant, titleKey, messageKey } = copyByResult[result];
  const isSuccess = result === "success";
  const canRetry = !isSuccess && !!onRetry;

  return (
    <Modal open={!!result} onClose={onClose} size="sm">
      <div className="text-center py-4">
        <StatusIcon variant={variant} className="mb-5" />

        <h2 className="text-heading font-bold text-xl mb-2">{t(titleKey)}</h2>

        {!isSuccess && giftName && (
          <p className="text-muted text-sm mb-1">{giftName}</p>
        )}

        <p className="text-body text-sm leading-relaxed mb-6 max-w-xs mx-auto">
          {t(messageKey)}
        </p>

        <div className="flex flex-col gap-2">
          {canRetry && (
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={onRetry}
            >
              {t("tryAgain")}
            </Button>
          )}
          <Button
            variant={isSuccess ? "primary" : "secondary"}
            size="md"
            className="w-full"
            onClick={onClose}
          >
            {tCommon("close")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

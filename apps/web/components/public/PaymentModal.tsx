"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { StatusIcon } from "@/components/ui/StatusIcon";
import PixQRCode from "./PixQRCode";
import { apiGet, apiPost } from "@/lib/api";
import { formatCurrency, getCurrencySymbol } from "@marriage/shared";

interface Gift {
  id: string;
  name: string;
  priceCents: number;
  collectedCents: number;
  contributionMode: "open" | "fixed" | "quotes";
  fixedContributionOptions: number[];
  quoteUnitCents: number | null;
  showCollectedAmount: boolean;
  showGoalAmount: boolean;
  showFundedBadge: boolean;
}

interface PaymentModalProps {
  gift: Gift;
  open: boolean;
  onClose: () => void;
  locale: string;
  currency?: {
    code: string;
    locale: string;
  };
}

interface SiteConfig {
  pix_key: string | null;
  pix_name: string | null;
  pix_city: string | null;
  stripe_enabled: string | null;
  pix_enabled: string | null;
  currency_code: string | null;
  currency_locale: string | null;
  [key: string]: string | null;
}

type PaymentStep = "form" | "pix-qr" | "success" | "error";

export default function PaymentModal({
  gift,
  open,
  onClose,
  currency,
}: PaymentModalProps) {
  const t = useTranslations("payment");
  const tCommon = useTranslations("common");

  const rawQuoteUnitLabel = t("quoteUnit");
  const rawQuoteQuantityLabel = t("quoteQuantity");
  const rawQuoteTotalLabel = t("quoteTotal");
  const rawQuoteHintLabel = t("quoteHint");

  const quoteUnitLabel =
    rawQuoteUnitLabel === "quoteUnit" || rawQuoteUnitLabel === "payment.quoteUnit"
      ? "Cota"
      : rawQuoteUnitLabel;
  const quoteQuantityLabel =
    rawQuoteQuantityLabel === "quoteQuantity" ||
    rawQuoteQuantityLabel === "payment.quoteQuantity"
      ? "Quantidade"
      : rawQuoteQuantityLabel;
  const quoteTotalLabel =
    rawQuoteTotalLabel === "quoteTotal" || rawQuoteTotalLabel === "payment.quoteTotal"
      ? "Total"
      : rawQuoteTotalLabel;
  const quoteHintLabel =
    rawQuoteHintLabel === "quoteHint" || rawQuoteHintLabel === "payment.quoteHint"
      ? "Escolha quantas cotas deseja oferecer"
      : rawQuoteHintLabel;

  const remaining = Math.max(gift.priceCents - gift.collectedCents, 0);
  const hasFixedOptions =
    gift.contributionMode === "fixed" && gift.fixedContributionOptions.length > 0;
  const isQuotesMode =
    gift.contributionMode === "quotes" && (gift.quoteUnitCents ?? 0) >= 100;

  const defaultQuoteQuantity = 1;
  const defaultAmount = isQuotesMode
    ? (gift.quoteUnitCents ?? 100) * defaultQuoteQuantity
    : hasFixedOptions
      ? (gift.fixedContributionOptions[0] ?? 100)
      : remaining > 0
        ? remaining
        : 100;

  // Site config (PIX keys, Stripe flag)
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Form state
  const [amountCents, setAmountCents] = useState(defaultAmount);
  const [amountInput, setAmountInput] = useState((defaultAmount / 100).toFixed(2));
  const [quoteQuantity, setQuoteQuantity] = useState(defaultQuoteQuantity);
  const [contributorName, setContributorName] = useState("");
  const [activeTab, setActiveTab] = useState("pix");
  const [step, setStep] = useState<PaymentStep>("form");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch site config on open
  useEffect(() => {
    if (!open) return;

    setConfigLoading(true);
    apiGet<SiteConfig>("/api/v1/site-config")
      .then((data) => {
        setSiteConfig(data);

        const pixAvailable = data.pix_enabled !== "false" && !!data.pix_key;
        const stripeAvailable = data.stripe_enabled === "true";

        if (pixAvailable) {
          setActiveTab("pix");
        } else if (stripeAvailable) {
          setActiveTab("stripe");
        }
      })
      .catch(() => {
        setSiteConfig(null);
      })
      .finally(() => {
        setConfigLoading(false);
      });
  }, [open]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setAmountCents(defaultAmount);
      setAmountInput((defaultAmount / 100).toFixed(2));
      setQuoteQuantity(defaultQuoteQuantity);
      setContributorName("");
      setStep("form");
      setLoading(false);
      setErrorMsg("");
    }
  }, [open, defaultAmount]);

  const pixAvailable =
    siteConfig?.pix_enabled !== "false" && !!siteConfig?.pix_key;
  const stripeAvailable = siteConfig?.stripe_enabled === "true";

  const currencyOptions = {
    code: currency?.code || siteConfig?.currency_code || undefined,
    locale: currency?.locale || siteConfig?.currency_locale || undefined,
  };

  const currencySymbol = getCurrencySymbol(currencyOptions);

  const tabs = [];
  if (pixAvailable) tabs.push({ id: "pix", label: t("pix") });
  if (stripeAvailable) tabs.push({ id: "stripe", label: t("stripe") });

  const handleAmountChange = (value: string) => {
    const filtered = value.replace(/[^\d.,]/g, "");
    setAmountInput(filtered);

    const cleaned = filtered.replace(",", ".");
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && parsed > 0) {
      setAmountCents(Math.round(parsed * 100));
    } else {
      setAmountCents(0);
    }
  };

  const setQuoteAmount = (quantity: number) => {
    if (!isQuotesMode) return;
    const unit = gift.quoteUnitCents ?? 100;
    const nextQuantity = Math.max(1, quantity);
    setQuoteQuantity(nextQuantity);
    setAmountCents(unit * nextQuantity);
  };

  const handlePixSubmit = useCallback(async () => {
    if (amountCents < 100) return;
    setLoading(true);
    setErrorMsg("");

    try {
      await apiPost("/api/v1/payments/pix", {
        giftId: gift.id,
        amountCents,
        quoteQuantity: isQuotesMode ? quoteQuantity : undefined,
        contributorName: contributorName || undefined,
        paymentMethod: "pix",
      });
      setStep("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : tCommon("error"));
      setStep("error");
    } finally {
      setLoading(false);
    }
  }, [gift.id, amountCents, quoteQuantity, isQuotesMode, contributorName, tCommon]);

  const handleStripeSubmit = useCallback(async () => {
    if (amountCents < 100) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const result = await apiPost<{ url: string }>("/api/v1/payments/stripe", {
        giftId: gift.id,
        amountCents,
        quoteQuantity: isQuotesMode ? quoteQuantity : undefined,
        contributorName: contributorName || "Anonymous",
        paymentMethod: "stripe",
      });

      window.location.href = result.url;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : tCommon("error"));
      setStep("error");
      setLoading(false);
    }
  }, [gift.id, amountCents, quoteQuantity, isQuotesMode, contributorName, tCommon]);

  const generateTxId = () => {
    return `PIX${gift.id.replace(/-/g, "").substring(0, 8)}${Date.now().toString(36)}`.substring(0, 25);
  };

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal open={open} onClose={handleClose} title={t("title")} size="md">
      {configLoading ? (
        <div className="flex justify-center py-8">
          <p className="text-muted">{tCommon("loading")}</p>
        </div>
      ) : step === "success" ? (
        <div className="text-center py-6">
          <StatusIcon variant="success" className="mb-4" />
          <p className="text-heading font-semibold text-lg mb-2">
            {t("pendingMessage")}
          </p>
          <Button variant="secondary" size="sm" onClick={handleClose} className="mt-4">
            {tCommon("close")}
          </Button>
        </div>
      ) : step === "error" ? (
        <div className="text-center py-6">
          <StatusIcon variant="error" className="mb-4" />
          <p className="text-error font-semibold mb-2">{errorMsg}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setStep("form");
              setErrorMsg("");
            }}
            className="mt-4"
          >
            {tCommon("back")}
          </Button>
        </div>
      ) : step === "pix-qr" ? (
        <div className="space-y-4">
          <PixQRCode
            pixKey={siteConfig!.pix_key!}
            pixName={siteConfig!.pix_name || "Casamento"}
            pixCity={siteConfig!.pix_city || "Cidade"}
            amountCents={amountCents}
            txId={generateTxId()}
            copyLabel={t("copyCode")}
            copiedLabel={t("copied")}
            instructionLabel={t("qrCode")}
          />

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              loading={loading}
              onClick={handlePixSubmit}
            >
              {t("transferred")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-surface rounded-lg p-4 text-center">
            <p className="text-heading font-semibold">{gift.name}</p>
            {(gift.showCollectedAmount || gift.showGoalAmount) && (
              <p className="text-muted text-sm mt-1">
                {gift.showCollectedAmount &&
                  formatCurrency(gift.collectedCents, currencyOptions)}
                {gift.showCollectedAmount && gift.showGoalAmount && " / "}
                {gift.showGoalAmount &&
                  formatCurrency(gift.priceCents, currencyOptions)}
              </p>
            )}
          </div>

          {tabs.length > 1 && (
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="justify-center"
            />
          )}

          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">
              {t("amount")}
            </label>
            {isQuotesMode ? (
              <div className="space-y-3">
                <p className="text-xs text-muted">{quoteHintLabel}</p>

                <div className="rounded-xl border border-secondary bg-surface/60 p-3">
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="!h-11 !w-11 !px-0 text-lg"
                      disabled={quoteQuantity <= 1}
                      onClick={() => setQuoteAmount(quoteQuantity - 1)}
                    >
                      −
                    </Button>

                    <div className="min-w-20 rounded-lg border border-secondary bg-warm-white px-4 py-2 text-center">
                      <p className="text-[10px] uppercase tracking-wide text-muted font-semibold">
                        {quoteQuantityLabel}
                      </p>
                      <p className="text-lg font-bold text-heading leading-tight">
                        {quoteQuantity}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="!h-11 !w-11 !px-0 text-lg"
                      onClick={() => setQuoteAmount(quoteQuantity + 1)}
                    >
                      +
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
                    {[1, 2, 3, 5, 10].map((qty) => (
                      <Button
                        key={qty}
                        type="button"
                        variant={quoteQuantity === qty ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setQuoteAmount(qty)}
                      >
                        {qty}x
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="rounded-lg border border-secondary bg-surface/60 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted font-semibold">
                      {quoteUnitLabel}
                    </p>
                    <p className="text-sm font-semibold text-heading">
                      {formatCurrency(gift.quoteUnitCents ?? 0, currencyOptions)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-secondary bg-surface/60 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted font-semibold">
                      {quoteQuantityLabel}
                    </p>
                    <p className="text-sm font-semibold text-heading">{quoteQuantity}x</p>
                  </div>
                  <div className="rounded-lg border border-primary/40 bg-primary-faint px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted font-semibold">
                      {quoteTotalLabel}
                    </p>
                    <p className="text-base font-bold text-heading">
                      {formatCurrency(amountCents, currencyOptions)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {quoteQuantityLabel}
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={quoteQuantity}
                    onChange={(e) => setQuoteAmount(Number(e.target.value || 1))}
                    className="w-full bg-surface border border-secondary rounded-lg px-3 py-2 text-sm text-body focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200"
                  />
                </div>
              </div>
            ) : hasFixedOptions ? (
              <div className="grid grid-cols-2 gap-2">
                {gift.fixedContributionOptions.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={amountCents === option ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => {
                      setAmountCents(option);
                      setAmountInput((option / 100).toFixed(2));
                    }}
                  >
                    {formatCurrency(option, currencyOptions)}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">
                  {currencySymbol}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amountInput}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full bg-surface border border-secondary rounded-lg pl-10 pr-4 py-2.5 text-sm text-body placeholder:text-muted-light focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200"
                  placeholder="0,00"
                />
              </div>
            )}
          </div>

          <Input
            label={t("yourName")}
            type="text"
            value={contributorName}
            onChange={(e) => setContributorName(e.target.value)}
            placeholder={t("yourName")}
          />

          {activeTab === "pix" ? (
            <Button
              variant="primary"
              size="md"
              className="w-full"
              disabled={amountCents < 100}
              onClick={() => setStep("pix-qr")}
            >
              {t("pix")}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              className="w-full"
              loading={loading}
              disabled={amountCents < 100 || !contributorName.trim()}
              onClick={handleStripeSubmit}
            >
              {t("stripe")}
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}

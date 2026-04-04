"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FormActions } from "@/components/ui/FormActions";
import { Toggle } from "@/components/ui/Toggle";
import ImageUpload from "@/components/admin/ImageUpload";
import { formatCurrency, getCurrencySymbol } from "@marriage/shared";
import type { BadgeVariant } from "@/components/ui/Badge";

interface GiftContribution {
  id: string;
  giftId: string;
  contributorName: string | null;
  amountCents: number;
  paymentMethod: "pix" | "stripe";
  paymentStatus: "pending" | "confirmed" | "failed";
  confirmedAt: string | null;
  createdAt: string;
}

interface Gift {
  id: string;
  namePt: string;
  nameEn: string | null;
  nameEs: string | null;
  descriptionPt: string | null;
  descriptionEn: string | null;
  descriptionEs: string | null;
  imageUrl: string | null;
  mediaId: string | null;
  priceCents: number;
  collectedCents: number;
  status: string;
  category: string | null;
  contributionMode: "open" | "fixed" | "quotes";
  fixedContributionOptions: string | null;
  quoteUnitCents: number | null;
  showCollectedAmount: boolean;
  showGoalAmount: boolean;
  showFundedBadge: boolean;
  sortOrder: number;
  createdAt: string;
  media?: {
    id: string;
    url: string;
    thumbUrl: string | null;
  } | null;
  contributions?: GiftContribution[];
}

interface GiftFormState {
  namePt: string;
  nameEn: string;
  nameEs: string;
  descriptionPt: string;
  descriptionEn: string;
  descriptionEs: string;
  imageUrl: string;
  mediaId: string | null;
  mediaUrl: string | null;
  priceCents: string;
  category: string;
  contributionMode: "open" | "fixed" | "quotes";
  fixedContributionOptions: string;
  quoteUnitCents: string;
  showCollectedAmount: boolean;
  showGoalAmount: boolean;
  showFundedBadge: boolean;
}

const emptyForm: GiftFormState = {
  namePt: "",
  nameEn: "",
  nameEs: "",
  descriptionPt: "",
  descriptionEn: "",
  descriptionEs: "",
  imageUrl: "",
  mediaId: null,
  mediaUrl: null,
  priceCents: "",
  category: "",
  contributionMode: "open",
  fixedContributionOptions: "",
  quoteUnitCents: "",
  showCollectedAmount: true,
  showGoalAmount: true,
  showFundedBadge: true,
};

const statusVariantMap: Record<string, BadgeVariant> = {
  available: "confirmed",
  fully_funded: "info",
  hidden: "default",
};

const langTabs = [
  { id: "pt", label: "PT" },
  { id: "en", label: "EN" },
  { id: "es", label: "ES" },
];

function parseFixedOptionsInput(value: string): number[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item.replace(",", ".")))
    .filter((amount) => Number.isFinite(amount) && amount > 0)
    .map((amount) => Math.round(amount * 100))
    .filter((amount) => amount >= 100);
}

function fixedOptionsToInput(raw: string | null): string {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return "";
    return parsed
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value >= 100)
      .map((value) => (value / 100).toFixed(2))
      .join(", ");
  } catch {
    return "";
  }
}

function GiftGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <Skeleton height={120} className="rounded-lg mb-3" />
          <Skeleton height={20} width={150} className="mb-2" />
          <Skeleton height={14} width={100} />
        </Card>
      ))}
    </div>
  );
}

export default function AdminGiftsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Gift | null>(null);
  const [form, setForm] = useState<GiftFormState>(emptyForm);
  const [langTab, setLangTab] = useState("pt");
  const [contributionsModalGift, setContributionsModalGift] = useState<Gift | null>(null);
  const [contributionActionTarget, setContributionActionTarget] = useState<string | null>(null);
  const [draggedGiftId, setDraggedGiftId] = useState<string | null>(null);

  const { data: gifts, isLoading, error } = useQuery<Gift[]>({
    queryKey: ["admin", "gifts"],
    queryFn: () => apiGet("/api/v1/admin/gifts"),
  });

  const { data: settings } = useQuery<{
    currencyCode: string;
    currencyLocale: string;
  }>({
    queryKey: ["admin", "settings", "gifts-currency"],
    queryFn: () => apiGet("/api/v1/admin/settings"),
    staleTime: 60_000,
  });

  const currency = {
    code: settings?.currencyCode,
    locale: settings?.currencyLocale,
  };

  const contributionsGiftId = contributionsModalGift?.id;

  const {
    data: contributions,
    isLoading: contributionsLoading,
    error: contributionsError,
  } = useQuery<GiftContribution[]>({
    queryKey: ["admin", "gifts", contributionsGiftId, "contributions"],
    queryFn: () => apiGet(`/api/v1/admin/gifts/${contributionsGiftId}/contributions`),
    enabled: !!contributionsGiftId,
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost("/api/v1/admin/gifts", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gifts"] });
      toast({ message: "Gift created", type: "success" });
      closeModal();
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to create gift", type: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiPatch(`/api/v1/admin/gifts/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gifts"] });
      toast({ message: "Gift updated", type: "success" });
      closeModal();
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to update gift", type: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/v1/admin/gifts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gifts"] });
      toast({ message: "Gift deleted", type: "success" });
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to delete gift", type: "error" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (updates: Array<{ id: string; sortOrder: number }>) => {
      await Promise.all(
        updates.map((update) =>
          apiPatch(`/api/v1/admin/gifts/${update.id}`, {
            sortOrder: update.sortOrder,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gifts"] });
      toast({ message: "Gift order updated", type: "success" });
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to reorder gifts", type: "error" });
    },
    onSettled: () => {
      setDraggedGiftId(null);
    },
  });

  const contributionActionMutation = useMutation({
    mutationFn: ({
      giftId,
      contributionId,
      action,
    }: {
      giftId: string;
      contributionId: string;
      action: "confirm" | "reject";
    }) =>
      apiPatch(`/api/v1/admin/gifts/${giftId}/contributions`, {
        contributionId,
        action,
      }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gifts"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "gifts", variables.giftId, "contributions"],
      });
      toast({
        message:
          variables.action === "confirm"
            ? "Contribution confirmed"
            : "Contribution rejected",
        type: "success",
      });
    },
    onError: (err: Error) => {
      toast({
        message: err.message || "Failed to update contribution",
        type: "error",
      });
    },
    onSettled: () => {
      setContributionActionTarget(null);
    },
  });

  function openCreate() {
    setEditingGift(null);
    setForm(emptyForm);
    setLangTab("pt");
    setModalOpen(true);
  }

  function openEdit(gift: Gift) {
    setEditingGift(gift);
    setForm({
      namePt: gift.namePt,
      nameEn: gift.nameEn ?? "",
      nameEs: gift.nameEs ?? "",
      descriptionPt: gift.descriptionPt ?? "",
      descriptionEn: gift.descriptionEn ?? "",
      descriptionEs: gift.descriptionEs ?? "",
      imageUrl: gift.imageUrl ?? "",
      mediaId: gift.mediaId ?? null,
      mediaUrl: gift.media?.url ?? gift.imageUrl ?? null,
      priceCents: String(gift.priceCents / 100),
      category: gift.category ?? "",
      contributionMode: gift.contributionMode,
      fixedContributionOptions: fixedOptionsToInput(gift.fixedContributionOptions),
      quoteUnitCents: gift.quoteUnitCents ? (gift.quoteUnitCents / 100).toFixed(2) : "",
      showCollectedAmount: gift.showCollectedAmount,
      showGoalAmount: gift.showGoalAmount,
      showFundedBadge: gift.showFundedBadge,
    });
    setLangTab("pt");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingGift(null);
    setForm(emptyForm);
  }

  function closeContributionsModal() {
    setContributionsModalGift(null);
    setContributionActionTarget(null);
  }

  function updateField(field: keyof GiftFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const fixedOptions =
      form.contributionMode === "fixed"
        ? Array.from(new Set(parseFixedOptionsInput(form.fixedContributionOptions))).sort(
            (a, b) => a - b
          )
        : [];

    if (form.contributionMode === "fixed" && fixedOptions.length === 0) {
      toast({
        message: "Add at least one fixed contribution amount (e.g. 100, 200, 350)",
        type: "error",
      });
      return;
    }

    const quoteUnitCents =
      form.contributionMode === "quotes"
        ? Math.round(parseFloat(form.quoteUnitCents || "0") * 100)
        : null;

    if (form.contributionMode === "quotes" && (!quoteUnitCents || quoteUnitCents < 100)) {
      toast({
        message: "Set quote unit amount (minimum 1.00)",
        type: "error",
      });
      return;
    }

    const body = {
      namePt: form.namePt,
      nameEn: form.nameEn || null,
      nameEs: form.nameEs || null,
      descriptionPt: form.descriptionPt || null,
      descriptionEn: form.descriptionEn || null,
      descriptionEs: form.descriptionEs || null,
      imageUrl: form.mediaUrl || form.imageUrl || null,
      mediaId: form.mediaId || null,
      priceCents: Math.round(parseFloat(form.priceCents || "0") * 100),
      category: form.category || null,
      contributionMode: form.contributionMode,
      fixedContributionOptions:
        form.contributionMode === "fixed" ? fixedOptions : null,
      quoteUnitCents,
      showCollectedAmount: form.showCollectedAmount,
      showGoalAmount: form.showGoalAmount,
      showFundedBadge: form.showFundedBadge,
    };

    if (editingGift) {
      updateMutation.mutate({ id: editingGift.id, body });
    } else {
      createMutation.mutate(body);
    }
  }

  function handleContributionAction(
    contributionId: string,
    action: "confirm" | "reject"
  ) {
    if (!contributionsGiftId) return;
    setContributionActionTarget(contributionId);
    contributionActionMutation.mutate({
      giftId: contributionsGiftId,
      contributionId,
      action,
    });
  }

  function reorderGifts(fromId: string, toId: string) {
    if (!gifts || fromId === toId || reorderMutation.isPending) return;

    const ordered = [...gifts].sort((a, b) => a.sortOrder - b.sortOrder);
    const fromIndex = ordered.findIndex((gift) => gift.id === fromId);
    const toIndex = ordered.findIndex((gift) => gift.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = ordered.splice(fromIndex, 1);
    if (!moved) return;
    ordered.splice(toIndex, 0, moved);

    const updates = ordered
      .map((gift, index) => ({ id: gift.id, sortOrder: index }))
      .filter(
        (update) =>
          (gifts.find((gift) => gift.id === update.id)?.sortOrder ?? update.sortOrder) !==
          update.sortOrder
      );

    if (updates.length === 0) return;
    reorderMutation.mutate(updates);
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isContributionUpdating = contributionActionMutation.isPending;
  const orderedGifts = [...(gifts ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const sortedContributions = [...(contributions ?? [])].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <PageHeader title="Gifts">
        <Button size="sm" onClick={openCreate}>
          + Add Gift
        </Button>
      </PageHeader>

      {error && (
        <ErrorAlert className="mb-6">
          Failed to load gifts. Please try again.
        </ErrorAlert>
      )}

      {isLoading ? (
        <GiftGridSkeleton />
      ) : gifts && gifts.length > 0 ? (
        <div>
          <p className="text-xs text-muted mb-3">Drag cards to reorder gifts.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orderedGifts.map((gift) => {
            const percent =
              gift.priceCents > 0
                ? Math.min(100, Math.round((gift.collectedCents / gift.priceCents) * 100))
                : 0;
            const pendingPixCount = (gift.contributions ?? []).filter(
              (contribution) =>
                contribution.paymentMethod === "pix" &&
                contribution.paymentStatus === "pending"
            ).length;

            return (
              <div
                key={gift.id}
                draggable
                onDragStart={(e) => {
                  setDraggedGiftId(gift.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedGiftId) reorderGifts(draggedGiftId, gift.id);
                }}
                onDragEnd={() => setDraggedGiftId(null)}
                className={draggedGiftId === gift.id ? "opacity-60" : undefined}
              >
              <Card
                hover
                className="cursor-pointer"
              >
                <div onClick={() => openEdit(gift)}>
                  {(gift.media?.thumbUrl || gift.media?.url || gift.imageUrl) ? (
                    <div className="w-full h-32 rounded-lg bg-surface mb-3 overflow-hidden">
                      <img
                        src={gift.media?.thumbUrl || gift.media?.url || gift.imageUrl!}
                        alt={gift.namePt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-lg bg-surface mb-3 flex items-center justify-center">
                      <svg className="w-10 h-10 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21" />
                      </svg>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-heading text-sm truncate">
                        {gift.namePt}
                      </p>
                      {gift.category && (
                        <p className="text-xs text-muted mt-0.5">{gift.category}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={statusVariantMap[gift.status] ?? "default"}>
                        {gift.status.replace("_", " ")}
                      </Badge>
                      {pendingPixCount > 0 && (
                        <Badge variant="pending">
                          {pendingPixCount} pending PIX
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted mb-1">
                      <span>{formatCurrency(gift.collectedCents, currency)}</span>
                      <span>{formatCurrency(gift.priceCents, currency)}</span>
                    </div>
                    <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted mt-1 text-right">{percent}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-secondary/50">
                  <span
                    className="text-muted text-xl leading-none select-none cursor-grab"
                    aria-hidden="true"
                    title="Drag to reorder"
                  >
                    ⋮⋮
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setContributionsModalGift(gift);
                      }}
                    >
                      Contributions
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error hover:text-error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(gift);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
              </div>
            );
            })}
          </div>
        </div>
      ) : (
        <EmptyState message='No gifts yet. Click "Add Gift" to create one.' />
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingGift ? "Edit Gift" : "Add Gift"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs tabs={langTabs} activeTab={langTab} onTabChange={setLangTab} />

          {/* Language-specific fields */}
          <div
            role="tabpanel"
            id={`tabpanel-${langTab}`}
            aria-labelledby={`tab-${langTab}`}
          >
            {langTab === "pt" && (
              <div className="space-y-3">
                <Input
                  label="Name (PT)"
                  required
                  value={form.namePt}
                  onChange={(e) => updateField("namePt", e.target.value)}
                  placeholder="Nome do presente"
                />
                <Input
                  label="Description (PT)"
                  value={form.descriptionPt}
                  onChange={(e) => updateField("descriptionPt", e.target.value)}
                  placeholder="Descricao opcional"
                />
              </div>
            )}
            {langTab === "en" && (
              <div className="space-y-3">
                <Input
                  label="Name (EN)"
                  value={form.nameEn}
                  onChange={(e) => updateField("nameEn", e.target.value)}
                  placeholder="Gift name"
                />
                <Input
                  label="Description (EN)"
                  value={form.descriptionEn}
                  onChange={(e) => updateField("descriptionEn", e.target.value)}
                  placeholder="Optional description"
                />
              </div>
            )}
            {langTab === "es" && (
              <div className="space-y-3">
                <Input
                  label="Name (ES)"
                  value={form.nameEs}
                  onChange={(e) => updateField("nameEs", e.target.value)}
                  placeholder="Nombre del regalo"
                />
                <Input
                  label="Description (ES)"
                  value={form.descriptionEs}
                  onChange={(e) => updateField("descriptionEs", e.target.value)}
                  placeholder="Descripcion opcional"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={`Price (${getCurrencySymbol()})`}
              type="number"
              required
              min="0"
              step="0.01"
              value={form.priceCents}
              onChange={(e) => updateField("priceCents", e.target.value)}
              placeholder="0.00"
            />
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              placeholder="e.g., Kitchen, Travel"
            />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-heading mb-2">Contribution mode</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "open", label: "Open amount" },
                  { id: "fixed", label: "Fixed options" },
                  { id: "quotes", label: "Quotes / cotas" },
                ].map((mode) => (
                  <Button
                    key={mode.id}
                    type="button"
                    size="sm"
                    variant={form.contributionMode === mode.id ? "primary" : "secondary"}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        contributionMode: mode.id as GiftFormState["contributionMode"],
                      }))
                    }
                  >
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>

            <Toggle
              checked={form.showCollectedAmount}
              onChange={(checked) =>
                setForm((prev) => ({ ...prev, showCollectedAmount: checked }))
              }
              label="Show collected amount"
              description="Show how much has already been collected"
            />
            <Toggle
              checked={form.showGoalAmount}
              onChange={(checked) =>
                setForm((prev) => ({ ...prev, showGoalAmount: checked }))
              }
              label="Show desired goal"
              description="Show the target amount for this gift"
            />
            <Toggle
              checked={form.showFundedBadge}
              onChange={(checked) =>
                setForm((prev) => ({ ...prev, showFundedBadge: checked }))
              }
              label='Show "Fully funded" badge'
              description="When disabled, contributions stay open even after reaching the goal"
            />
          </div>

          {form.contributionMode === "fixed" && (
            <Input
              label="Fixed options (comma-separated)"
              value={form.fixedContributionOptions}
              onChange={(e) => updateField("fixedContributionOptions", e.target.value)}
              placeholder="100, 200, 350"
              helperText="Values in currency units (e.g. 100 = R$100.00)."
            />
          )}

          {form.contributionMode === "quotes" && (
            <Input
              label="Quote unit value"
              type="number"
              min="1"
              step="0.01"
              value={form.quoteUnitCents}
              onChange={(e) => updateField("quoteUnitCents", e.target.value)}
              placeholder="150.00"
              helperText="Each cota will use this amount. Guests choose quantity."
            />
          )}

          <ImageUpload
            label="Image"
            folder="gifts"
            value={form.mediaUrl || form.imageUrl || null}
            onUpload={(media) => {
              setForm((prev) => ({
                ...prev,
                mediaId: media.id,
                mediaUrl: media.url,
                imageUrl: media.url,
              }));
            }}
            onRemove={() => {
              setForm((prev) => ({
                ...prev,
                mediaId: null,
                mediaUrl: null,
                imageUrl: "",
              }));
            }}
            aspectRatio="4/3"
          />

          <FormActions
            onCancel={closeModal}
            submitLabel={editingGift ? "Save Changes" : "Create Gift"}
            loading={isSaving}
            className="sticky bottom-0 z-10 bg-warm-white border-t border-secondary pt-3 mt-6"
          />
        </form>
      </Modal>

      <Modal
        open={!!contributionsModalGift}
        onClose={closeContributionsModal}
        title={contributionsModalGift ? `Contributions · ${contributionsModalGift.namePt}` : "Contributions"}
        size="lg"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-heading">PIX confirmations</h3>
            <Badge variant="default">{sortedContributions.length} total</Badge>
          </div>

          {contributionsLoading ? (
            <div className="space-y-2">
              <Skeleton height={56} className="rounded-lg" />
              <Skeleton height={56} className="rounded-lg" />
            </div>
          ) : contributionsError ? (
            <ErrorAlert>Failed to load contributions for this gift.</ErrorAlert>
          ) : sortedContributions.length === 0 ? (
            <p className="text-xs text-muted">No contributions yet.</p>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {sortedContributions.map((contribution) => {
                const canReviewPix =
                  contribution.paymentMethod === "pix" &&
                  contribution.paymentStatus === "pending";
                const paymentStatusVariant: BadgeVariant =
                  contribution.paymentStatus === "confirmed"
                    ? "confirmed"
                    : contribution.paymentStatus === "failed"
                      ? "declined"
                      : "pending";

                return (
                  <div
                    key={contribution.id}
                    className="rounded-lg border border-secondary bg-surface p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-heading truncate">
                          {contribution.contributorName || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {new Date(contribution.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-heading whitespace-nowrap">
                        {formatCurrency(contribution.amountCents, currency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="info">{contribution.paymentMethod.toUpperCase()}</Badge>
                      <Badge variant={paymentStatusVariant}>
                        {contribution.paymentStatus}
                      </Badge>
                    </div>

                    {canReviewPix && (
                      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-secondary/60">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isContributionUpdating}
                          onClick={() =>
                            handleContributionAction(contribution.id, "reject")
                          }
                        >
                          Reject
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          loading={
                            isContributionUpdating &&
                            contributionActionTarget === contribution.id
                          }
                          onClick={() =>
                            handleContributionAction(contribution.id, "confirm")
                          }
                        >
                          Confirm received
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Gift"
        loading={deleteMutation.isPending}
      >
        <p>
          Are you sure you want to delete{" "}
          <strong>{deleteTarget?.namePt}</strong>? This cannot be undone.
        </p>
      </ConfirmModal>
    </div>
  );
}

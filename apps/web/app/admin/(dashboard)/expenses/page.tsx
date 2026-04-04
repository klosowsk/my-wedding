"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FormActions } from "@/components/ui/FormActions";
import { Toggle } from "@/components/ui/Toggle";
import { formatCurrency } from "@marriage/shared";
import { EXPENSE_CATEGORIES } from "@marriage/shared";
import type { ExpenseSummary } from "@marriage/shared";

interface Expense {
  id: string;
  title: string;
  vendor: string | null;
  budgetCents: number;
  amountCents: number | null;
  category: string;
  expenseDate: string;
  paymentMethod: string | null;
  paid: boolean;
  notes: string | null;
  createdBy: { id: string; name: string } | null;
  createdAt: string;
}

interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
}

interface ExpenseFormState {
  title: string;
  vendor: string;
  budgetCents: string;
  amountCents: string;
  category: string;
  expenseDate: string;
  paymentMethod: string;
  paid: boolean;
  notes: string;
}

const emptyForm: ExpenseFormState = {
  title: "",
  vendor: "",
  budgetCents: "",
  amountCents: "",
  category: "other",
  expenseDate: new Date().toISOString().slice(0, 10),
  paymentMethod: "",
  paid: false,
  notes: "",
};

const categoryOptions = Object.entries(EXPENSE_CATEGORIES).map(
  ([value, { en, icon }]) => ({
    value,
    label: `${icon} ${en}`,
  })
);

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <Skeleton height={28} width={100} className="mb-1" />
          <Skeleton height={14} width={80} />
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <div className="flex items-center gap-4">
            <Skeleton width={32} height={32} className="rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton height={16} width={200} />
              <Skeleton height={12} width={150} />
            </div>
            <Skeleton height={16} width={80} />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function AdminExpensesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [form, setForm] = useState<ExpenseFormState>(emptyForm);

  // Filters
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPaid, setFilterPaid] = useState("");

  // Build query params
  const queryParams = new URLSearchParams();
  if (filterCategory) queryParams.set("category", filterCategory);
  if (filterPaid) queryParams.set("paid", filterPaid);
  const queryString = queryParams.toString();

  const { data, isLoading } = useQuery<ExpenseListResponse>({
    queryKey: ["admin", "expenses", queryString],
    queryFn: () =>
      apiGet(`/api/v1/admin/expenses${queryString ? `?${queryString}` : ""}`),
  });

  const { data: summary, isLoading: summaryLoading } =
    useQuery<ExpenseSummary>({
      queryKey: ["admin", "expenses", "summary"],
      queryFn: () => apiGet("/api/v1/admin/expenses/summary"),
    });

  const { data: settings } = useQuery<{
    currencyCode: string;
    currencyLocale: string;
  }>({
    queryKey: ["admin", "settings", "expenses-currency"],
    queryFn: () => apiGet("/api/v1/admin/settings"),
    staleTime: 60_000,
  });

  const currency = {
    code: settings?.currencyCode,
    locale: settings?.currencyLocale,
  };

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost("/api/v1/admin/expenses", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "expenses"] });
      toast({ message: "Expense created", type: "success" });
      closeModal();
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to create expense", type: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiPatch(`/api/v1/admin/expenses/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "expenses"] });
      toast({ message: "Expense updated", type: "success" });
      closeModal();
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to update expense", type: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/v1/admin/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "expenses"] });
      toast({ message: "Expense deleted", type: "success" });
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to delete expense", type: "error" });
    },
  });

  function openCreate() {
    setEditingExpense(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditingExpense(expense);
    setForm({
      title: expense.title,
      vendor: expense.vendor ?? "",
      budgetCents: String(expense.budgetCents / 100),
      amountCents: expense.amountCents != null ? String(expense.amountCents / 100) : "",
      category: expense.category,
      expenseDate: expense.expenseDate,
      paymentMethod: expense.paymentMethod ?? "",
      paid: expense.paid,
      notes: expense.notes ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingExpense(null);
    setForm(emptyForm);
  }

  function updateField<K extends keyof ExpenseFormState>(
    field: K,
    value: ExpenseFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = {
      title: form.title,
      vendor: form.vendor || null,
      budgetCents: Math.round(parseFloat(form.budgetCents || "0") * 100),
      amountCents: form.amountCents
        ? Math.round(parseFloat(form.amountCents) * 100)
        : null,
      category: form.category,
      expenseDate: form.expenseDate,
      paymentMethod: form.paymentMethod || null,
      paid: form.paid,
      notes: form.notes || null,
    };

    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, body });
    } else {
      createMutation.mutate(body);
    }
  }

  function handleExport() {
    window.open("/api/v1/admin/expenses/export", "_blank");
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const expenses = data?.expenses ?? [];

  const getCatInfo = (category: string) =>
    EXPENSE_CATEGORIES[category as keyof typeof EXPENSE_CATEGORIES] ?? {
      en: category,
      icon: "📦",
    };

  return (
    <div>
      <PageHeader title="Expenses">
        <Button size="sm" variant="secondary" onClick={handleExport}>
          Export CSV
        </Button>
        <Button size="sm" onClick={openCreate}>
          + Add Expense
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      {summaryLoading ? (
        <SummarySkeleton />
      ) : summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <p className="text-2xl font-bold text-heading font-body">
              {formatCurrency(summary.grandTotal.paid, currency)}
            </p>
            <p className="text-sm text-muted">Paid</p>
          </Card>
          <Card>
            <p className="text-2xl font-bold text-heading font-body">
              {formatCurrency(summary.grandTotal.budgeted, currency)}
            </p>
            <p className="text-sm text-muted">Budgeted</p>
          </Card>
          <Card>
            <p
              className={`text-2xl font-bold font-body ${
                summary.grandTotal.overUnder > 0
                  ? "text-error"
                  : summary.grandTotal.overUnder < 0
                    ? "text-accent"
                    : "text-heading"
              }`}
            >
              {summary.grandTotal.overUnder > 0 ? "+" : ""}
              {formatCurrency(summary.grandTotal.overUnder, currency)}
            </p>
            <p className="text-sm text-muted">Over / Under</p>
          </Card>
          <Card>
            <p className="text-2xl font-bold text-heading font-body">
              {summary.costPerGuest.confirmedGuests > 0
                ? formatCurrency(summary.costPerGuest.paidCostPerGuest, currency)
                : "—"}
            </p>
            <p className="text-sm text-muted">
              Cost / Guest
              {summary.costPerGuest.confirmedGuests > 0 &&
                ` (${summary.costPerGuest.confirmedGuests})`}
            </p>
          </Card>
        </div>
      ) : null}

      {/* Category Breakdown */}
      {summary && summary.byCategory.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {summary.byCategory
            .sort((a, b) => b.budgeted - a.budgeted)
            .map((cat) => {
              const info = getCatInfo(cat.category);
              const percent =
                summary.grandTotal.budgeted > 0
                  ? Math.round((cat.budgeted / summary.grandTotal.budgeted) * 100)
                  : 0;
              return (
                <Badge key={cat.category} variant="default">
                  {info.icon} {info.en} {formatCurrency(cat.budgeted, currency)} ({percent}%)
                </Badge>
              );
            })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-auto"
        >
          <option value="">All Categories</option>
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Select
          value={filterPaid}
          onChange={(e) => setFilterPaid(e.target.value)}
          className="w-auto"
        >
          <option value="">All</option>
          <option value="true">Paid</option>
          <option value="false">Planned</option>
        </Select>
      </div>

      {/* Expense List */}
      {isLoading ? (
        <TableSkeleton />
      ) : expenses.length > 0 ? (
        <div className="space-y-3">
          {expenses.map((expense) => {
            const catInfo = getCatInfo(expense.category);
            const effectiveAmount =
              expense.paid && expense.amountCents != null
                ? expense.amountCents
                : expense.budgetCents;

            return (
              <Card
                key={expense.id}
                hover
                className="cursor-pointer"
              >
                <div
                  onClick={() => openEdit(expense)}
                  className="flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  {/* Category icon */}
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-lg shrink-0">
                    {catInfo.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-heading text-sm truncate">
                        {expense.title}
                      </p>
                      <Badge
                        variant={expense.paid ? "confirmed" : "default"}
                      >
                        {expense.paid ? "Paid" : "Planned"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted truncate">
                      {catInfo.en}
                      {expense.vendor && ` · ${expense.vendor}`} ·{" "}
                      {expense.expenseDate}
                      {expense.paymentMethod && ` · ${expense.paymentMethod}`}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-heading text-sm">
                      {formatCurrency(effectiveAmount, currency)}
                    </p>
                    {expense.paid &&
                      expense.amountCents != null &&
                      expense.amountCents !== expense.budgetCents && (
                        <p className="text-xs text-muted line-through">
                          {formatCurrency(expense.budgetCents, currency)}
                        </p>
                      )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error hover:text-error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(expense);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState message='No expenses yet. Click "+ Add Expense" to start tracking costs.' />
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingExpense ? "Edit Expense" : "Add Expense"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title *"
            required
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g., Venue deposit"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              required
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <Input
              label="Vendor"
              value={form.vendor}
              onChange={(e) => updateField("vendor", e.target.value)}
              placeholder="e.g., Celebration Venue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Budget *"
              type="number"
              required
              min="0"
              step="0.01"
              value={form.budgetCents}
              onChange={(e) => updateField("budgetCents", e.target.value)}
              placeholder="0.00"
            />
            <Input
              label="Actual Amount"
              type="number"
              min="0"
              step="0.01"
              value={form.amountCents}
              onChange={(e) => updateField("amountCents", e.target.value)}
              placeholder="Fill when paid"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date *"
              type="date"
              required
              value={form.expenseDate}
              onChange={(e) => updateField("expenseDate", e.target.value)}
            />
            <Input
              label="Payment Method"
              value={form.paymentMethod}
              onChange={(e) => updateField("paymentMethod", e.target.value)}
              placeholder="e.g., pix, cash, card"
            />
          </div>

          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Any extra details"
          />

          <Toggle
            checked={form.paid}
            onChange={(checked) => updateField("paid", checked)}
            label="Already paid"
          />

          <FormActions
            onCancel={closeModal}
            submitLabel={editingExpense ? "Save Changes" : "Create Expense"}
            loading={isSaving}
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Expense"
        loading={deleteMutation.isPending}
      >
        <p>
          Are you sure you want to delete{" "}
          <strong>{deleteTarget?.title}</strong>? This cannot be undone.
        </p>
      </ConfirmModal>
    </div>
  );
}

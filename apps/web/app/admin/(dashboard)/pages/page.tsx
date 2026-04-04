"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
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

interface Page {
  id: string;
  slug: string;
  icon: string | null;
  titlePt: string;
  titleEn: string | null;
  titleEs: string | null;
  contentPt: string;
  contentEn: string | null;
  contentEs: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
}

interface PageFormState {
  slug: string;
  icon: string;
  titlePt: string;
  titleEn: string;
  titleEs: string;
  contentPt: string;
  contentEn: string;
  contentEs: string;
  published: boolean;
}

const emptyForm: PageFormState = {
  slug: "",
  icon: "",
  titlePt: "",
  titleEn: "",
  titleEs: "",
  contentPt: "",
  contentEn: "",
  contentEs: "",
  published: false,
};

const langTabs = [
  { id: "pt", label: "PT" },
  { id: "en", label: "EN" },
  { id: "es", label: "ES" },
];

function PagesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} height={72} />
      ))}
    </div>
  );
}

export default function AdminPagesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);
  const [form, setForm] = useState<PageFormState>(emptyForm);
  const [langTab, setLangTab] = useState("pt");

  const { data: pages, isLoading, error } = useQuery<Page[]>({
    queryKey: ["admin", "pages"],
    queryFn: () => apiGet("/api/v1/admin/pages"),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost("/api/v1/admin/pages", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pages"] });
      toast({ message: "Page created", type: "success" });
      closeModal();
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to create page", type: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiPatch(`/api/v1/admin/pages/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pages"] });
      toast({ message: "Page updated", type: "success" });
      closeModal();
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to update page", type: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/v1/admin/pages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pages"] });
      toast({ message: "Page deleted", type: "success" });
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to delete page", type: "error" });
    },
  });

  function openCreate() {
    setEditingPage(null);
    setForm(emptyForm);
    setLangTab("pt");
    setModalOpen(true);
  }

  function openEdit(page: Page) {
    setEditingPage(page);
    setForm({
      slug: page.slug,
      icon: page.icon ?? "",
      titlePt: page.titlePt,
      titleEn: page.titleEn ?? "",
      titleEs: page.titleEs ?? "",
      contentPt: page.contentPt,
      contentEn: page.contentEn ?? "",
      contentEs: page.contentEs ?? "",
      published: page.published,
    });
    setLangTab("pt");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingPage(null);
    setForm(emptyForm);
  }

  function updateField(field: keyof PageFormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      slug: form.slug,
      icon: form.icon || null,
      titlePt: form.titlePt,
      titleEn: form.titleEn || null,
      titleEs: form.titleEs || null,
      contentPt: form.contentPt,
      contentEn: form.contentEn || null,
      contentEs: form.contentEs || null,
      published: form.published,
    };

    if (editingPage) {
      updateMutation.mutate({ id: editingPage.id, body });
    } else {
      createMutation.mutate(body);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <PageHeader title="Pages">
        <Button size="sm" onClick={openCreate}>
          + Add Page
        </Button>
      </PageHeader>

      {error && (
        <ErrorAlert className="mb-6">
          Failed to load pages. Please try again.
        </ErrorAlert>
      )}

      {isLoading ? (
        <PagesSkeleton />
      ) : pages && pages.length > 0 ? (
        <div className="space-y-2">
          {pages.map((page) => (
            <Card
              key={page.id}
              hover
              className="cursor-pointer"
            >
              <div
                className="flex items-center justify-between"
                onClick={() => openEdit(page)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {page.icon && (
                      <span className="text-lg">{page.icon}</span>
                    )}
                    <p className="font-semibold text-heading text-sm">
                      {page.titlePt}
                    </p>
                    <Badge variant={page.published ? "confirmed" : "default"}>
                      {page.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    /{page.slug}
                  </p>
                </div>
                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="sm" onClick={() => openEdit(page)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error hover:text-error"
                    onClick={() => setDeleteTarget(page)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState message='No pages yet. Click "Add Page" to create one.' />
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingPage ? "Edit Page" : "Add Page"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[1fr_80px] gap-3">
            <Input
              label="Slug"
              required
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''))}
              placeholder="e.g., dress-code"
              disabled={!!editingPage}
              helperText={editingPage ? "Slug cannot be changed after creation" : "Only lowercase letters, numbers, and hyphens (e.g. dress-code)"}
            />
            <Input
              label="Icon"
              value={form.icon}
              onChange={(e) => updateField("icon", e.target.value)}
              placeholder="e.g. 👔"
              className="text-center text-xl"
            />
          </div>

          <Tabs tabs={langTabs} activeTab={langTab} onTabChange={setLangTab} />

          <div
            role="tabpanel"
            id={`tabpanel-${langTab}`}
            aria-labelledby={`tab-${langTab}`}
          >
            {langTab === "pt" && (
              <div className="space-y-3">
                <Input
                  label="Title (PT)"
                  required
                  value={form.titlePt}
                  onChange={(e) => updateField("titlePt", e.target.value)}
                  placeholder="Titulo da pagina"
                />
                <Textarea
                  label="Content (PT) — Markdown"
                  required
                  value={form.contentPt}
                  onChange={(e) => updateField("contentPt", e.target.value)}
                  placeholder="Conteudo em markdown..."
                />
              </div>
            )}
            {langTab === "en" && (
              <div className="space-y-3">
                <Input
                  label="Title (EN)"
                  value={form.titleEn}
                  onChange={(e) => updateField("titleEn", e.target.value)}
                  placeholder="Page title"
                />
                <Textarea
                  label="Content (EN) — Markdown"
                  value={form.contentEn}
                  onChange={(e) => updateField("contentEn", e.target.value)}
                  placeholder="Markdown content..."
                />
              </div>
            )}
            {langTab === "es" && (
              <div className="space-y-3">
                <Input
                  label="Title (ES)"
                  value={form.titleEs}
                  onChange={(e) => updateField("titleEs", e.target.value)}
                  placeholder="Titulo de la pagina"
                />
                <Textarea
                  label="Content (ES) — Markdown"
                  value={form.contentEs}
                  onChange={(e) => updateField("contentEs", e.target.value)}
                  placeholder="Contenido en markdown..."
                />
              </div>
            )}
          </div>

          {/* Published toggle */}
          <Toggle
            checked={form.published}
            onChange={(checked) => updateField("published", checked)}
            label="Published"
          />

          <FormActions
            onCancel={closeModal}
            submitLabel={editingPage ? "Save Changes" : "Create Page"}
            loading={isSaving}
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Page"
        loading={deleteMutation.isPending}
      >
        <p>
          Are you sure you want to delete the page{" "}
          <strong>{deleteTarget?.titlePt}</strong> (/{deleteTarget?.slug})? This
          cannot be undone.
        </p>
      </ConfirmModal>
    </div>
  );
}

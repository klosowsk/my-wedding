"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormActions } from "@/components/ui/FormActions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import ImageUpload from "@/components/admin/ImageUpload";

interface Photo {
  id: string;
  filename: string;
  mediaId: string | null;
  captionPt: string | null;
  captionEn: string | null;
  captionEs: string | null;
  section: string | null;
  visible: boolean;
  sortOrder: number;
  // Joined from media
  media?: {
    id: string;
    url: string;
    thumbUrl: string | null;
    width: number | null;
    height: number | null;
    blurhash: string | null;
    status: string;
  } | null;
}

interface PhotoEdit {
  id: string;
  captionPt: string;
  captionEn: string;
  captionEs: string;
  section: string;
  visible: boolean;
  sortOrder: number;
}

function toPhotoEdit(photo: Photo): PhotoEdit {
  return {
    id: photo.id,
    captionPt: photo.captionPt ?? "",
    captionEn: photo.captionEn ?? "",
    captionEs: photo.captionEs ?? "",
    section: photo.section ?? "",
    visible: photo.visible,
    sortOrder: photo.sortOrder,
  };
}

function getPhotoUrl(photo: Photo): string {
  if (photo.media?.thumbUrl) return photo.media.thumbUrl;
  if (photo.media?.url) return photo.media.url;
  return `/gallery/${photo.filename}`;
}

function getPhotoFullUrl(photo: Photo): string {
  if (photo.media?.url) return photo.media.url;
  return `/gallery/${photo.filename}`;
}

const captionTabs = [
  { id: "pt", label: "PT" },
  { id: "en", label: "EN" },
  { id: "es", label: "ES" },
];

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} height={200} className="rounded-lg" />
      ))}
    </div>
  );
}

export default function AdminGalleryPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [edits, setEdits] = useState<Map<string, PhotoEdit>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);
  const [editModalPhoto, setEditModalPhoto] = useState<Photo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);
  const [captionLangTab, setCaptionLangTab] = useState("pt");

  const { data: photos, isLoading, error } = useQuery<Photo[]>({
    queryKey: ["admin", "gallery"],
    queryFn: () => apiGet("/api/v1/admin/gallery"),
  });

  // Keep edits map in sync with photos list (adds new uploads, removes deleted photos)
  useEffect(() => {
    if (!photos) return;

    setEdits((prev) => {
      const next = new Map(prev);
      let changed = false;
      const ids = new Set(photos.map((p) => p.id));

      photos.forEach((p) => {
        if (!next.has(p.id)) {
          next.set(p.id, toPhotoEdit(p));
          changed = true;
        }
      });

      for (const id of next.keys()) {
        if (!ids.has(id)) {
          next.delete(id);
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [photos]);

  const saveMutation = useMutation({
    mutationFn: (body: PhotoEdit[]) =>
      apiPatch("/api/v1/admin/gallery", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
      toast({ message: "Gallery saved", type: "success" });
      setHasChanges(false);
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to save gallery", type: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/v1/admin/gallery/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
      toast({ message: "Photo deleted", type: "success" });
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to delete", type: "error" });
    },
  });

  function getBaseEdit(photoId: string): PhotoEdit | null {
    if (editModalPhoto?.id === photoId) return toPhotoEdit(editModalPhoto);
    const sourcePhoto = photos?.find((p) => p.id === photoId);
    return sourcePhoto ? toPhotoEdit(sourcePhoto) : null;
  }

  function toggleVisibility(photoId: string) {
    setEdits((prev) => {
      const next = new Map(prev);
      const current = next.get(photoId) ?? getBaseEdit(photoId);
      if (current) {
        next.set(photoId, { ...current, visible: !current.visible });
      }
      return next;
    });
    setHasChanges(true);
  }

  function openEditModal(photo: Photo) {
    setEdits((prev) => {
      if (prev.has(photo.id)) return prev;
      const next = new Map(prev);
      next.set(photo.id, toPhotoEdit(photo));
      return next;
    });
    setEditModalPhoto(photo);
  }

  function saveEditModal() {
    if (!editModalPhoto) return;
    handleSaveAll(() => setEditModalPhoto(null));
  }

  function updateEdit(photoId: string, field: keyof PhotoEdit, value: string | boolean | number) {
    setEdits((prev) => {
      const next = new Map(prev);
      const current = next.get(photoId) ?? getBaseEdit(photoId);
      if (current) {
        next.set(photoId, { ...current, [field]: value });
      }
      return next;
    });
    setHasChanges(true);
  }

  function reorderPhotos(fromId: string, toId: string) {
    if (!photos || fromId === toId) return;

    setEdits((prev) => {
      const next = new Map(prev);
      const ordered = photos
        .map((photo) => next.get(photo.id) ?? toPhotoEdit(photo))
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const fromIndex = ordered.findIndex((photo) => photo.id === fromId);
      const toIndex = ordered.findIndex((photo) => photo.id === toId);
      if (fromIndex === -1 || toIndex === -1) return prev;

      const [moved] = ordered.splice(fromIndex, 1);
      if (!moved) return prev;
      ordered.splice(toIndex, 0, moved);

      let changed = false;
      ordered.forEach((photo, index) => {
        const updated = { ...photo, sortOrder: index };
        if (photo.sortOrder !== index) changed = true;
        next.set(photo.id, updated);
      });

      return changed ? next : prev;
    });

    setHasChanges(true);
  }

  function handleSaveAll(onSuccess?: () => void) {
    const photoEdits = Array.from(edits.values());
    saveMutation.mutate(photoEdits, {
      onSuccess: () => onSuccess?.(),
    });
  }

  async function handleUpload(media: { id: string; url: string; thumbUrl: string | null }) {
    setUploading(true);
    try {
      // Create photo record linked to the uploaded media
      await apiPost("/api/v1/admin/gallery", {
        mediaId: media.id,
        filename: `media-${media.id}`,
        sortOrder: photos?.length ?? 0,
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
      toast({ message: "Photo uploaded", type: "success" });
    } catch (err) {
      toast({
        message: err instanceof Error ? err.message : "Failed to create photo",
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  }

  const orderedPhotos = photos
    ? [...photos].sort((a, b) => {
        const aOrder = edits.get(a.id)?.sortOrder ?? a.sortOrder;
        const bOrder = edits.get(b.id)?.sortOrder ?? b.sortOrder;
        return aOrder - bOrder;
      })
    : [];

  return (
    <div>
      <PageHeader title="Gallery">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleSaveAll()}
            loading={saveMutation.isPending}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </div>
      </PageHeader>

      {error && (
        <ErrorAlert className="mb-6">
          Failed to load gallery. Please try again.
        </ErrorAlert>
      )}

      {/* Upload zone */}
      <div className="mb-6">
        <ImageUpload
          folder="gallery"
          label="Upload Photo"
          onUpload={handleUpload}
          aspectRatio="16/9"
        />
      </div>

      {isLoading ? (
        <GallerySkeleton />
      ) : orderedPhotos.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted mb-2">Drag photos to reorder them.</p>
          {orderedPhotos.map((photo) => {
            const edit = edits.get(photo.id);
            const isVisible = edit?.visible ?? photo.visible;
            const displayCaptionPt = edit ? edit.captionPt : (photo.captionPt ?? "");

            return (
              <div
                key={photo.id}
                draggable
                onDragStart={(e) => {
                  setDraggedPhotoId(photo.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedPhotoId) reorderPhotos(draggedPhotoId, photo.id);
                  setDraggedPhotoId(null);
                }}
                onDragEnd={() => setDraggedPhotoId(null)}
                className={draggedPhotoId === photo.id ? "opacity-60" : undefined}
              >
                <Card className="!p-3">
                  <div className="flex items-center gap-4">
                    {/* Drag Handle */}
                    <div
                      className="text-muted text-xl leading-none select-none cursor-grab"
                      aria-hidden="true"
                      title="Drag to reorder"
                    >
                      ⋮⋮
                    </div>

                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-surface overflow-hidden shrink-0">
                      <img
                        src={getPhotoUrl(photo)}
                        alt={displayCaptionPt || photo.filename}
                        className={[
                          "w-full h-full object-cover",
                          !isVisible && "opacity-40 grayscale",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-heading truncate">
                        {displayCaptionPt || photo.filename}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {photo.media
                          ? `${photo.media.width}×${photo.media.height} • WebP`
                          : photo.filename}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {(edit?.section || photo.section) && (
                          <Badge variant="default">
                            {edit?.section || photo.section}
                          </Badge>
                        )}
                        <Badge variant={isVisible ? "confirmed" : "declined"}>
                          {isVisible ? "Visible" : "Hidden"}
                        </Badge>
                        {photo.media && (
                          <Badge variant="info">S3</Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(photo)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(photo.id)}
                      >
                        {isVisible ? "Hide" : "Show"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-error hover:text-error"
                        onClick={() => setDeleteTarget(photo)}
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
      ) : (
        <EmptyState message="No photos yet. Upload your first photo above." />
      )}

      {/* Edit Caption/Section Modal */}
      <Modal
        open={!!editModalPhoto}
        onClose={() => setEditModalPhoto(null)}
        title="Edit Photo"
        size="md"
      >
        {editModalPhoto && (() => {
          const edit = edits.get(editModalPhoto.id);
          return (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveEditModal();
              }}
            >
              <div className="w-full h-48 rounded-lg bg-surface overflow-hidden">
                <img
                  src={getPhotoFullUrl(editModalPhoto)}
                  alt={editModalPhoto.filename}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-3">
                <Tabs
                  tabs={captionTabs}
                  activeTab={captionLangTab}
                  onTabChange={setCaptionLangTab}
                />

                {captionLangTab === "pt" && (
                  <Input
                    label="Caption (PT)"
                    value={edit?.captionPt ?? editModalPhoto.captionPt ?? ""}
                    onChange={(e) =>
                      updateEdit(editModalPhoto.id, "captionPt", e.target.value)
                    }
                    placeholder="Legenda em português..."
                  />
                )}

                {captionLangTab === "en" && (
                  <Input
                    label="Caption (EN)"
                    value={edit?.captionEn ?? editModalPhoto.captionEn ?? ""}
                    onChange={(e) =>
                      updateEdit(editModalPhoto.id, "captionEn", e.target.value)
                    }
                    placeholder="Caption in English..."
                  />
                )}

                {captionLangTab === "es" && (
                  <Input
                    label="Caption (ES)"
                    value={edit?.captionEs ?? editModalPhoto.captionEs ?? ""}
                    onChange={(e) =>
                      updateEdit(editModalPhoto.id, "captionEs", e.target.value)
                    }
                    placeholder="Leyenda en español..."
                  />
                )}
              </div>
              <Input
                label="Section"
                value={edit?.section ?? editModalPhoto.section ?? ""}
                onChange={(e) =>
                  updateEdit(editModalPhoto.id, "section", e.target.value)
                }
                placeholder="e.g., Ceremony, Reception"
              />
              <FormActions
                onCancel={() => setEditModalPhoto(null)}
                submitLabel="Done"
                loading={saveMutation.isPending}
              />
            </form>
          );
        })()}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Photo"
        loading={deleteMutation.isPending}
      >
        <p>
          Are you sure you want to delete this photo? This will also remove the
          image from storage. This cannot be undone.
        </p>
      </ConfirmModal>
    </div>
  );
}

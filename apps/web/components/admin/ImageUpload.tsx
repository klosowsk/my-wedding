"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE } from "@marriage/shared";

interface MediaResult {
  id: string;
  url: string;
  thumbUrl: string | null;
  width: number;
  height: number;
  blurhash: string | null;
  status: string;
}

interface ImageUploadProps {
  /** Current image URL (for preview) */
  value?: string | null;
  /** Called with the uploaded media result */
  onUpload: (media: MediaResult) => void;
  /** Called when the image is removed */
  onRemove?: () => void;
  /** S3 folder for the upload (default: "uploads") */
  folder?: string;
  /** Custom label */
  label?: string;
  /** Aspect ratio for the preview container */
  aspectRatio?: string;
  /** Additional class names */
  className?: string;
}

const ACCEPT = ALLOWED_IMAGE_TYPES.join(",");
const MAX_MB = MAX_UPLOAD_SIZE / 1024 / 1024;

export default function ImageUpload({
  value,
  onUpload,
  onRemove,
  folder = "uploads",
  label = "Image",
  aspectRatio = "4/3",
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Client-side validation
      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
        )
      ) {
        setError(
          `Unsupported format. Allowed: JPEG, PNG, WebP, HEIC/HEIF`
        );
        return;
      }
      if (file.size > MAX_UPLOAD_SIZE) {
        setError(
          `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: ${MAX_MB}MB`
        );
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/v1/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data.message || `Upload failed (${res.status})`
          );
        }

        const media: MediaResult = await res.json();
        onUpload(media);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Upload failed"
        );
      } finally {
        setUploading(false);
      }
    },
    [folder, onUpload]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-heading mb-1.5">
          {label}
        </label>
      )}

      {value ? (
        /* --- Preview --- */
        <div className="relative group">
          <div
            className="w-full rounded-lg bg-surface overflow-hidden border border-secondary"
            style={{ aspectRatio }}
          >
            <img
              src={value}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Replace"}
            </Button>
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                className="!text-white hover:!bg-white/20"
                onClick={onRemove}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* --- Drop zone --- */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          disabled={uploading}
          className={[
            "w-full rounded-lg border-2 border-dashed transition-colors",
            "flex flex-col items-center justify-center gap-2 cursor-pointer",
            "text-muted text-sm py-8",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-secondary hover:border-primary/50 hover:bg-surface/50",
            uploading && "opacity-50 cursor-wait",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {uploading ? (
            <>
              <svg
                className="w-8 h-8 animate-spin text-primary"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Processing image...</span>
            </>
          ) : (
            <>
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 16v-8m0 0l-3 3m3-3l3 3M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5M7.5 12H3m18 0h-4.5"
                />
              </svg>
              <span>
                Click or drag to upload
              </span>
              <span className="text-xs text-muted/70">
                JPEG, PNG, WebP, HEIC • Max {MAX_MB}MB
              </span>
            </>
          )}
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <p className="text-xs text-error mt-1.5">{error}</p>
      )}
    </div>
  );
}

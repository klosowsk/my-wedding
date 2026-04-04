"use client";

import { useEffect, useRef, useState } from "react";

interface Photo {
  id: string;
  src: string;
  alt?: string;
  caption?: string | null;
  section?: string | null;
}

interface PhotoGridLabels {
  close: string;
  previous: string;
  next: string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
}

interface PhotoGridProps {
  photos: Photo[];
  className?: string;
  labels?: Partial<PhotoGridLabels>;
}

const defaultLabels: PhotoGridLabels = {
  close: "Close",
  previous: "Previous",
  next: "Next",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetZoom: "Reset zoom",
};

export default function PhotoGrid({ photos, className = "", labels }: PhotoGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const ui = { ...defaultLabels, ...labels };

  const selectedPhoto = selectedIndex === null ? null : photos[selectedIndex];

  const closeViewer = () => {
    setSelectedIndex(null);
    setZoom(1);
  };

  const nextPhoto = () => {
    setSelectedIndex((prev) => {
      if (prev === null || photos.length === 0) return prev;
      return (prev + 1) % photos.length;
    });
  };

  const previousPhoto = () => {
    setSelectedIndex((prev) => {
      if (prev === null || photos.length === 0) return prev;
      return (prev - 1 + photos.length) % photos.length;
    });
  };

  const zoomIn = () => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))));
  const zoomOut = () => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))));
  const resetZoom = () => setZoom(1);

  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => closeButtonRef.current?.focus());
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;

      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") previousPhoto();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetZoom();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPhoto]);

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className={[
          "columns-2 md:columns-3 lg:columns-4 gap-4",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="break-inside-avoid mb-4"
          >
            <button
              type="button"
              onClick={() => {
                setSelectedIndex(index);
                setZoom(1);
              }}
              className="w-full cursor-zoom-in group"
            >
              <img
                src={photo.src}
                alt={photo.alt || photo.caption || ""}
                className={[
                  "w-full rounded-xl border border-secondary",
                  "transition-all duration-300",
                  "group-hover:shadow-[0_8px_24px_rgba(60,53,48,0.08)]",
                  "group-hover:scale-[1.02]",
                ].join(" ")}
                loading="lazy"
              />
              {photo.caption && (
                <p className="font-body text-sm text-muted mt-2 text-left">
                  {photo.caption}
                </p>
              )}
            </button>
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={selectedPhoto.caption || selectedPhoto.alt || "Photo viewer"}
          onClick={closeViewer}
        >
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                zoomOut();
              }}
              className="h-10 min-w-10 px-3 rounded-full bg-white/15 text-warm-white hover:bg-white/25 transition-colors"
              aria-label={ui.zoomOut}
            >
              −
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                zoomIn();
              }}
              className="h-10 min-w-10 px-3 rounded-full bg-white/15 text-warm-white hover:bg-white/25 transition-colors"
              aria-label={ui.zoomIn}
            >
              +
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
              }}
              className="h-10 px-4 rounded-full bg-white/15 text-warm-white hover:bg-white/25 transition-colors"
              aria-label={ui.resetZoom}
            >
              100%
            </button>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeViewer();
              }}
              className="h-10 px-4 rounded-full bg-white/15 text-warm-white hover:bg-white/25 transition-colors"
              aria-label={ui.close}
            >
              ✕
            </button>
          </div>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  previousPhoto();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/15 text-warm-white hover:bg-white/25 transition-colors"
                aria-label={ui.previous}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/15 text-warm-white hover:bg-white/25 transition-colors"
                aria-label={ui.next}
              >
                ›
              </button>
            </>
          )}

          <div
            className="h-full w-full p-4 md:p-8 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full max-w-6xl max-h-[88vh] flex flex-col items-center justify-center gap-3">
              <div
                className="w-full h-full overflow-auto flex items-center justify-center"
                onWheel={(e) => {
                  e.preventDefault();
                  if (e.deltaY < 0) zoomIn();
                  else zoomOut();
                }}
              >
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.alt || selectedPhoto.caption || ""}
                  className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
                  style={{ transform: `scale(${zoom})` }}
                  draggable={false}
                />
              </div>
              {selectedPhoto.caption && (
                <p className="text-warm-white text-sm md:text-base text-center max-w-3xl px-6">
                  {selectedPhoto.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

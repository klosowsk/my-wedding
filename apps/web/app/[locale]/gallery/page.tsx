import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { galleryService } from "@/src/services/gallery";
import { siteConfigService } from "@/src/services/site-config";
import PublicLayout from "@/components/public/PublicLayout";
import PhotoGrid from "@/components/public/PhotoGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  const wedding = await siteConfigService.getWeddingConfig();
  const [name1, name2] = wedding.event.couple;

  return {
    title: `${t("title")} — ${name1} & ${name2}`,
    description: t("subtitle"),
  };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, rawPhotos, wedding] = await Promise.all([
    getTranslations("gallery"),
    galleryService.listVisible(),
    siteConfigService.getWeddingConfig(),
  ]);

  if (!wedding.features.galleryEnabled) {
    notFound();
  }

  // Map DB photos to PhotoGrid's expected format
  const captionKey = `caption${locale === "en" ? "En" : locale === "es" ? "Es" : "Pt"}` as const;
  const photos = rawPhotos.map((p) => {
    // Prefer media URL (S3), fallback to legacy public/gallery/ path
    const media = (p as Record<string, unknown>).media as { url?: string; thumbUrl?: string } | null;
    const src = media?.url || `/gallery/${p.filename}`;

    return {
      id: p.id,
      src,
      caption: (p as Record<string, unknown>)[captionKey] as string | null ?? p.captionPt,
      section: p.section,
    };
  });

  return (
    <PublicLayout>

      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          {/* Page Header */}
          <div className="text-center mb-8 md:mb-10">
            <h1 className="font-script font-normal text-script text-4xl md:text-[3rem] tracking-wide mb-3">
              {t("title")}
            </h1>
            <p className="text-muted text-sm md:text-base max-w-[500px] mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
            <div className="w-16 h-px bg-secondary mx-auto mt-4" />
          </div>

          {/* Photo Grid */}
          <PhotoGrid
            photos={photos}
            labels={{
              close: t("lightbox.close"),
              previous: t("lightbox.previous"),
              next: t("lightbox.next"),
              zoomIn: t("lightbox.zoomIn"),
              zoomOut: t("lightbox.zoomOut"),
              resetZoom: t("lightbox.resetZoom"),
            }}
          />
        </div>
      </section>

    </PublicLayout>
  );
}

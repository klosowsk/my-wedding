import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { pageService } from "@/src/services/page";
import { siteConfigService } from "@/src/services/site-config";
import PublicLayout from "@/components/public/PublicLayout";
import MarkdownContent from "@/components/public/MarkdownContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const [wedding, page] = await Promise.all([
    siteConfigService.getWeddingConfig(),
    pageService.getBySlug(slug, locale),
  ]);
  const [name1, name2] = wedding.event.couple;

  if (!page) {
    return { title: "Not Found" };
  }

  return {
    title: `${page.title} — ${name1} & ${name2}`,
    description: page.content?.slice(0, 160),
  };
}

export default async function InfoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("common");
  const page = await pageService.getBySlug(slug, locale);

  if (!page) {
    notFound();
  }

  return (
    <PublicLayout>

      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="max-w-[768px] mx-auto px-6 md:px-12">
          {/* Page Header */}
          <div className="text-center mb-8 md:mb-10">
            <h1 className="font-script font-normal text-script text-4xl md:text-[3rem] tracking-wide mb-3">
              {page.title}
            </h1>
            <div className="w-16 h-px bg-secondary mx-auto" />
          </div>

          {/* Page Content */}
          <article className="bg-warm-white border border-secondary rounded-2xl p-8 md:p-12 shadow-[0_4px_16px_rgba(60,53,48,0.06)]">
            <MarkdownContent content={page.content} />
          </article>

          {/* Back link */}
          <div className="text-center mt-6">
            <a
              href={`/${locale}`}
              className="inline-flex items-center text-primary text-sm font-semibold hover:text-primary-hover transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t("back")}
            </a>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}

import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import PublicLayout from "@/components/public/PublicLayout";

export default async function LocaleNotFound() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("notFound"),
  ]);

  return (
    <PublicLayout>
      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="max-w-[600px] mx-auto px-6 md:px-12">
          <div className="corner-frame bg-warm-white border border-secondary rounded-2xl p-8 md:p-12 text-center shadow-[0_4px_16px_rgba(60,53,48,0.06)]">
            <h1 className="font-script font-normal text-script text-3xl md:text-[2.5rem] tracking-wide mb-4">
              {t("title")}
            </h1>
            <p className="text-muted text-base mb-6">{t("message")}</p>
            <Link
              href={`/${locale}`}
              className="inline-block bg-primary text-text-on-primary font-semibold rounded-full px-8 py-3 text-base hover:bg-primary-hover hover:-translate-y-px transition-all duration-200"
            >
              {t("backHome")}
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

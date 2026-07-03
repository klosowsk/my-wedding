import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { siteConfigService } from "@/src/services/site-config";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const icons = {
    icon: [{ url: "/icon", type: "image/png" }],
    shortcut: ["/icon"],
    apple: [{ url: "/icon", type: "image/png" }],
  };

  try {
    const wedding = await siteConfigService.getWeddingConfig();
    const [name1, name2] = wedding.event.couple;
    return {
      title: `${name1} & ${name2}`,
      description: "Wedding website with RSVP, gifts, gallery, and event information.",
      icons,
    };
  } catch {
    return {
      title: "Wedding Website",
      description: "Wedding website with RSVP, gifts, gallery, and event information.",
      icons,
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolved from the next-intl middleware header; routes outside the
  // middleware (admin, api) fall back to the default locale.
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-warm-white text-body">{children}</body>
    </html>
  );
}

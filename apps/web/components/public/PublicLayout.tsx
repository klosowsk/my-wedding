import { getLocale } from "next-intl/server";

import Navbar from "./Navbar";
import Footer from "./Footer";
import { siteConfigService } from "@/src/services/site-config";
import { pageService } from "@/src/services/page";
import type { LandingSections } from "./navigation";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const [wedding, infoPages] = await Promise.all([
    siteConfigService.getWeddingConfig(),
    pageService.listPublished(locale),
  ]);

  const landingSections: LandingSections = {
    countdown: true,
    venue:
      Boolean(wedding.event.venue.name?.trim()) &&
      Boolean(wedding.event.venue.address?.trim()),
    info: infoPages.length > 0,
    contact:
      Boolean(wedding.event.contact.phone) || Boolean(wedding.event.contact.email),
  };

  const publicNavVisibility = {
    giftsEnabled: wedding.features.giftsEnabled,
    galleryEnabled: wedding.features.galleryEnabled,
    landingSections,
  };

  return (
    <div className="min-h-dvh flex flex-col bg-warm-white">
      <Navbar couple={wedding.event.couple} features={publicNavVisibility} />
      <main className="flex-1">{children}</main>
      <Footer
        couple={wedding.event.couple}
        eventDate={wedding.event.date}
        venueName={wedding.event.venue.name}
        features={publicNavVisibility}
      />
    </div>
  );
}

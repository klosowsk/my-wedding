import Navbar from "./Navbar";
import Footer from "./Footer";
import { siteConfigService } from "@/src/services/site-config";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const wedding = await siteConfigService.getWeddingConfig();

  return (
    <div className="min-h-dvh flex flex-col bg-warm-white">
      <Navbar
        couple={wedding.event.couple}
        features={{
          giftsEnabled: wedding.features.giftsEnabled,
          galleryEnabled: wedding.features.galleryEnabled,
        }}
      />
      <main className="flex-1">{children}</main>
      <Footer
        couple={wedding.event.couple}
        eventDate={wedding.event.date}
        venueName={wedding.event.venue.name}
        features={{
          giftsEnabled: wedding.features.giftsEnabled,
          galleryEnabled: wedding.features.galleryEnabled,
        }}
      />
    </div>
  );
}

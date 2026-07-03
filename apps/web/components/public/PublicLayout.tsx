import Navbar from "./Navbar";
import Footer from "./Footer";
import { siteConfigService } from "@/src/services/site-config";
import { galleryService } from "@/src/services/gallery";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wedding, galleryItems] = await Promise.all([
    siteConfigService.getWeddingConfig(),
    galleryService.listVisible(),
  ]);

  // Only surface the Gallery link when it's enabled AND has at least one photo.
  const features = {
    giftsEnabled: wedding.features.giftsEnabled,
    galleryEnabled: wedding.features.galleryEnabled,
    galleryHasPhotos: galleryItems.length > 0,
  };

  return (
    <div className="min-h-dvh flex flex-col bg-warm-white">
      <Navbar couple={wedding.event.couple} features={features} />
      <main className="flex-1">{children}</main>
      <Footer
        couple={wedding.event.couple}
        eventDate={wedding.event.date}
        venueName={wedding.event.venue.name}
        features={features}
      />
    </div>
  );
}

import GoogleMap from "./GoogleMap";
import SectionTitle from "./SectionTitle";

interface VenueSectionProps {
  title: string;
  venueName: string;
  address: string;
  googleMapsUrl: string | null;
  googleMapsEmbedUrl: string | null;
  wazeUrl: string | null;
  directions: string;
  wazeLabel: string;
  className?: string;
}

export default function VenueSection({
  title,
  venueName,
  address,
  googleMapsUrl,
  googleMapsEmbedUrl,
  wazeUrl,
  directions,
  wazeLabel,
  className = "",
}: VenueSectionProps) {

  return (
    <div className={className}>
      <div className="mx-auto max-w-[1024px] px-6 md:px-12 text-center">
        {/* Section heading */}
        <SectionTitle className="mb-3">{title}</SectionTitle>

        {/* Venue name */}
        <p className="font-body font-semibold text-heading text-base md:text-lg mb-1">
          {venueName}
        </p>

        {/* Address */}
        <p className="font-body text-muted text-sm md:text-base mb-6 md:mb-8">
          {address}
        </p>

        {/* Google Maps embed */}
        {googleMapsEmbedUrl && (
          <div className="mb-6 md:mb-8">
            <GoogleMap
              embedUrl={googleMapsEmbedUrl}
              className="max-w-3xl mx-auto"
            />
          </div>
        )}

        {/* Directions links — Google Maps + Waze */}
        <div className="flex items-center justify-center gap-5 flex-wrap">
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body font-semibold text-sm text-primary hover:text-primary-hover transition-colors duration-200"
            >
              {/* Map pin icon */}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {directions}
            </a>
          )}

          {wazeUrl && (
            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body font-semibold text-sm text-primary hover:text-primary-hover transition-colors duration-200"
            >
              {/* Navigation/route icon */}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              {wazeLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

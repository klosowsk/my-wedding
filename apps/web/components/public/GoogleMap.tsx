interface GoogleMapProps {
  embedUrl: string;
  className?: string;
}

export default function GoogleMap({ embedUrl, className = "" }: GoogleMapProps) {
  return (
    <div
      className={[
        "rounded-xl border border-secondary overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Maps"
        />
      </div>
    </div>
  );
}

import SectionTitle from "./SectionTitle";

interface ContactSectionProps {
  title: string;
  subtitle: string;
  phone: string | null;
  email: string | null;
  className?: string;
}

export default function ContactSection({
  title,
  subtitle,
  phone,
  email,
  className = "",
}: ContactSectionProps) {

  return (
    <div className={className}>
      <div className="mx-auto max-w-[768px] px-6 md:px-12 text-center">
        {/* Heading */}
        <SectionTitle className="mb-2">{title}</SectionTitle>

        <p className="font-body text-muted text-sm md:text-base mb-6">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          {/* Phone */}
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 font-body text-sm text-body hover:text-primary transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>{phone}</span>
            </a>
          )}

          {/* Email */}
          {email && (
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2 font-body text-sm text-body hover:text-primary transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>{email}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

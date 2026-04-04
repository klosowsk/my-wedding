import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wedding Website",
  description: "Wedding website with RSVP, gifts, gallery, and event information.",
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    shortcut: ["/icon"],
    apple: [{ url: "/icon", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-warm-white text-body">{children}</body>
    </html>
  );
}

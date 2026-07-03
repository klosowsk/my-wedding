import { notFound } from "next/navigation";

// Catch-all inside the locale segment so unknown paths render the
// localized not-found page instead of Next's default 404.
export default function CatchAllPage() {
  notFound();
}

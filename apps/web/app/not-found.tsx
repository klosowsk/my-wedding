import Link from "next/link";

// Static fallback for requests the locale middleware never saw
// (e.g. /admin/unknown). Localized 404s live in app/[locale]/not-found.tsx.
export default function RootNotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-warm-white px-6 text-center">
      <h1 className="font-script font-normal text-script text-4xl mb-4">
        404
      </h1>
      <p className="text-muted text-base mb-6">
        Página não encontrada · Page not found
      </p>
      <Link
        href="/"
        className="inline-block bg-primary text-text-on-primary font-semibold rounded-full px-8 py-3 text-base hover:bg-primary-hover transition-all duration-200"
      >
        Voltar ao Início
      </Link>
    </div>
  );
}

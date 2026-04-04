"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface RSVPCodeFormProps {
  locale: string;
}

export default function RSVPCodeForm({ locale }: RSVPCodeFormProps) {
  const t = useTranslations("rsvp");
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    router.push(`/${locale}/rsvp/${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xs mx-auto">
      <label className="block text-sm font-medium text-heading mb-1.5">
        {t("enterCode")}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("codePlaceholder")}
          className="flex-1 min-w-0 bg-surface border border-secondary rounded-lg px-4 py-2.5 text-sm text-body placeholder:text-muted-light focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200"
        />
        <button
          type="submit"
          disabled={!code.trim()}
          className="shrink-0 bg-primary text-text-on-primary font-semibold rounded-lg px-4 py-2.5 text-sm hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          {t("codeSubmit")}
        </button>
      </div>
    </form>
  );
}

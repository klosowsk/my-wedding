"use client";

import { useState } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rsvpConfirmSchema } from "@marriage/shared/validators";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import BotanicalCorners from "./BotanicalCorners";
import SectionTitle from "./SectionTitle";
import type { z } from "zod";

type RSVPFormData = z.infer<typeof rsvpConfirmSchema>;

interface GuestMember {
  id: string;
  name: string;
  ageGroup: "adult" | "child" | "infant";
  status: "pending" | "confirmed" | "declined";
  dietaryNotes?: string | null;
}

interface Guest {
  id: string;
  familyName: string;
  token: string;
  members: GuestMember[];
}

interface RSVPFormProps {
  guest: Guest;
  locale: string;
  className?: string;
}

const AGE_GROUP_COLORS: Record<string, string> = {
  adult: "bg-surface text-muted border border-secondary",
  child: "bg-warning-bg text-warning border border-warning/20",
  infant: "bg-primary-faint text-primary-light border border-primary-light/20",
};

export default function RSVPForm({ guest, locale, className = "" }: RSVPFormProps) {
  const t = useTranslations("rsvp");
  const tCommon = useTranslations("common");
  const [submitState, setSubmitState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpConfirmSchema),
    defaultValues: {
      members: guest.members.map((m) => ({
        id: m.id,
        status: m.status === "declined" ? ("declined" as const) : ("confirmed" as const),
        dietaryNotes: m.dietaryNotes || "",
      })),
      message: "",
    },
  });

  const { fields } = useFieldArray({ control, name: "members" });
  const watchMembers = watch("members");

  const onSubmit: SubmitHandler<RSVPFormData> = async (data) => {
    setSubmitState("loading");
    try {
      const res = await fetch(`/api/v1/rsvp/${guest.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("RSVP submission failed");
      }

      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  };

  // Success state
  if (submitState === "success") {
    const allDeclined = watchMembers.every((m) => m.status === "declined");

    return (
      <div
        className={[
          "corner-frame bg-warm-white border border-secondary rounded-2xl p-8 md:p-12 max-w-xl mx-auto text-center relative overflow-hidden shadow-sm",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <BotanicalCorners topLeftSize="w-28" bottomRightSize="w-24" opacity="opacity-20" />

        <div className="w-12 h-12 rounded-full bg-accent-faint text-accent flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <SectionTitle className="text-3xl md:text-4xl mb-4">
          {allDeclined ? t("declined") : t("confirmed")}
        </SectionTitle>
        <p className="font-body text-body text-base md:text-lg mb-8">
          {allDeclined ? t("declinedMessage") : t("confirmedMessage")}
        </p>
        {!allDeclined && (
          <a
            href={`/${locale}/gifts`}
            className="inline-flex items-center justify-center gap-2 bg-primary text-text-on-primary px-6 py-3 rounded-full font-body font-semibold hover:bg-primary-hover transition-colors duration-200"
          >
            {t("viewGifts")}
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      className={[
        "corner-frame bg-warm-white border border-secondary rounded-2xl p-7 md:p-11 max-w-xl mx-auto relative overflow-hidden shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <BotanicalCorners topLeftSize="w-28" bottomRightSize="w-24" opacity="opacity-20" />

      {/* Title */}
      <SectionTitle className="text-3xl md:text-4xl text-center mb-2">
        {t("title")}
      </SectionTitle>

      {/* Greeting */}
      <p className="font-body text-body/90 text-center text-base mb-5">
        {t("greeting", { name: guest.familyName })}
      </p>

      {/* Divider */}
      <div className="w-16 h-px bg-secondary mx-auto mb-5" />

      {/* Question */}
      <div className="bg-surface/50 border border-secondary/70 rounded-xl px-4 py-3 mb-5">
        <p className="font-body font-semibold text-heading text-sm text-center">
          {t("question")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Member rows */}
        <div className="space-y-3">
          {fields.map((field, index) => {
            const member = guest.members[index]!;
            const currentStatus = watchMembers[index]?.status;

            return (
              <div
                key={field.id}
                className={[
                  "rounded-xl border p-4 transition-all duration-200",
                  currentStatus === "confirmed"
                    ? "border-accent/40 bg-accent-faint/40"
                    : currentStatus === "declined"
                      ? "border-error/30 bg-error-bg/40"
                      : "border-secondary bg-surface/30",
                ].join(" ")}
              >
                {/* Member header */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-body font-bold text-heading text-sm">
                      {member.name}
                    </span>
                    <span
                      className={[
                        "font-body text-xs px-2 py-0.5 rounded-full",
                        AGE_GROUP_COLORS[member.ageGroup] || AGE_GROUP_COLORS.adult,
                      ].join(" ")}
                    >
                      {t(member.ageGroup)}
                    </span>
                  </div>
                </div>

                {/* Status toggle */}
                <div className="flex gap-3 mb-3">
                  <label
                    className={[
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-full border cursor-pointer transition-all duration-200 text-sm font-body font-semibold",
                      currentStatus === "confirmed"
                        ? "border-accent bg-accent text-text-on-primary"
                        : "border-secondary bg-warm-white text-muted hover:border-accent/50",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      value="confirmed"
                      {...register(`members.${index}.status`)}
                      className="sr-only"
                    />
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("attending")}
                  </label>

                  <label
                    className={[
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-full border cursor-pointer transition-all duration-200 text-sm font-body font-semibold",
                      currentStatus === "declined"
                        ? "border-error bg-error text-text-on-primary"
                        : "border-secondary bg-warm-white text-muted hover:border-error/50",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      value="declined"
                      {...register(`members.${index}.status`)}
                      className="sr-only"
                    />
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    {t("notAttending")}
                  </label>
                </div>

                {/* Dietary notes (only when confirmed) */}
                {currentStatus === "confirmed" && (
                  <input
                    type="text"
                    placeholder={t("dietaryNotes")}
                    {...register(`members.${index}.dietaryNotes`)}
                    className="w-full bg-surface border border-secondary rounded-lg px-4 py-2.5 font-body text-sm text-body placeholder:text-muted-light focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200"
                  />
                )}

                {/* Validation error */}
                {errors.members?.[index]?.status && (
                  <p className="font-body text-error text-xs mt-1">
                    {errors.members[index].status?.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Message textarea */}
        <div className="bg-surface/30 border border-secondary/70 rounded-xl p-4">
          <label
            htmlFor="rsvp-message"
            className="block font-body font-semibold text-heading text-sm mb-2"
          >
            {t("message")}
          </label>
          <textarea
            id="rsvp-message"
            rows={3}
            placeholder={t("messagePlaceholder")}
            {...register("message")}
            className="w-full bg-surface border border-secondary rounded-lg px-4 py-3 font-body text-sm text-body placeholder:text-muted-light focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200 resize-vertical min-h-[100px]"
          />
          {errors.message && (
            <p className="font-body text-error text-xs mt-1">
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Error state */}
        {submitState === "error" && (
          <ErrorAlert className="text-center">
            {tCommon("error")}
          </ErrorAlert>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitState === "loading"}
          className="w-full"
        >
          {t("submit")}
        </Button>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: Date): TimeLeft {
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownBox({
  value,
  label,
  animating,
}: {
  value: number;
  label: string;
  animating: boolean;
}) {
  return (
    <div className="bg-warm-white border border-secondary rounded-xl p-3 md:p-5 flex flex-col items-center justify-center min-w-[68px] md:min-w-[90px]">
      <span
        className={[
          "font-body font-bold text-3xl md:text-4xl text-heading leading-none tabular-nums",
          animating ? "animate-tick" : "",
        ].join(" ")}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="font-body text-xs text-muted uppercase tracking-widest mt-1.5">
        {label}
      </span>
    </div>
  );
}

export default function Countdown({
  className = "",
  targetDateTime,
}: {
  className?: string;
  targetDateTime: string;
}) {
  const t = useTranslations("countdown");

  const targetDate = useRef(new Date(targetDateTime));
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calcTimeLeft(targetDate.current)
  );
  const [tick, setTick] = useState(false);
  const prevSeconds = useRef(timeLeft.seconds);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = calcTimeLeft(targetDate.current);
      setTimeLeft(next);

      if (next.seconds !== prevSeconds.current) {
        setTick(true);
        prevSeconds.current = next.seconds;
        setTimeout(() => setTick(false), 300);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const units = [
    { key: "days", value: timeLeft.days, label: t("days") },
    { key: "hours", value: timeLeft.hours, label: t("hours") },
    { key: "minutes", value: timeLeft.minutes, label: t("minutes") },
    { key: "seconds", value: timeLeft.seconds, label: t("seconds") },
  ] as const;

  return (
    <div
      className={["flex justify-center gap-3 md:gap-5", className]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
      aria-atomic="true"
    >
      {units.map((unit) => (
        <CountdownBox
          key={unit.key}
          value={unit.value}
          label={unit.label}
          animating={unit.key === "seconds" && tick}
        />
      ))}
    </div>
  );
}

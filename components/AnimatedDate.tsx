"use client";

import { useEffect, useState } from "react";
import { uiText } from "@/content/uiText";

type AnimatedDateProps = {
  date?: string;
};

type DateParts = {
  year: number;
  month: number;
  day: number;
};

const emptyDate: DateParts = {
  year: 0,
  month: 0,
  day: 0
};

function getDateParts(date?: string): DateParts | null {
  if (!date) {
    return null;
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return {
    year: parsed.getFullYear(),
    month: parsed.getMonth() + 1,
    day: parsed.getDate()
  };
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function formatDateParts(parts: DateParts) {
  return `${parts.year}${uiText.home.year}${parts.month}${uiText.home.month}${parts.day}${uiText.home.day}`;
}

export function AnimatedDate({ date }: AnimatedDateProps) {
  const target = getDateParts(date);
  const targetYear = target?.year ?? 0;
  const targetMonth = target?.month ?? 0;
  const targetDay = target?.day ?? 0;
  const [current, setCurrent] = useState<DateParts>(emptyDate);

  useEffect(() => {
    if (!targetYear || !targetMonth || !targetDay) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCurrent({
        year: targetYear,
        month: targetMonth,
        day: targetDay
      });
      return;
    }

    let frame = 0;
    const startedAt = performance.now();
    const duration = 1100;
    setCurrent(emptyDate);

    function tick(now: number) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = easeOutCubic(progress);

      setCurrent({
        year: Math.round(targetYear * eased),
        month: Math.max(1, Math.round(targetMonth * eased)),
        day: Math.max(1, Math.round(targetDay * eased))
      });

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [targetDay, targetMonth, targetYear]);

  if (!target) {
    return <span>{uiText.home.noUpdates}</span>;
  }

  return (
    <span className="date-counter" aria-label={formatDateParts(target)}>
      <span aria-hidden="true">{formatDateParts(current)}</span>
    </span>
  );
}

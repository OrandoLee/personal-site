"use client";

import { useEffect, useMemo, useState } from "react";

type AnimatedLabTimeProps = {
  value: string;
  dateTime?: string;
  className?: string;
};

const digitPattern = /\d/;
const durationMs = 3000;
const tickMs = 68;

function randomizeDigits(value: string) {
  return value.replace(/\d/g, () => String(Math.floor(Math.random() * 10)));
}

export function AnimatedLabTime({
  value,
  dateTime,
  className
}: AnimatedLabTimeProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [rolling, setRolling] = useState(false);
  const characters = useMemo(() => displayValue.split(""), [displayValue]);

  useEffect(() => {
    setDisplayValue(value);

    if (!value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRolling(false);
      return;
    }

    setRolling(true);
    setDisplayValue(randomizeDigits(value));

    const interval = window.setInterval(() => {
      setDisplayValue(randomizeDigits(value));
    }, tickMs);
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      setDisplayValue(value);
      setRolling(false);
    }, durationMs);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [value]);

  const content = (
    <span
      aria-hidden="true"
      className={className}
      data-lab-time-state={rolling ? "rolling" : "settled"}
    >
      {characters.map((character, index) => {
        const isDigit = digitPattern.test(character);
        const visibleCharacter = character === " " ? "\u00a0" : character;

        return (
          <span
            key={`${index}-${character}-${rolling ? displayValue : value}`}
            className={isDigit ? "lab-time-flip-digit" : "lab-time-flip-mark"}
          >
            {visibleCharacter}
          </span>
        );
      })}
    </span>
  );

  if (dateTime) {
    return (
      <time dateTime={dateTime} aria-label={value}>
        {content}
      </time>
    );
  }

  return (
    <span role="text" aria-label={value}>
      {content}
    </span>
  );
}

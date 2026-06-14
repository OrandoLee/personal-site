"use client";

import { useEffect, useState } from "react";

const titleLines = ["实验性作品、系统，", "以及尚未完成的项目。"] as const;

type LabTypedTitleProps = {
  className?: string;
  id?: string;
};

export function LabTypedTitle({ className, id }: LabTypedTitleProps) {
  const [visibleCounts, setVisibleCounts] = useState<[number, number]>([0, 0]);
  const [activeLine, setActiveLine] = useState<0 | 1 | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      setVisibleCounts([titleLines[0].length, titleLines[1].length]);
      setActiveLine(1);
      return;
    }

    const timeouts: number[] = [];

    function typeLine(lineIndex: 0 | 1, startDelay: number, duration: number) {
      const textLength = titleLines[lineIndex].length;
      const stepDuration = duration / textLength;

      timeouts.push(
        window.setTimeout(() => {
          setActiveLine(lineIndex);
        }, startDelay)
      );

      for (let index = 1; index <= textLength; index += 1) {
        timeouts.push(
          window.setTimeout(() => {
            setVisibleCounts((counts) => {
              const nextCounts: [number, number] = [counts[0], counts[1]];
              nextCounts[lineIndex] = index;
              return nextCounts;
            });
          }, startDelay + Math.round(index * stepDuration))
        );
      }
    }

    typeLine(0, 1360, 920);
    typeLine(1, 2290, 1080);

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, []);

  const firstLine = titleLines[0].slice(0, visibleCounts[0]);
  const secondLine = titleLines[1].slice(0, visibleCounts[1]);

  return (
    <h1
      id={id}
      className={className}
      aria-label={`${titleLines[0]}${titleLines[1]}`}
    >
      <span className="lab-title-line lab-type-line lab-type-line--one">
        <span aria-hidden="true">{firstLine}</span>
        {activeLine === 0 ? (
          <span className="lab-type-cursor" aria-hidden="true" />
        ) : null}
      </span>
      <span className="lab-title-line lab-type-line lab-type-line--two">
        <span aria-hidden="true">{secondLine}</span>
        {activeLine === 1 ? (
          <span className="lab-type-cursor" aria-hidden="true" />
        ) : null}
      </span>
    </h1>
  );
}

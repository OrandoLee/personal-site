"use client";

import { useEffect, useRef, useState } from "react";

const logoPaths = [
  {
    transform: "translate(0.800218 521.789528)",
    d: "M 188.5625 -375.546875 C 223.03125 -375.546875 252.191406 -369.890625 276.046875 -358.578125 C 299.898438 -347.265625 319.226562 -332.289062 334.03125 -313.65625 C 348.832031 -295.03125 359.539062 -273.789062 366.15625 -249.9375 C 372.769531 -226.082031 376.078125 -201.617188 376.078125 -176.546875 C 376.078125 -149.390625 372.503906 -123.707031 365.359375 -99.5 C 358.222656 -75.300781 346.992188 -54.144531 331.671875 -36.03125 C 316.359375 -17.925781 296.597656 -3.65625 272.390625 6.78125 C 248.191406 17.226562 219.03125 22.453125 184.90625 22.453125 L 41.78125 22.453125 L 41.78125 -375.546875 Z M 112.296875 -39.703125 L 180.71875 -39.703125 C 220.070312 -39.703125 250.628906 -51.453125 272.390625 -74.953125 C 294.160156 -98.460938 305.046875 -132.5 305.046875 -177.0625 C 305.046875 -194.476562 302.867188 -211.367188 298.515625 -227.734375 C 294.160156 -244.097656 287.019531 -258.632812 277.09375 -271.34375 C 267.164062 -284.0625 254.28125 -294.25 238.4375 -301.90625 C 222.59375 -309.5625 203.179688 -313.390625 180.203125 -313.390625 L 112.296875 -313.390625 Z M 112.296875 -39.703125 "
  },
  {
    transform: "translate(325.15395 521.789528)",
    d: "M 344.21875 -375.546875 L 344.21875 -313.390625 L 112.296875 -313.390625 L 112.296875 -212.0625 L 321.234375 -212.0625 L 321.234375 -149.390625 L 112.296875 -149.390625 L 112.296875 -39.703125 L 346.296875 -39.703125 L 346.296875 22.453125 L 41.78125 22.453125 L 41.78125 -375.546875 Z M 344.21875 -375.546875 "
  },
  {
    transform: "translate(624.436638 521.789528)",
    d: "M 112.296875 -375.546875 L 112.296875 -39.703125 L 321.234375 -39.703125 L 321.234375 22.453125 L 41.78125 22.453125 L 41.78125 -375.546875 Z M 112.296875 -375.546875 "
  },
  {
    transform: "translate(881.411911 521.789528)",
    d: "M 344.21875 -375.546875 L 344.21875 -313.390625 L 112.296875 -313.390625 L 112.296875 -212.0625 L 321.234375 -212.0625 L 321.234375 -149.390625 L 112.296875 -149.390625 L 112.296875 -39.703125 L 346.296875 -39.703125 L 346.296875 22.453125 L 41.78125 22.453125 L 41.78125 -375.546875 Z M 344.21875 -375.546875 "
  },
  {
    transform: "translate(1180.694599 521.789528)",
    d: "M 344.21875 -375.546875 L 344.21875 -313.390625 L 112.296875 -313.390625 L 112.296875 -212.0625 L 321.234375 -212.0625 L 321.234375 -149.390625 L 112.296875 -149.390625 L 112.296875 -39.703125 L 346.296875 -39.703125 L 346.296875 22.453125 L 41.78125 22.453125 L 41.78125 -375.546875 Z M 344.21875 -375.546875 "
  }
];

export function GalleryHeroVisual() {
  const visualRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const visual = visualRef.current;

    if (!visual) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(visual);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={visualRef} className="gallery-hero-visual" aria-hidden="true">
      {isVisible ? <div className="gallery-exposure" /> : null}
      <div className="gallery-visual-stage">
        <div className="gallery-visual-stage__grain" />

        <div className="gallery-photo-scene">
          <img
            src="/gallery-polaroid-paper.svg"
            alt=""
            className="gallery-photo-scene__paper"
          />
          <img
            src="/gallery-hero-logo.svg"
            alt=""
            className="gallery-photo-scene__logo"
          />
        </div>

        <div className="gallery-blueprint-scene">
          <div className="gallery-blueprint-scene__grid" />
          <span className="gallery-blueprint-scene__guide gallery-blueprint-scene__guide--h1" />
          <span className="gallery-blueprint-scene__guide gallery-blueprint-scene__guide--h2" />
          <span className="gallery-blueprint-scene__guide gallery-blueprint-scene__guide--v1" />
          <span className="gallery-blueprint-scene__guide gallery-blueprint-scene__guide--v2" />
          <svg
            className="gallery-blueprint-scene__logo"
            viewBox="347 784 1535 681"
            preserveAspectRatio="xMidYMid meet"
          >
            <g transform="translate(347 784)">
              {logoPaths.map((path) => (
                <path
                  key={path.transform}
                  d={path.d}
                  pathLength="1"
                  transform={path.transform}
                />
              ))}
            </g>
          </svg>
        </div>

        <div className="gallery-collage-scene">
          {Array.from({ length: 7 }).map((_, index) => (
            <span
              key={index}
              className={`gallery-collage-scene__piece gallery-collage-scene__piece--${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

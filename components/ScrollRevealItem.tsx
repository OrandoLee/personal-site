"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState
} from "react";

type ScrollRevealItemProps = {
  children: ReactNode;
  className?: string;
  index?: number;
};

export function ScrollRevealItem({
  children,
  className,
  index = 0
}: ScrollRevealItemProps) {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const element = itemRef.current;

    if (!element || isRevealed) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setIsRevealed(true);
        observer.disconnect();
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isRevealed]);

  return (
    <div
      ref={itemRef}
      className={`scroll-reveal-card${className ? ` ${className}` : ""}`}
      data-revealed={isRevealed ? "true" : "false"}
      style={
        {
          "--scroll-reveal-delay": `${Math.min(index, 10) * 70}ms`
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

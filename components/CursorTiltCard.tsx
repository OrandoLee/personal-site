"use client";

import {
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent,
  type RefObject,
  useCallback,
  useRef
} from "react";
import { cn } from "@/lib/classNames";

type CursorTiltCardProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "div";
};

const defaultTiltVars = {
  "--tilt-rotate-x": "0deg",
  "--tilt-rotate-y": "0deg",
  "--tilt-shift-x": "0px",
  "--tilt-shift-y": "0px",
  "--tilt-media-x": "0px",
  "--tilt-media-y": "0px",
  "--tilt-content-x": "0px",
  "--tilt-content-y": "0px",
  "--tilt-glow-x": "50%",
  "--tilt-glow-y": "50%"
} as CSSProperties;

function setTiltVars(element: HTMLElement, pointerX: number, pointerY: number) {
  const rotateY = pointerX * 7;
  const rotateX = pointerY * -5.5;
  const shiftX = pointerX * 12;
  const shiftY = pointerY * 10;

  element.style.setProperty("--tilt-rotate-x", `${rotateX.toFixed(2)}deg`);
  element.style.setProperty("--tilt-rotate-y", `${rotateY.toFixed(2)}deg`);
  element.style.setProperty("--tilt-shift-x", `${shiftX.toFixed(2)}px`);
  element.style.setProperty("--tilt-shift-y", `${shiftY.toFixed(2)}px`);
  element.style.setProperty("--tilt-media-x", `${(-shiftX * 0.55).toFixed(2)}px`);
  element.style.setProperty("--tilt-media-y", `${(-shiftY * 0.55).toFixed(2)}px`);
  element.style.setProperty(
    "--tilt-content-x",
    `${(shiftX * 0.36).toFixed(2)}px`
  );
  element.style.setProperty(
    "--tilt-content-y",
    `${(shiftY * 0.32).toFixed(2)}px`
  );
  element.style.setProperty("--tilt-glow-x", `${((pointerX + 0.5) * 100).toFixed(1)}%`);
  element.style.setProperty("--tilt-glow-y", `${((pointerY + 0.5) * 100).toFixed(1)}%`);
}

function resetTiltVars(element: HTMLElement) {
  setTiltVars(element, 0, 0);
}

export function CursorTiltCard({
  as: Component = "article",
  className,
  children,
  onPointerMove,
  onPointerLeave,
  style,
  ...props
}: CursorTiltCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      onPointerMove?.(event);

      if (event.pointerType === "touch" || !cardRef.current) {
        return;
      }

      const rect = cardRef.current.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      setTiltVars(
        cardRef.current,
        (event.clientX - rect.left) / rect.width - 0.5,
        (event.clientY - rect.top) / rect.height - 0.5
      );
    },
    [onPointerMove]
  );

  const handlePointerLeave = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      onPointerLeave?.(event);

      if (cardRef.current) {
        resetTiltVars(cardRef.current);
      }
    },
    [onPointerLeave]
  );

  const cardProps = {
    className: cn("cursor-tilt-card", className),
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
    style: { ...defaultTiltVars, ...style },
    ...props
  };

  if (Component === "div") {
    return (
      <div ref={cardRef as RefObject<HTMLDivElement>} {...cardProps}>
        {children}
      </div>
    );
  }

  return (
    <article ref={cardRef as RefObject<HTMLElement>} {...cardProps}>
      {children}
    </article>
  );
}

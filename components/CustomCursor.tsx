"use client";

import { useEffect, useRef, useState } from "react";

type CursorMode = "default" | "pointer" | "hidden";

const DEFAULT_CURSOR = "/cursors/cursor.svg";
const POINTER_CURSOR = "/cursors/pointinghand.svg";

const POINTER_TARGET_SELECTOR = [
  "a[href]",
  "button:not(:disabled)",
  "summary",
  "select",
  "label",
  "[role='button']",
  "[data-custom-cursor='pointer']",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

const NATIVE_CURSOR_SELECTOR = [
  "input",
  "textarea",
  "[contenteditable='true']",
  "[contenteditable='true'] *"
].join(",");

function getCursorMode(target: EventTarget | null): CursorMode {
  if (!(target instanceof Element)) {
    return "default";
  }

  if (target.closest(NATIVE_CURSOR_SELECTOR)) {
    return "hidden";
  }

  return target.closest(POINTER_TARGET_SELECTOR) ? "pointer" : "default";
}

function cursorOffset(mode: CursorMode) {
  return mode === "pointer" ? { x: 11, y: 13 } : { x: 8, y: 5 };
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<CursorMode>("default");
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const previousRef = useRef({ x: 0, y: 0 });
  const [mode, setMode] = useState<CursorMode>("default");

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (min-width: 768px)"
    );

    if (!cursor || !finePointer.matches) {
      return;
    }

    let frame = 0;
    let hasPointer = false;
    document.documentElement.classList.add("custom-cursor-ready");

    const setCursorMode = (nextMode: CursorMode) => {
      if (modeRef.current === nextMode) {
        return;
      }

      modeRef.current = nextMode;
      setMode(nextMode);
    };

    const animate = () => {
      const target = targetRef.current;
      const current = currentRef.current;
      const previous = previousRef.current;
      const modeValue = modeRef.current;
      const offset = cursorOffset(modeValue);
      const ease = modeValue === "pointer" ? 0.52 : 0.42;

      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;

      const velocityX = current.x - previous.x;
      const velocityY = current.y - previous.y;
      previous.x = current.x;
      previous.y = current.y;

      const tilt = Math.max(-7, Math.min(7, velocityX * 0.28));
      const press = document.documentElement.dataset.cursorPressed === "true";
      const scale = modeValue === "pointer" ? (press ? 0.88 : 1.06) : press ? 0.92 : 1;

      cursor.style.opacity = hasPointer && modeValue !== "hidden" ? "1" : "0";
      cursor.style.transform = `translate3d(${(current.x - offset.x).toFixed(2)}px, ${(current.y - offset.y).toFixed(2)}px, 0) rotate(${tilt.toFixed(2)}deg) scale(${scale})`;
      cursor.style.setProperty("--cursor-shadow-x", `${(-velocityX * 0.28).toFixed(2)}px`);
      cursor.style.setProperty("--cursor-shadow-y", `${(-velocityY * 0.28).toFixed(2)}px`);

      frame = window.requestAnimationFrame(animate);
    };

    const moveCursor = (event: MouseEvent | PointerEvent) => {
      if (!hasPointer) {
        currentRef.current = { x: event.clientX, y: event.clientY };
        previousRef.current = { x: event.clientX, y: event.clientY };
      }

      hasPointer = true;
      targetRef.current = { x: event.clientX, y: event.clientY };
      setCursorMode(getCursorMode(event.target));
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "mouse") {
        moveCursor(event);
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      moveCursor(event);
    };

    const onPointerDown = () => {
      document.documentElement.dataset.cursorPressed = "true";
    };

    const onPointerUp = () => {
      document.documentElement.dataset.cursorPressed = "false";
    };

    const onPointerLeave = () => {
      hasPointer = false;
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType === "mouse") {
        moveCursor(event);
      }
    };

    const onMouseOver = (event: MouseEvent) => {
      moveCursor(event);
    };

    frame = window.requestAnimationFrame(animate);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    window.addEventListener("pointerover", onPointerOver, { passive: true });
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("pointerover", onPointerOver);
      window.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onPointerLeave);
      document.documentElement.classList.remove("custom-cursor-ready");
      delete document.documentElement.dataset.cursorPressed;
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="custom-cursor"
      data-mode={mode}
    >
      <img
        alt=""
        className="custom-cursor__image"
        draggable={false}
        src={mode === "pointer" ? POINTER_CURSOR : DEFAULT_CURSOR}
      />
    </div>
  );
}

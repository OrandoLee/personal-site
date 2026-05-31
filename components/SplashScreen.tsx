"use client";

import { useEffect, useState } from "react";
import { uiText } from "@/content/uiText";

let hasPlayedSplash = false;

export function SplashScreen() {
  const [visible, setVisible] = useState(() => !hasPlayedSplash);

  useEffect(() => {
    if (!visible) {
      return;
    }

    hasPlayedSplash = true;
    const timeout = window.setTimeout(() => setVisible(false), 1800);

    return () => window.clearTimeout(timeout);
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className="splash-screen" aria-hidden="true">
      <img
        src="/logo-wordmark.svg"
        alt={uiText.site.brand}
        className="splash-screen__logo"
      />
      <style jsx>{`
        .splash-screen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          background:
            linear-gradient(90deg, rgba(25, 23, 20, 0.045) 1px, transparent 1px),
            linear-gradient(180deg, rgba(25, 23, 20, 0.035) 1px, transparent 1px),
            #f4efe7;
          background-size: 80px 80px, 80px 80px, auto;
          pointer-events: none;
          animation: splash-shell 1800ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .splash-screen__logo {
          width: clamp(148px, 28vw, 260px);
          height: auto;
          object-fit: contain;
          animation: splash-logo 1800ms cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: opacity, transform;
        }

        @keyframes splash-logo {
          0% {
            opacity: 1;
            transform: scale(1);
          }

          52% {
            opacity: 1;
            transform: scale(1.08);
          }

          100% {
            opacity: 0;
            transform: scale(1.38);
          }
        }

        @keyframes splash-shell {
          0%,
          62% {
            opacity: 1;
          }

          100% {
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-screen {
            animation: splash-shell 320ms ease-out both;
          }

          .splash-screen__logo {
            animation: splash-logo-reduced 320ms ease-out both;
          }
        }

        @keyframes splash-logo-reduced {
          from {
            opacity: 1;
          }

          to {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

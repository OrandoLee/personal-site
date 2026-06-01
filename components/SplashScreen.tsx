"use client";

import { useEffect, useState } from "react";
import { uiText } from "@/content/uiText";

let hasPlayedSplash = false;
const splashDuration = 7000;

export function SplashScreen() {
  const [visible, setVisible] = useState(() => !hasPlayedSplash);

  useEffect(() => {
    if (!visible) {
      return;
    }

    hasPlayedSplash = true;
    const timeout = window.setTimeout(() => setVisible(false), splashDuration);

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
        className="splash-screen__logo splash-screen__logo--light"
      />
      <img
        src="/logo-wordmark-dark.svg"
        alt={uiText.site.brand}
        className="splash-screen__logo splash-screen__logo--dark"
      />
      <style jsx>{`
        .splash-screen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          overflow: hidden;
          background: #000;
          --splash-black-final-opacity: 1;
          --splash-white-final-opacity: 0;
          pointer-events: none;
          animation: splash-shell ${splashDuration}ms both;
        }

        :global(.dark) .splash-screen {
          --splash-black-final-opacity: 0;
          --splash-white-final-opacity: 1;
        }

        .splash-screen__logo {
          position: absolute;
          left: 50%;
          top: 50%;
          width: clamp(148px, 28vw, 260px);
          height: auto;
          object-fit: contain;
          filter: grayscale(1) contrast(1.25);
          will-change: opacity, transform;
        }

        .splash-screen__logo--light {
          animation: splash-logo-black ${splashDuration}ms both;
        }

        .splash-screen__logo--dark {
          animation: splash-logo-white ${splashDuration}ms both;
        }

        @keyframes splash-logo-black {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(-42vw, -30vh) scale(2.85);
            animation-timing-function: steps(1, end);
          }

          3% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(36vw, 24vh) scale(0.42);
            animation-timing-function: steps(1, end);
          }

          6% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(22vw, -34vh) scale(2.45);
            animation-timing-function: steps(1, end);
          }

          9% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-30vw, 28vh) scale(0.58);
            animation-timing-function: steps(1, end);
          }

          12% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(44vw, -14vh) scale(1.9);
            animation-timing-function: steps(1, end);
          }

          16% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-18vw, -22vh) scale(3.15);
            animation-timing-function: steps(1, end);
          }

          20% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(10vw, 32vh) scale(0.7);
            animation-timing-function: steps(1, end);
          }

          24% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-46vw, 9vh) scale(2.2);
            animation-timing-function: steps(1, end);
          }

          28% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(29vw, -27vh) scale(1.35);
            animation-timing-function: steps(1, end);
          }

          32% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-21vw, 17vh) scale(2.75);
            animation-timing-function: steps(1, end);
          }

          36% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(16vw, -16vh) scale(1.72);
            animation-timing-function: steps(1, end);
          }

          41% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-13vw, 14vh) scale(0.9);
            animation-timing-function: steps(1, end);
          }

          46% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(11vw, 9vh) scale(1.42);
            animation-timing-function: steps(1, end);
          }

          51% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-9vw, -10vh) scale(1.7);
            animation-timing-function: steps(1, end);
          }

          56% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(6vw, -6vh) scale(1.24);
            animation-timing-function: steps(1, end);
          }

          61% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-5vw, 5vh) scale(1.34);
            animation-timing-function: steps(1, end);
          }

          66% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(3vw, -3vh) scale(1.12);
            animation-timing-function: steps(1, end);
          }

          70% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-2vw, 2vh) scale(1.18);
            animation-timing-function: steps(1, end);
          }

          74% {
            opacity: var(--splash-black-final-opacity);
            transform: translate(-50%, -50%) scale(1);
            animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          }

          86% {
            opacity: var(--splash-black-final-opacity);
            transform: translate(-50%, -50%) scale(1.08);
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.38);
          }
        }

        @keyframes splash-logo-white {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(38vw, 26vh) scale(0.5);
            animation-timing-function: steps(1, end);
          }

          3% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(41vw, -22vh) scale(2.55);
            animation-timing-function: steps(1, end);
          }

          6% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-35vw, -29vh) scale(0.62);
            animation-timing-function: steps(1, end);
          }

          9% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(-39vw, 25vh) scale(2.9);
            animation-timing-function: steps(1, end);
          }

          12% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(30vw, 31vh) scale(0.48);
            animation-timing-function: steps(1, end);
          }

          16% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(18vw, -27vh) scale(2.1);
            animation-timing-function: steps(1, end);
          }

          20% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-32vw, -7vh) scale(1.8);
            animation-timing-function: steps(1, end);
          }

          24% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(35vw, 12vh) scale(0.76);
            animation-timing-function: steps(1, end);
          }

          28% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-25vw, 29vh) scale(2.38);
            animation-timing-function: steps(1, end);
          }

          32% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(23vw, -19vh) scale(1.1);
            animation-timing-function: steps(1, end);
          }

          36% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-17vw, -15vh) scale(1.86);
            animation-timing-function: steps(1, end);
          }

          41% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(14vw, 11vh) scale(1.02);
            animation-timing-function: steps(1, end);
          }

          46% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-11vw, 8vh) scale(1.55);
            animation-timing-function: steps(1, end);
          }

          51% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(8vw, -8vh) scale(1.22);
            animation-timing-function: steps(1, end);
          }

          56% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-7vw, 6vh) scale(1.32);
            animation-timing-function: steps(1, end);
          }

          61% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(5vw, -5vh) scale(1.1);
            animation-timing-function: steps(1, end);
          }

          66% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-3vw, 3vh) scale(1.2);
            animation-timing-function: steps(1, end);
          }

          70% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(2vw, -2vh) scale(1.08);
            animation-timing-function: steps(1, end);
          }

          74% {
            opacity: var(--splash-white-final-opacity);
            transform: translate(-50%, -50%) scale(1);
            animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          }

          86% {
            opacity: var(--splash-white-final-opacity);
            transform: translate(-50%, -50%) scale(1.08);
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.38);
          }
        }

        @keyframes splash-shell {
          0% {
            opacity: 1;
            background: #000;
            animation-timing-function: steps(1, end);
          }

          3% {
            opacity: 1;
            background: #fff;
            animation-timing-function: steps(1, end);
          }

          6% {
            opacity: 1;
            background: #000;
            animation-timing-function: steps(1, end);
          }

          9% {
            opacity: 1;
            background: #fff;
            animation-timing-function: steps(1, end);
          }

          12% {
            opacity: 1;
            background: #000;
            animation-timing-function: steps(1, end);
          }

          16% {
            opacity: 1;
            background: #fff;
            animation-timing-function: steps(1, end);
          }

          20% {
            opacity: 1;
            background: #000;
            animation-timing-function: steps(1, end);
          }

          24% {
            opacity: 1;
            background: #fff;
            animation-timing-function: steps(1, end);
          }

          28% {
            opacity: 1;
            background: #000;
            animation-timing-function: steps(1, end);
          }

          32% {
            opacity: 1;
            background: #fff;
            animation-timing-function: steps(1, end);
          }

          36% {
            opacity: 1;
            background: #000;
            animation-timing-function: steps(1, end);
          }

          41% {
            opacity: 1;
            background: #fff;
            animation-timing-function: steps(1, end);
          }

          46% {
            opacity: 1;
            background: #000;
            animation-timing-function: steps(1, end);
          }

          51% {
            opacity: 1;
            background: #fff;
            animation-timing-function: steps(1, end);
          }

          56% {
            opacity: 1;
            background: #000;
            animation-timing-function: steps(1, end);
          }

          61% {
            opacity: 1;
            background: #fff;
            animation-timing-function: steps(1, end);
          }

          66% {
            opacity: 1;
            background: #000;
            animation-timing-function: steps(1, end);
          }

          70% {
            opacity: 1;
            background: #fff;
            animation-timing-function: steps(1, end);
          }

          74%,
          86% {
            opacity: 1;
            background: rgb(var(--background));
            animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          }

          100% {
            opacity: 0;
            background: rgb(var(--background));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-screen {
            animation: splash-shell-reduced 320ms ease-out both;
          }

          .splash-screen__logo {
            animation: splash-logo-reduced 320ms ease-out both;
          }

          .splash-screen__logo--dark {
            opacity: var(--splash-white-final-opacity);
          }

          .splash-screen__logo--light {
            opacity: var(--splash-black-final-opacity);
          }
        }

        @keyframes splash-logo-reduced {
          from {
            transform: translate(-50%, -50%) scale(1);
          }

          to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.08);
          }
        }

        @keyframes splash-shell-reduced {
          from {
            opacity: 1;
            background: rgb(var(--background));
          }

          to {
            opacity: 0;
            background: rgb(var(--background));
          }
        }
      `}</style>
    </div>
  );
}

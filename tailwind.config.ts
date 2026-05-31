import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        "muted-foreground": "rgb(var(--muted-foreground) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        "card-foreground": "rgb(var(--card-foreground) / <alpha-value>)",
        archive: {
          paper: "rgb(var(--archive-paper) / <alpha-value>)",
          paper2: "rgb(var(--archive-paper2) / <alpha-value>)",
          ink: "rgb(var(--archive-ink) / <alpha-value>)",
          muted: "rgb(var(--archive-muted) / <alpha-value>)",
          line: "rgb(var(--archive-line) / <alpha-value>)",
          clay: "rgb(var(--archive-clay) / <alpha-value>)",
          moss: "rgb(var(--archive-moss) / <alpha-value>)",
          blue: "rgb(var(--archive-blue) / <alpha-value>)",
          gold: "rgb(var(--archive-gold) / <alpha-value>)"
        }
      },
      fontFamily: {
        sans: [
          "Arial",
          "Helvetica",
          "Noto Sans SC",
          "PingFang SC",
          "Microsoft YaHei",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ],
        serif: [
          "Noto Serif SC",
          "Songti SC",
          "SimSun",
          "Georgia",
          "serif"
        ],
        mono: ["JetBrains Mono", "Consolas", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        archive: "0 18px 45px rgb(var(--archive-shadow) / 0.18)"
      },
      keyframes: {
        reveal: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        reveal: "reveal 520ms ease both"
      }
    }
  },
  plugins: []
};

export default config;

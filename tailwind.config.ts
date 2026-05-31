import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        archive: {
          paper: "#f4efe7",
          paper2: "#fffaf2",
          ink: "#191714",
          muted: "#6f675e",
          line: "#d8cec1",
          clay: "#b85f3c",
          moss: "#5d6d4f",
          blue: "#3f6472",
          gold: "#b4883b"
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
        archive: "0 18px 45px rgba(25, 23, 20, 0.08)"
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

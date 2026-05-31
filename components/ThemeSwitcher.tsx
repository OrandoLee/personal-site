"use client";

import { useTheme, type ThemePreference } from "@/components/ThemeProvider";
import { cn } from "@/lib/classNames";

const options: Array<{ value: ThemePreference; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" }
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="inline-flex rounded-full border border-archive-line bg-archive-paper p-1"
      aria-label="Theme"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setTheme(option.value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs transition",
            theme === option.value
              ? "bg-archive-ink text-archive-paper2"
              : "text-archive-muted hover:text-archive-ink"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

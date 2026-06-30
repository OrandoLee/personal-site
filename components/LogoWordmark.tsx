import { uiText } from "@/content/uiText";
import { cn } from "@/lib/classNames";

type LogoWordmarkProps = {
  className?: string;
  glitch?: boolean;
};

export function LogoWordmark({ className, glitch = false }: LogoWordmarkProps) {
  if (glitch) {
    return (
      <span className={cn("logo-glitch", className)}>
        <img
          src="/logo-wordmark.svg"
          alt={uiText.site.brand}
          className="logo-glitch__base dark:hidden"
        />
        <img
          src="/logo-wordmark-dark.svg"
          alt={uiText.site.brand}
          className="logo-glitch__base hidden dark:block"
        />
        <span
          className="logo-glitch__ghost logo-glitch__ghost--red"
          aria-hidden="true"
        />
        <span
          className="logo-glitch__ghost logo-glitch__ghost--cyan"
          aria-hidden="true"
        />
      </span>
    );
  }

  return (
    <>
      <img
        src="/logo-wordmark.svg"
        alt={uiText.site.brand}
        className={cn("wordmark dark:hidden", className)}
      />
      <img
        src="/logo-wordmark-dark.svg"
        alt={uiText.site.brand}
        className={cn("wordmark hidden dark:block", className)}
      />
    </>
  );
}

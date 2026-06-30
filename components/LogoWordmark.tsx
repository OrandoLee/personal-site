import { uiText } from "@/content/uiText";
import { cn } from "@/lib/classNames";

type LogoWordmarkProps = {
  className?: string;
};

export function LogoWordmark({ className }: LogoWordmarkProps) {
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

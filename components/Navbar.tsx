"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoWordmark } from "@/components/LogoWordmark";
import { uiText } from "@/content/uiText";
import { labCategories, type LabProject } from "@/data/lab";
import { cn } from "@/lib/classNames";

const navItems = [
  {
    href: "/",
    label: uiText.nav.home,
    logo: "/nav-logos/home.svg",
    logoClassName: "w-[3.7rem] sm:w-[4.25rem]",
    motion: "home"
  },
  {
    href: "/articles",
    label: uiText.nav.articles,
    logo: "/nav-logos/article.svg",
    logoClassName: "w-[4.7rem] sm:w-[5.4rem]",
    motion: "article"
  },
  {
    href: "/gallery",
    label: uiText.nav.gallery,
    logo: "/nav-logos/IMAGE.svg",
    logoClassName: "w-[4.15rem] sm:w-[4.8rem]",
    motion: "gallery"
  },
  {
    href: "/lab",
    label: "LAB",
    logo: "/nav-logos/lab.svg",
    logoClassName: "w-[2.5rem] sm:w-[2.85rem]",
    motion: "lab",
    hasLabMenu: true
  },
  {
    href: "/orask",
    label: uiText.nav.orask,
    logo: "/nav-logos/orask.svg",
    logoClassName: "w-[3.65rem] sm:w-[4.2rem]",
    motion: "orask"
  }
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const [labMenuOpen, setLabMenuOpen] = useState(false);
  const [recentLabProjects, setRecentLabProjects] = useState<LabProject[]>([]);

  const closeLabMenu = useCallback(() => {
    setLabMenuOpen(false);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadRecentLabProjects() {
      try {
        const response = await fetch("/api/public/lab", { cache: "no-store" });
        const result = (await response.json()) as {
          ok?: boolean;
          data?: LabProject[];
        };

        if (!ignore) {
          setRecentLabProjects((result.data ?? []).slice(0, 3));
        }
      } catch {
        if (!ignore) {
          setRecentLabProjects([]);
        }
      }
    }

    void loadRecentLabProjects();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        closeLabMenu();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeLabMenu();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeLabMenu]);

  useEffect(() => {
    closeLabMenu();
  }, [closeLabMenu, pathname]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 bg-archive-paper/88 backdrop-blur-xl"
      onMouseLeave={closeLabMenu}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="block shrink-0" aria-label={uiText.site.homeAria}>
          <LogoWordmark className="h-7 w-24 object-contain object-left sm:h-8 sm:w-28" />
        </Link>

        <nav className="flex items-center gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const labActive = Boolean(item.hasLabMenu && (active || labMenuOpen));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-haspopup={item.hasLabMenu ? "menu" : undefined}
                aria-expanded={item.hasLabMenu ? labMenuOpen : undefined}
                onMouseEnter={() => {
                  if (item.hasLabMenu) {
                    setLabMenuOpen(true);
                  }
                }}
                onClick={(event) => {
                  if (!item.hasLabMenu) {
                    closeLabMenu();
                    return;
                  }

                  if (window.matchMedia("(hover: none)").matches) {
                    event.preventDefault();
                    setLabMenuOpen((open) => !open);
                  }
                }}
                onKeyDown={(event) => {
                  if (!item.hasLabMenu) {
                    return;
                  }

                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setLabMenuOpen((open) => !open);
                  }
                }}
                data-logo-motion={item.motion}
                className={cn(
                  "nav-logo-button group relative flex h-10 shrink-0 items-center justify-center overflow-hidden rounded-full px-3 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-archive-ink focus-visible:ring-offset-2 focus-visible:ring-offset-archive-paper sm:h-11 sm:px-4",
                  labActive
                    ? "bg-archive-ink text-archive-paper2"
                    : "text-archive-muted hover:bg-archive-paper2 hover:text-archive-ink"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("nav-logo h-[0.82rem] sm:h-[0.92rem]", item.logoClassName)}
                  style={
                    {
                      "--nav-logo": `url("${item.logo}")`
                    } as CSSProperties
                  }
                />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className={cn(
          "absolute right-4 top-full w-[min(calc(100vw-2rem),460px)] pt-2 transition duration-150 sm:right-6 lg:right-[max(2rem,calc((100vw-72rem)/2+2rem))]",
          labMenuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1.5 opacity-0"
        )}
      >
        <div className="rounded-3xl border border-archive-line bg-archive-paper2 p-3 shadow-archive">
          <div className="grid gap-1">
            {labCategories.map((category) => (
              <Link
                key={category.key}
                href={category.href}
                onClick={closeLabMenu}
                className="rounded-2xl px-3 py-2 transition hover:bg-archive-paper"
              >
                <span className="block text-sm text-archive-ink">
                  {category.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-archive-muted">
                  {category.description}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-3 border-t border-archive-line pt-3">
            <p className="px-3 text-xs text-archive-muted">最近项目</p>
            {recentLabProjects.length > 0 ? (
              <div className="mt-2 grid gap-1">
                {recentLabProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/lab/${project.slug}`}
                    onClick={closeLabMenu}
                    className="rounded-2xl px-3 py-2 transition hover:bg-archive-paper"
                  >
                    <span className="block text-sm text-archive-ink">
                      {project.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-archive-muted">
                      {project.summary}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-2 px-3 py-2 text-xs leading-5 text-archive-muted">
                更多东西正在组装中。
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

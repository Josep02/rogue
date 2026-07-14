"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavItemActive } from "./nav-items";
import { cn } from "@/lib/utils";

/** Navegacion inferior, solo en movil/tablet (el escritorio usa Sidebar). */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
      <nav
        className={cn(
          "pointer-events-auto mx-auto flex w-full max-w-lg items-center justify-around rounded-[32px] px-2 py-2",
          "bg-white/80 shadow-[0_12px_48px_-8px_rgba(23,24,28,0.28)] backdrop-blur-2xl",
          "dark:bg-white/12 dark:shadow-[0_12px_48px_-8px_rgba(0,0,0,0.65)]"
        )}
      >
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 transition-all duration-200",
                active
                  ? "scale-105 bg-accent/20 text-accent"
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
            >
              <Icon className="size-6" strokeWidth={active ? 2.25 : 1.75} />
              <span
                className={cn(
                  "text-[10px] font-medium leading-none tracking-wide",
                  active ? "opacity-100" : "opacity-60"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "New agreement" },
  { href: "/documents", label: "Documents" },
];

export const HeaderActionsContext = createContext<HTMLDivElement | null>(null);

/**
 * Renders its children into AppShell's sticky header bar, so page-specific
 * actions (e.g. Download PDF) stay pinned in view alongside the nav instead
 * of scrolling away with page content.
 */
export function HeaderAction({ children }: { children: ReactNode }) {
  const target = useContext(HeaderActionsContext);
  if (!target) return null;
  return createPortal(children, target);
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [actionsEl, setActionsEl] = useState<HTMLDivElement | null>(null);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  }

  return (
    <div className="document-scroll-pane mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col gap-8 px-6 py-10">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-background py-2 print:hidden">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="flex items-center gap-5 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname === link.href
                    ? "text-dark-navy dark:text-foreground"
                    : "text-foreground/60 hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div ref={setActionsEl} className="flex items-center gap-3" />
          <button
            type="button"
            onClick={signOut}
            className="text-sm font-medium text-foreground/60 hover:text-foreground"
          >
            Sign out
          </button>
          <ThemeToggle />
        </div>
      </header>
      <HeaderActionsContext.Provider value={actionsEl}>{children}</HeaderActionsContext.Provider>
    </div>
  );
}

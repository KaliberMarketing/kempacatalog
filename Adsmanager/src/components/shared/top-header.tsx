"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Loader2 } from "lucide-react";
import Link from "next/link";

interface TopHeaderProps {
  onMenuToggle: () => void;
}

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname
    .replace(/^\/app\/?/, "")
    .split("/")
    .filter(Boolean);

  return segments.map((segment, i) => {
    const href = "/app/" + segments.slice(0, i + 1).join("/");
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label };
  });
}

export function TopHeader({ onMenuToggle }: TopHeaderProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(null);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
      setSignOutError("Sign out failed. Please try again.");
    }
  }

  const breadcrumbs = useBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-4 md:px-6 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          className="md:hidden rounded-md p-1.5 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent transition-[transform,box-shadow,background-color,color] transform-gpu shadow-[inset_1px_1px_2px_rgba(0,0,0,0.08),_inset_-1px_-1px_2px_rgba(255,255,255,0.18)] hover:translate-x-px hover:translate-y-px hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.16),_inset_-4px_-4px_8px_rgba(255,255,255,0.08)] active:translate-x-px active:translate-y-px"
          onClick={onMenuToggle}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="hidden sm:flex items-center gap-1 text-sm min-w-0"
          >
            <Link
              href="/app/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              Home
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span
                key={crumb.href}
                className="flex items-center gap-1 min-w-0"
              >
                <span className="text-muted-foreground/60 shrink-0">/</span>
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-foreground truncate">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-muted-foreground hover:text-foreground transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {signOutError && (
          <p className="text-xs text-destructive hidden sm:block">
            {signOutError}
          </p>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}
          Sign Out
        </Button>
      </div>
    </header>
  );
}

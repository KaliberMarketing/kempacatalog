"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import kempaLogo from "../../../logo/kempa-logo01-groen.png";

type SalesShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

const navItems = [{ href: "/sales", label: "Catalogus" }];

export function SalesShell({ title, description, children }: SalesShellProps) {
  const pathname = usePathname();

  const kempaBranding = {
    "--color-primary": "#224f45",
    "--color-secondary": "#ffffff",
    "--color-accent": "#6d3c59",
    "--color-bg": "#fbfbfc",
    "--color-text": "#111827",
    "--font-heading": "var(--kempa-heading-font)",
    "--font-body": "var(--kempa-body-font)",
  } as React.CSSProperties;

  return (
    <div
      className="min-h-screen bg-[var(--kempa-bg)]"
      style={kempaBranding}
    >
      <header className="border-b border-[color-mix(in_srgb,var(--kempa-green)_10%,#e5e7eb_90%)] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <Image
                src={kempaLogo}
                alt="Kempa logo"
                className="h-8 w-auto"
                priority
              />
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--kempa-green)_60%,#9ca3af_40%)]">
                  Kempa catalogus
                </p>
                <div className="flex items-center gap-2">
                  <h1
                    className="text-sm font-medium text-[var(--kempa-green)]"
                    style={{ fontFamily: "var(--kempa-heading-font)" }}
                  >
                    Salescatalogus
                  </h1>
                  <span className="rounded-full bg-[var(--kempa-accent)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                    Sales
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex items-center gap-1.5 text-sm">
              {navItems.map((item) => {
                const active =
                  item.href === "/sales"
                    ? pathname === "/sales" || pathname === "/sales/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-[var(--kempa-green)] text-white shadow-sm"
                        : "text-[color-mix(in_srgb,var(--kempa-green)_80%,#4b5563_20%)] hover:bg-[color-mix(in_srgb,var(--kempa-green)_6%,#e5e7eb_94%)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-zinc-100 py-3">
            <div className="flex flex-col gap-1">
              <h2
                className="text-lg font-semibold text-[var(--kempa-green)]"
                style={{ fontFamily: "var(--kempa-heading-font)" }}
              >
                {title}
              </h2>
              {description && (
                <p className="text-xs text-[color-mix(in_srgb,var(--kempa-green)_55%,#9ca3af_45%)]">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main
        className="mx-auto max-w-6xl px-6 py-6"
        style={{ fontFamily: "var(--kempa-body-font)" }}
      >
        {children}
      </main>
    </div>
  );
}


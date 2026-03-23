"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import kempaLogo from "../../../logo/kempa-logo01-groen.png";
import { LogoutButton } from "@/components/branding/LogoutButton";

type AdminShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/dealers", label: "Dealers" },
  { href: "/admin/products", label: "Producten" },
  { href: "/admin/inquiries", label: "Aanvragen" },
  { href: "/admin/account", label: "Account" },
];

export function AdminShell({ title, description, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--kempa-bg)]">
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
                  <p
                    className="text-sm font-medium text-[var(--kempa-green)]"
                    style={{ fontFamily: "var(--kempa-heading-font)" }}
                  >
                    Admin
                  </p>
                  <span className="rounded-full bg-[var(--kempa-accent)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                    Beheer
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex items-center gap-2 text-sm">
              {navItems.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
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
              <LogoutButton />
            </nav>
          </div>

          <div className="border-t border-zinc-100 py-3">
            <div className="flex flex-col gap-1">
              <h1
                className="text-lg font-semibold text-[var(--kempa-green)]"
                style={{ fontFamily: "var(--kempa-heading-font)" }}
              >
                {title}
              </h1>
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


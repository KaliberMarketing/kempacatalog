import type { CSSProperties } from "react";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export type DealerBranding = {
  name: string;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
};

type DealerShellProps = {
  branding: DealerBranding;
  children: React.ReactNode;
};

export function DealerShell({ branding, children }: DealerShellProps) {
  const style = {
    "--color-primary": branding.primaryColor,
    "--color-secondary": branding.secondaryColor,
    "--color-accent": branding.accentColor,
    "--color-bg": branding.backgroundColor,
    "--color-text": branding.textColor,
    "--font-heading": `'${branding.fontHeading}', sans-serif`,
    "--font-body": `'${branding.fontBody}', sans-serif`,
  } as CSSProperties;

  return (
    <div
      className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]"
      style={style}
    >
      <header className="border-b border-black/5 bg-white/70 px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={branding.logoUrl}
                alt={branding.name}
                className="h-10 w-auto rounded-md object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-primary)] text-sm font-semibold text-white">
                {branding.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p
                className="text-sm font-semibold text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {branding.name}
              </p>
              <p
                className="text-xs text-[color-mix(in_srgb,var(--color-text)_60%,#9ca3af_40%)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {branding.name} dealer catalogus
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-3 text-xs">
            <Link
              href="/dealer/catalogus"
              className="rounded-full px-3 py-1 text-[color-mix(in_srgb,var(--color-text)_80%,#4b5563_20%)] hover:bg-black/5"
            >
              Catalogus
            </Link>
            <Link
              href="/dealer/prijzen"
              className="rounded-full px-3 py-1 text-[color-mix(in_srgb,var(--color-text)_80%,#4b5563_20%)] hover:bg-black/5"
            >
              Prijzen
            </Link>
            <Link
              href="/dealer/account"
              className="rounded-full px-3 py-1 text-[color-mix(in_srgb,var(--color-text)_80%,#4b5563_20%)] hover:bg-black/5"
            >
              Account
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>

      <main
        className="mx-auto max-w-5xl px-6 py-8"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {children}
      </main>
    </div>
  );
}


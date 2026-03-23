import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  DealerShell,
  type DealerBranding,
} from "@/components/branding/DealerShell";

async function getDealerBranding(): Promise<DealerBranding> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dealerId =
    (user?.user_metadata as any | undefined)?.dealer_id ?? null;

  if (dealerId) {
    const { data } = await supabase
      .from("dealers")
      .select(
        "name, logo_url, primary_color, secondary_color, accent_color, background_color, text_color, font_heading, font_body",
      )
      .eq("id", dealerId)
      .maybeSingle();

    if (data) {
      return {
        name: data.name,
        logoUrl: data.logo_url,
        primaryColor: data.primary_color ?? "#1a1a1a",
        secondaryColor: data.secondary_color ?? "#ffffff",
        accentColor: data.accent_color ?? "#c8a96e",
        backgroundColor: data.background_color ?? "#f9f9f9",
        textColor: data.text_color ?? "#1a1a1a",
        fontHeading: data.font_heading ?? "Syne",
        fontBody: data.font_body ?? "DM Sans",
      };
    }
  }

  // Fallback: Kempa basisbranding
  return {
    name: "Kempa",
    logoUrl: null,
    primaryColor: "#1a1a1a",
    secondaryColor: "#ffffff",
    accentColor: "#c8a96e",
    backgroundColor: "#f9f9f9",
    textColor: "#1a1a1a",
    fontHeading: "Syne",
    fontBody: "DM Sans",
  };
}

export default async function DealerPortalIndexPage() {
  const branding = await getDealerBranding();

  return (
    <DealerShell branding={branding}>
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--color-text)_60%,#9ca3af_40%)]">
          Kempa dealerportaal
        </p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Welkom in uw dealerportaal
        </h1>
        <p className="mb-6 max-w-2xl text-sm text-[color-mix(in_srgb,var(--color-text)_75%,#9ca3af_25%)]">
          Vanuit dit portaal heeft u altijd toegang tot de volledige Kempa-collectie,
          downloadt u technische fiches op maat en stuurt u gerichte aanvragen
          rechtstreeks door.
        </p>

        <div className="flex flex-wrap items-center gap-5">
          <Link
            href="/dealer/catalogus"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[color-mix(in_srgb,var(--color-accent)_85%,#111827_15%)]"
          >
            Open catalogus
          </Link>

          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[color-mix(in_srgb,var(--color-text)_70%,#9ca3af_30%)]">
            <li>• Altijd up-to-date assortiment</li>
            <li>• Branded pdf-fiches voor uw klanten</li>
            <li>• Snel selecties maken voor offertes</li>
          </ul>
        </div>
      </div>
    </DealerShell>
  );
}


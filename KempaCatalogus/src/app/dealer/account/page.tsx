import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  DealerShell,
  type DealerBranding,
} from "@/components/branding/DealerShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account | Dealer portal",
};

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
        logoUrl: data.logo_url as string | null,
        primaryColor: (data.primary_color as string | null) ?? "#1a1a1a",
        secondaryColor: (data.secondary_color as string | null) ?? "#ffffff",
        accentColor: (data.accent_color as string | null) ?? "#c8a96e",
        backgroundColor:
          (data.background_color as string | null) ?? "#f9f9f9",
        textColor: (data.text_color as string | null) ?? "#1a1a1a",
        fontHeading: (data.font_heading as string | null) ?? "Syne",
        fontBody: (data.font_body as string | null) ?? "DM Sans",
      };
    }
  }

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

type DealerProfile = {
  userEmail: string;
  dealerName: string | null;
  contactEmail: string | null;
  inquiryEmail: string | null;
};

async function getDealerProfile(): Promise<DealerProfile | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const dealerId =
    (user.user_metadata as any | undefined)?.dealer_id ?? null;

  if (!dealerId) {
    return {
      userEmail: user.email ?? "",
      dealerName: null,
      contactEmail: null,
      inquiryEmail: null,
    };
  }

  const { data: dealer } = await supabase
    .from("dealers")
    .select("name, contact_email, inquiry_email")
    .eq("id", dealerId)
    .maybeSingle();

  return {
    userEmail: user.email ?? "",
    dealerName: (dealer?.name as string | null) ?? null,
    contactEmail: (dealer?.contact_email as string | null) ?? null,
    inquiryEmail: (dealer?.inquiry_email as string | null) ?? null,
  };
}

async function updatePasswordAction(formData: FormData) {
  "use server";

  const newPassword = String(formData.get("new_password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");

  if (
    !newPassword ||
    newPassword.length < 6 ||
    newPassword !== confirmPassword
  ) {
    redirect("/dealer/account?error=validation");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    redirect("/dealer/account?error=update_failed");
  }

  redirect("/dealer/account?ok=updated");
}

async function updateDealerContactAction(formData: FormData) {
  "use server";

  const contactEmail = String(formData.get("contact_email") || "").trim();
  const inquiryEmail = String(formData.get("inquiry_email") || "").trim();

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dealerId =
    (user?.user_metadata as any | undefined)?.dealer_id ?? null;

  if (!dealerId) {
    redirect("/dealer/account?dealer_error=missing_dealer");
  }

  const { error } = await supabase
    .from("dealers")
    .update({
      contact_email: contactEmail || null,
      inquiry_email: inquiryEmail || null,
    })
    .eq("id", dealerId);

  if (error) {
    redirect("/dealer/account?dealer_error=update_failed");
  }

  redirect("/dealer/account?dealer_ok=updated");
}

type DealerAccountPageProps = {
  searchParams: Promise<{
    error?: string;
    ok?: string;
    dealer_error?: string;
    dealer_ok?: string;
  }>;
};

export default async function DealerAccountPage(props: DealerAccountPageProps) {
  const searchParams = await props.searchParams;
  const branding = await getDealerBranding();
  const profile = await getDealerProfile();

  return (
    <DealerShell branding={branding}>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="mb-1 text-lg font-semibold text-[var(--color-text)]">
            Account
          </h1>
          <p className="mb-4 text-sm text-[color-mix(in_srgb,var(--color-text)_70%,#9ca3af_30%)]">
            Beheer hier je inloggegevens voor het dealerportaal.
          </p>

          {profile && (
            <div className="mb-4 rounded-xl bg-zinc-50 px-3 py-2.5 text-sm text-zinc-700">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Login e-mailadres
              </p>
              <p className="mt-0.5 font-medium text-zinc-900">
                {profile.userEmail || "Onbekend e-mailadres"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Dit is het e-mailadres dat je gebruikt om in te loggen. Neem
                contact op met Kempa als je dit wilt wijzigen.
              </p>
            </div>
          )}

          {searchParams.error === "validation" && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Zorg dat beide wachtwoorden gelijk zijn en minimaal 6 tekens
              bevatten.
            </div>
          )}
          {searchParams.error === "update_failed" && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Het wijzigen van het wachtwoord is mislukt. Probeer het later
              opnieuw.
            </div>
          )}
          {searchParams.ok === "updated" && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Wachtwoord succesvol bijgewerkt.
            </div>
          )}

          <form action={updatePasswordAction} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="new_password"
                className="text-sm font-medium text-zinc-800"
              >
                Nieuw wachtwoord
              </label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                required
                minLength={6}
                className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                placeholder="Minimaal 6 tekens"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm_password"
                className="text-sm font-medium text-zinc-800"
              >
                Bevestig nieuw wachtwoord
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                minLength={6}
                className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                placeholder="Nogmaals hetzelfde wachtwoord"
              />
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Wachtwoord opslaan
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-[var(--color-text)]">
            Contact & aanvragen
          </h2>
          <p className="mb-4 text-sm text-[color-mix(in_srgb,var(--color-text)_70%,#9ca3af_30%)]">
            Pas hier het contactadres en het e-mailadres voor aanvragen aan.
          </p>

          {searchParams.dealer_error === "missing_dealer" && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Er is geen dealerprofiel gekoppeld aan dit account. Neem contact
              op met Kempa.
            </div>
          )}
          {searchParams.dealer_error === "update_failed" && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              De dealergegevens konden niet worden opgeslagen. Probeer het
              later opnieuw.
            </div>
          )}
          {searchParams.dealer_ok === "updated" && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Dealergegevens succesvol bijgewerkt.
            </div>
          )}

          {profile ? (
            <form
              action={updateDealerContactAction}
              className="grid gap-4 text-sm md:grid-cols-2"
            >
              <div className="space-y-1.5 md:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Dealer
                </p>
                <p className="text-sm font-medium text-zinc-900">
                  {profile.dealerName ?? "Onbekende dealer"}
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact_email"
                  className="text-sm font-medium text-zinc-800"
                >
                  Contact e-mail
                </label>
                <input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  defaultValue={profile.contactEmail ?? ""}
                  className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="contact@dealer.be"
                />
                <p className="text-xs text-zinc-500">
                  Dit adres gebruiken we voor praktische communicatie rond het
                  dealerportaal.
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="inquiry_email"
                  className="text-sm font-medium text-zinc-800"
                >
                  E-mail voor aanvragen
                </label>
                <input
                  id="inquiry_email"
                  name="inquiry_email"
                  type="email"
                  defaultValue={profile.inquiryEmail ?? ""}
                  className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="offertes@dealer.be"
                />
                <p className="text-xs text-zinc-500">
                  Aanvragen vanuit de catalogus worden standaard naar dit adres
                  gestuurd. Laat dit leeg om aanvragen naar Kempa te laten gaan.
                </p>
              </div>

              <div className="mt-2 flex justify-end md:col-span-2">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Dealergegevens opslaan
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-zinc-600">
              We konden je dealerprofiel niet laden. Vernieuw de pagina of neem
              contact op met Kempa als dit probleem blijft bestaan.
            </p>
          )}
        </div>
      </div>
    </DealerShell>
  );
}

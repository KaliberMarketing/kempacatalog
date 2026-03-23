import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account | Admin portal",
};

type AdminAccountPageProps = {
  searchParams: Promise<{
    error?: string;
    ok?: string;
  }>;
};

async function getAdminEmail(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.email ?? null;
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
    redirect("/admin/account?error=validation");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    redirect("/admin/account?error=update_failed");
  }

  redirect("/admin/account?ok=updated");
}

export default async function AdminAccountPage(props: AdminAccountPageProps) {
  const searchParams = await props.searchParams;
  const email = await getAdminEmail();

  return (
    <AdminShell
      title="Account"
      description="Beheer hier je inloggegevens voor het adminportaal."
    >
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-zinc-900">Account</h1>
        <p className="mb-4 text-sm text-zinc-600">
          Pas hier je wachtwoord aan. Het e-mailadres van je admin-account is
          niet wijzigbaar in de app.
        </p>

        {email && (
          <div className="mb-4 rounded-xl bg-zinc-50 px-3 py-2.5 text-sm text-zinc-700">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Login e-mailadres
            </p>
            <p className="mt-0.5 font-medium text-zinc-900">
              {email || "Onbekend e-mailadres"}
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
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[var(--kempa-green)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Wachtwoord opslaan
          </button>
        </form>
      </div>
    </AdminShell>
  );
}


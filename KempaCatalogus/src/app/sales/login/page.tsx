
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Sales login | Kempa Catalogus",
};

async function salesLoginAction(formData: FormData) {
  "use server";

  const password = String(formData.get("password") || "");
  const from = String(formData.get("from") || "/sales");

  const expectedPassword = process.env.SALES_PASSWORD;

  if (!expectedPassword || password !== expectedPassword) {
    redirect("/sales/login?error=invalid");
  }

  const cookieStore = await cookies();
  cookieStore.set("sales_auth", "true", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(from || "/sales");
}

type SalesLoginPageProps = {
  searchParams: Promise<{ error?: string; from?: string }>;
};

export default async function SalesLoginPage(props: SalesLoginPageProps) {
  const searchParams = await props.searchParams;
  const error = searchParams.error;
  const from = searchParams.from ?? "/sales";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900">
          Salescatalogus
        </h1>
        <p className="mb-6 text-sm text-zinc-600">
          Voer het gedeelde sales-wachtwoord in om de Kempa salescatalogus te
          openen.
        </p>

        {error === "invalid" && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Onjuist wachtwoord. Probeer het opnieuw.
          </div>
        )}

        <form action={salesLoginAction} className="space-y-4">
          <input type="hidden" name="from" value={from} />

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-800"
            >
              Wachtwoord
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Open salescatalogus
          </button>
        </form>
      </div>
    </div>
  );
}


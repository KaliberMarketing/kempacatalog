import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Login | Kempa Catalogus Portal",
};

async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect("/login?error=missing_credentials");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=invalid_credentials");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = (user?.user_metadata as any)?.role as
    | "admin"
    | "dealer"
    | "sales"
    | undefined;
  const dealerId = (user?.user_metadata as any)?.dealer_id as
    | string
    | undefined;

  const cookieStore = await cookies();

  if (role) {
    cookieStore.set("kempa_role", role, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  if (dealerId) {
    cookieStore.set("kempa_dealer_id", dealerId, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  if (role === "admin") {
    redirect("/admin");
  }

  if (role === "dealer") {
    redirect("/dealer");
  }

  if (role === "sales") {
    redirect("/sales");
  }

  redirect("/");
}

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage(props: LoginPageProps) {
  const searchParams = await props.searchParams;
  const error = searchParams.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900">
          Inloggen
        </h1>
        <p className="mb-6 text-sm text-zinc-600">
          Log in op het Kempa Catalogus Portal met je e-mailadres en wachtwoord.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error === "missing_credentials" &&
              "Vul zowel je e-mailadres als wachtwoord in."}
            {error === "invalid_credentials" &&
              "Ongeldige inloggegevens. Probeer het opnieuw."}
            {error !== "missing_credentials" &&
              error !== "invalid_credentials" &&
              "Er is iets misgegaan bij het inloggen. Probeer het opnieuw."}
          </div>
        )}

        <form action={loginAction} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-zinc-800"
            >
              E-mailadres
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="jij@voorbeeld.be"
            />
          </div>

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
            Inloggen
          </button>
        </form>
      </div>
    </div>
  );
}


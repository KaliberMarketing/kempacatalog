import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nieuwe dealer | Kempa admin",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createDealerAction(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const contactEmail = String(formData.get("contact_email") || "").trim();
  const inquiryEmail = String(formData.get("inquiry_email") || "").trim();

  if (!name) {
    redirect("/admin/dealers/new?error=missing_name");
  }

  const slug = slugify(slugInput || name);

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("dealers").insert({
    name,
    slug,
    contact_email: contactEmail || null,
    inquiry_email: inquiryEmail || null,
    is_active: true,
  });

  if (error) {
    redirect("/admin/dealers/new?error=save_failed");
  }

  redirect("/admin/dealers");
}

type NewDealerPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewDealerPage(props: NewDealerPageProps) {
  const searchParams = await props.searchParams;
  const error = searchParams.error;

  return (
    <AdminShell
      title="Nieuwe dealer"
      description="Maak een nieuwe dealer aan voor de catalogus."
    >
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error === "missing_name" &&
              "Vul minstens een naam voor de dealer in."}
            {error === "save_failed" &&
              "De dealer kon niet worden opgeslagen. Probeer het opnieuw."}
            {error !== "missing_name" &&
              error !== "save_failed" &&
              "Er is iets misgegaan. Probeer het opnieuw."}
          </div>
        )}

        <form action={createDealerAction} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-sm font-medium text-zinc-800"
            >
              Naam *
            </label>
            <input
              id="name"
              name="name"
              required
              className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="Houthandel Janssen"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="slug"
              className="text-sm font-medium text-zinc-800"
            >
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="houthandel-janssen"
            />
            <p className="text-xs text-zinc-500">
              Laat leeg om automatisch een slug op basis van de naam te maken.
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
              className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="info@dealer.be"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="inquiry_email"
              className="text-sm font-medium text-zinc-800"
            >
              Inquiry e-mail
            </label>
            <input
              id="inquiry_email"
              name="inquiry_email"
              type="email"
              className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="offertes@dealer.be"
            />
            <p className="text-xs text-zinc-500">
              Laat leeg om aanvragen standaard naar Kempa te sturen.
            </p>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <a
              href="/admin/dealers"
              className="inline-flex items-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              Annuleren
            </a>
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Dealer aanmaken
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}


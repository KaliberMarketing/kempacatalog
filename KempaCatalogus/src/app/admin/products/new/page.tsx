import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductImageUploadInput } from "@/components/admin/ProductImageUploadInput";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nieuw product | Kempa admin",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createProductAction(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const material = String(formData.get("material") || "").trim();
  const finish = String(formData.get("finish") || "").trim();
  const basePriceRaw = String(formData.get("base_price") || "").trim();
  const imageInput = String(formData.get("image_urls") || "").trim();

  const images = imageInput
    ? imageInput
        .split(/[|\n]/)
        .map((url) => url.trim())
        .filter(Boolean)
    : [];

  if (!name) {
    redirect("/admin/products/new?error=missing_name");
  }

  const slug = slugify(slugInput || name);

  const supabase = await createSupabaseServerClient();

  const basePrice = basePriceRaw ? parseFloat(basePriceRaw) : null;

  const { error } = await supabase.from("products").insert({
    name,
    slug,
    description: description || null,
    material: material || null,
    finish: finish || null,
    base_price: basePrice,
    images: images.length ? images : null,
    is_active: true,
  });

  if (error) {
    redirect("/admin/products/new?error=save_failed");
  }

  redirect("/admin/products");
}

type NewProductPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewProductPage(props: NewProductPageProps) {
  const searchParams = await props.searchParams;
  const error = searchParams.error;

  return (
    <AdminShell
      title="Nieuw product"
      description="Maak een nieuw product aan voor de catalogus."
    >
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error === "missing_name" &&
              "Vul minstens een naam voor het product in."}
            {error === "save_failed" &&
              "Het product kon niet worden opgeslagen. Probeer het opnieuw."}
            {error !== "missing_name" &&
              error !== "save_failed" &&
              "Er is iets misgegaan. Probeer het opnieuw."}
          </div>
        )}

        <form action={createProductAction} className="space-y-4">
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
              placeholder="Eiken deur"
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
              placeholder="eiken-deur"
            />
            <p className="text-xs text-zinc-500">
              Laat leeg om automatisch een slug op basis van de naam te maken.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="text-sm font-medium text-zinc-800"
            >
              Beschrijving
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="Korte productomschrijving..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="material"
                className="text-sm font-medium text-zinc-800"
              >
                Materiaal
              </label>
              <input
                id="material"
                name="material"
                className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                placeholder="Eik"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="finish"
                className="text-sm font-medium text-zinc-800"
              >
                Afwerking
              </label>
              <input
                id="finish"
                name="finish"
                className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                placeholder="Naturel"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="base_price"
              className="text-sm font-medium text-zinc-800"
            >
              Verkoopprijs (€)
            </label>
            <input
              id="base_price"
              name="base_price"
              type="number"
              step="0.01"
              min="0"
              className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="0.00"
            />
            <p className="text-xs text-zinc-500">
              Kempa-verkoopprijs. Wordt enkel getoond in de salescatalogus.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="image_urls"
              className="text-sm font-medium text-zinc-800"
            >
              Afbeeldings-URL&apos;s
            </label>
            <ProductImageUploadInput targetTextareaId="image_urls" />
            <textarea
              id="image_urls"
              name="image_urls"
              rows={3}
              className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder={
                "https://.../image1.jpg\nhttps://.../image2.jpg of gebruik | als scheidingsteken"
              }
            />
            <p className="text-xs text-zinc-500">
              Plak hier één of meerdere volledige afbeeldings-URL&apos;s. Elke
              URL op een nieuwe lijn of gescheiden met een |.
            </p>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <a
              href="/admin/products"
              className="inline-flex items-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              Annuleren
            </a>
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Product aanmaken
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}


import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductImageUploadInput } from "@/components/admin/ProductImageUploadInput";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Product bewerken | Kempa admin",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ProductEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
};

async function updateProductAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const material = String(formData.get("material") || "").trim();
  const finish = String(formData.get("finish") || "").trim();
  const basePriceRaw = String(formData.get("base_price") || "").trim();
  const imageInput = String(formData.get("image_urls") || "").trim();

  if (!id || !name) {
    redirect(`/admin/products/${id}?error=missing`);
  }

  const slug = slugify(slugInput || name);
  const images = imageInput
    ? imageInput
        .split(/[|\n]/)
        .map((url) => url.trim())
        .filter(Boolean)
    : [];

  const supabase = await createSupabaseServerClient();

  const basePrice = basePriceRaw ? parseFloat(basePriceRaw) : null;

  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug,
      description: description || null,
      material: material || null,
      finish: finish || null,
      base_price: basePrice,
      images: images.length ? images : null,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/products/${id}?error=save_failed`);
  }

  redirect(`/admin/products/${id}?ok=updated`);
}

async function deleteProductAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");

  if (!id) {
    redirect("/admin/products?error=delete_missing");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    redirect(`/admin/products/${id}?error=delete_failed`);
  }

  redirect("/admin/products?ok=deleted");
}

export default async function ProductEditPage(props: ProductEditPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, slug, description, material, finish, base_price, images")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !product) {
    return (
      <AdminShell
        title="Product niet gevonden"
        description="Dit product bestaat niet (meer) in de database."
      >
        <p className="text-sm text-zinc-600">
          ID:{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">
            {params.id}
          </code>
        </p>
      </AdminShell>
    );
  }

  const imageText = (product.images as string[] | null)?.join("\n") ?? "";

  return (
    <AdminShell
      title={`Product: ${product.name as string}`}
      description="Bewerk of verwijder dit product."
    >
      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {searchParams.error === "missing" && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Vul minstens een naam in.
            </div>
          )}
          {searchParams.error === "save_failed" && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Het product kon niet worden opgeslagen. Probeer het opnieuw.
            </div>
          )}
          {searchParams.ok === "updated" && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Product succesvol bijgewerkt.
            </div>
          )}

          <form action={updateProductAction} className="space-y-4">
            <input type="hidden" name="id" value={product.id as string} />

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
                defaultValue={product.name as string}
                required
                className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
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
                defaultValue={product.slug as string}
                className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
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
                defaultValue={(product.description as string | null) ?? ""}
                className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
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
                  defaultValue={(product.material as string | null) ?? ""}
                  className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
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
                  defaultValue={(product.finish as string | null) ?? ""}
                  className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
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
                defaultValue={
                  (product.base_price as number | null) != null
                    ? String(product.base_price)
                    : ""
                }
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
                defaultValue={imageText}
                className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
              <p className="text-xs text-zinc-500">
                Één URL per lijn of gescheiden met een |.
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <a
                href="/admin/products"
                className="inline-flex items-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Terug
              </a>
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Opslaan
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-3 rounded-2xl bg-white p-6 text-sm text-zinc-700 shadow-sm">
          {searchParams.error === "delete_failed" && (
            <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Verwijderen is mislukt. Probeer het opnieuw.
            </div>
          )}
          <h2 className="text-sm font-semibold text-red-700">
            Product verwijderen
          </h2>
          <p className="text-xs text-zinc-500">
            Dit verwijdert het product definitief uit de catalogus (inclusief
            eventuele dealer-koppelingen).
          </p>
          <form action={deleteProductAction}>
            <input type="hidden" name="id" value={product.id as string} />
            <button
              type="submit"
              className="mt-3 inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Product verwijderen
            </button>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}


import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminProductsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, material, finish, is_active, created_at")
    .order("created_at", { ascending: false });

  return (
    <AdminShell
      title="Producten"
      description="Beheer producten voor de catalogus."
    >
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/products/new"
          className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50"
        >
          Nieuw product
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                Naam
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                Slug
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                Materiaal / afwerking
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products?.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-2 text-sm text-zinc-900">
                  {product.name as string}
                </td>
                <td className="px-4 py-2 text-sm text-zinc-600">
                  {product.slug as string}
                </td>
                <td className="px-4 py-2 text-sm text-zinc-600">
                  {[
                    product.material as string | null,
                    product.finish as string | null,
                  ]
                    .filter(Boolean)
                    .join(" • ") || "–"}
                </td>
                <td className="px-4 py-2 text-sm">
                  {product.is_active ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Actief
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                      Inactief
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-right text-sm">
                  <a
                    href={`/admin/products/${product.id as string}`}
                    className="text-xs font-medium text-zinc-900 hover:underline"
                  >
                    Bewerken
                  </a>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-zinc-500"
                >
                  Nog geen producten gevonden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}


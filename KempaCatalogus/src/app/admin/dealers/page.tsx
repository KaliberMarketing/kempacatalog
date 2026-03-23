import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminDealersPage() {
  const supabase = await createSupabaseServerClient();

  const { data: dealers } = await supabase
    .from("dealers")
    .select(
      "id, name, slug, contact_email, inquiry_email, is_active, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <AdminShell
      title="Dealers"
      description="Beheer dealers, branding en inquiry-adressen."
    >
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/dealers/new"
          className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50"
        >
          Nieuwe dealer
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
                E-mail
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                Inquiry e-mail
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                Status
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {dealers?.map((dealer) => (
              <tr key={dealer.id}>
                <td className="px-4 py-2 text-sm text-zinc-900">
                  {dealer.name as string}
                </td>
                <td className="px-4 py-2 text-sm text-zinc-600">
                  {dealer.slug as string}
                </td>
                <td className="px-4 py-2 text-sm text-zinc-600">
                  {(dealer.contact_email as string | null) ?? "–"}
                </td>
                <td className="px-4 py-2 text-sm text-zinc-600">
                  {(dealer.inquiry_email as string | null) ?? "–"}
                </td>
                <td className="px-4 py-2 text-sm">
                  {dealer.is_active ? (
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
                    href={`/admin/dealers/${dealer.id as string}`}
                    className="text-xs font-medium text-zinc-900 hover:underline"
                  >
                    Details
                  </a>
                </td>
              </tr>
            ))}
            {(!dealers || dealers.length === 0) && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-zinc-500"
                >
                  Nog geen dealers gevonden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}


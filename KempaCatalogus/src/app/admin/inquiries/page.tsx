import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminInquiriesPage() {
  const supabase = await createSupabaseServerClient();

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("id, source, dealer_id, name, company, email, created_at, sent_to")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <AdminShell
      title="Aanvragen"
      description="Overzicht van binnengekomen aanvragen."
    >
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                Datum
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                Bron
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                Naam
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                E-mail
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                Verzonden naar
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {inquiries?.map((inq) => (
              <tr key={inq.id}>
                <td className="px-4 py-2 text-xs text-zinc-600">
                  {inq.created_at
                    ? new Date(inq.created_at as string).toLocaleString()
                    : "–"}
                </td>
                <td className="px-4 py-2 text-xs text-zinc-600">
                  {inq.source === "dealer" ? "Dealer" : "Sales"}
                </td>
                <td className="px-4 py-2 text-sm text-zinc-900">
                  {inq.name as string}
                  {inq.company && (
                    <span className="ml-1 text-xs text-zinc-500">
                      ({inq.company as string})
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-zinc-600">
                  {inq.email as string}
                </td>
                <td className="px-4 py-2 text-xs text-zinc-600">
                  {(inq.sent_to as string | null) ?? "–"}
                </td>
              </tr>
            ))}
            {(!inquiries || inquiries.length === 0) && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-zinc-500"
                >
                  Nog geen aanvragen gevonden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}


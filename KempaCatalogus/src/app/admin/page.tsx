import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [{ count: dealersCount }, { count: productsCount }, { count: inquiriesCount }] =
    await Promise.all([
      supabase.from("dealers").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("inquiries").select("id", { count: "exact", head: true }),
    ]);

  return (
    <AdminShell
      title="Dashboard"
      description="Overzicht van dealers, producten en aanvragen."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Dealers
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">
            {dealersCount ?? 0}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Producten
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">
            {productsCount ?? 0}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Aanvragen
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">
            {inquiriesCount ?? 0}
          </p>
        </div>
      </div>
    </AdminShell>
  );
}


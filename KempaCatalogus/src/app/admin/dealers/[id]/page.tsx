import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AdminShell } from "@/components/admin/AdminShell";
import { DealerLogoUploadInput } from "@/components/admin/DealerLogoUploadInput";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BrandingEditor } from "@/components/branding/BrandingEditor";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type DealerDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    user_error?: string;
    user_ok?: string;
    info_error?: string;
    info_ok?: string;
    delete_error?: string;
    products_ok?: string;
  }>;
};

type DealerProductAssignmentRow = {
  id: string;
  name: string;
  slug: string;
  material: string | null;
  isAssigned: boolean;
};

async function createDealerUserAction(formData: FormData) {
  "use server";

  const dealerId = String(formData.get("dealer_id") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!dealerId || !email || !password) {
    redirect(`/admin/dealers/${dealerId}?user_error=missing`);
  }

  try {
    const supabaseAdmin = createSupabaseServiceClient();

    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "dealer",
        dealer_id: dealerId,
      },
    });

    if (error) {
      redirect(
        `/admin/dealers/${dealerId}?user_error=${encodeURIComponent(error.message)}`,
      );
    }
  } catch (e) {
    if (isRedirectError(e)) throw e;
    const msg =
      e instanceof Error ? e.message : "Onbekende fout bij aanmaken user";
    redirect(
      `/admin/dealers/${dealerId}?user_error=${encodeURIComponent(msg)}`,
    );
  }

  redirect(`/admin/dealers/${dealerId}?user_ok=created`);
}

async function updateDealerInfoAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const contactEmail = String(formData.get("contact_email") || "").trim();
  const inquiryEmail = String(formData.get("inquiry_email") || "").trim();
   const logoUrl = String(formData.get("logo_url") || "").trim();

  if (!id || !name || !slug) {
    redirect(`/admin/dealers/${id}?info_error=missing`);
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("dealers")
    .update({
      name,
      slug,
      contact_email: contactEmail || null,
      inquiry_email: inquiryEmail || null,
      logo_url: logoUrl || null,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/dealers/${id}?info_error=failed`);
  }

  redirect(`/admin/dealers/${id}?info_ok=updated`);
}

async function deleteDealerAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");

  if (!id) {
    redirect("/admin/dealers?error=delete_missing");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("dealers").delete().eq("id", id);

  if (error) {
    redirect(`/admin/dealers/${id}?delete_error=failed`);
  }

  redirect("/admin/dealers?ok=deleted");
}

async function updateDealerProductsAction(formData: FormData) {
  "use server";

  const dealerId = String(formData.get("dealer_id") || "").trim();

  if (!dealerId) {
    redirect("/admin/dealers?error=dealer_missing");
  }

  const supabase = await createSupabaseServerClient();

  const selectedProductIds = formData.getAll("product_id") as string[];

  if (selectedProductIds.length === 0) {
    // Geen producten geselecteerd → alle bestaande koppelingen verwijderen
    await supabase.from("dealer_products").delete().eq("dealer_id", dealerId);
    redirect(`/admin/dealers/${dealerId}?products_ok=updated`);
  }

  // 1) Verwijder alle koppelingen die niet meer geselecteerd zijn
  const { data: existingRows } = await supabase
    .from("dealer_products")
    .select("product_id")
    .eq("dealer_id", dealerId);

  if (existingRows && existingRows.length > 0) {
    const selectedSet = new Set(selectedProductIds);
    const toDelete = (existingRows as { product_id: string }[])
      .filter((row) => !selectedSet.has(row.product_id))
      .map((row) => row.product_id);

    if (toDelete.length > 0) {
      await supabase
        .from("dealer_products")
        .delete()
        .eq("dealer_id", dealerId)
        .in("product_id", toDelete);
    }
  }

  // 2) Voeg nieuwe koppelingen toe; bestaande rijen blijven behouden (incl. prijzen)
  const rowsToUpsert = selectedProductIds.map((productId) => ({
    dealer_id: dealerId,
    product_id: productId,
  }));

  await supabase
    .from("dealer_products")
    .upsert(rowsToUpsert, {
      onConflict: "dealer_id,product_id",
      ignoreDuplicates: false,
    });

  redirect(`/admin/dealers/${dealerId}?products_ok=updated`);
}

export default async function DealerDetailPage(props: DealerDetailPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: dealer, error } = await supabase
    .from("dealers")
    .select(
      "id, name, slug, logo_url, contact_email, inquiry_email, primary_color, secondary_color, accent_color, background_color, text_color, font_heading, font_body",
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error || !dealer) {
    return (
      <AdminShell
        title="Dealer niet gevonden"
        description="Deze dealer bestaat niet (meer) in de database."
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

  const branding = {
    name: dealer.name as string,
    logoUrl: (dealer.logo_url as string | null) ?? null,
    primaryColor: (dealer.primary_color as string | null) ?? "#1a1a1a",
    secondaryColor: (dealer.secondary_color as string | null) ?? "#ffffff",
    accentColor: (dealer.accent_color as string | null) ?? "#c8a96e",
    backgroundColor: (dealer.background_color as string | null) ?? "#f9f9f9",
    textColor: (dealer.text_color as string | null) ?? "#1a1a1a",
    fontHeading: (dealer.font_heading as string | null) ?? "Syne",
    fontBody: (dealer.font_body as string | null) ?? "DM Sans",
  };

  // Haal alle producten op + huidige dealer_product-koppelingen
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, material, is_active")
    .order("name", { ascending: true });

  const { data: dealerProducts } = await supabase
    .from("dealer_products")
    .select("product_id")
    .eq("dealer_id", dealer.id as string);

  const assignedSet = new Set<string>(
    (dealerProducts as { product_id: string }[] | null | undefined)?.map(
      (row) => row.product_id as string,
    ) ?? [],
  );

  const assignmentRows: DealerProductAssignmentRow[] =
    (products as any[] | null | undefined)?.map((p) => ({
      id: p.id as string,
      name: p.name as string,
      slug: p.slug as string,
      material: (p.material as string | null) ?? null,
      isAssigned: assignedSet.has(p.id as string),
    })) ?? [];

  return (
    <AdminShell
      title={`Dealer: ${dealer.name as string}`}
      description="Pas branding en basisgegevens voor deze dealer aan."
    >
      <div className="mb-4 grid gap-4 md:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Dealer informatie
          </p>

          {searchParams.info_error === "missing" && (
            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              Vul minstens naam en slug in.
            </div>
          )}
          {searchParams.info_error === "failed" && (
            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              Dealergegevens konden niet worden opgeslagen.
            </div>
          )}
          {searchParams.info_ok === "updated" && (
            <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              Dealergegevens succesvol bijgewerkt.
            </div>
          )}

          <form
            action={updateDealerInfoAction}
            className="mt-3 grid gap-3 text-sm md:grid-cols-2"
          >
            <input type="hidden" name="id" value={dealer.id as string} />

            <div className="space-y-1.5">
              <p className="text-xs text-zinc-500">Naam</p>
              <input
                name="name"
                defaultValue={dealer.name as string}
                className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-zinc-500">Slug</p>
              <input
                name="slug"
                defaultValue={dealer.slug as string}
                className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-zinc-500">Contact e-mail</p>
              <input
                name="contact_email"
                defaultValue={(dealer.contact_email as string | null) ?? ""}
                className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-zinc-500">Inquiry e-mail</p>
              <input
                name="inquiry_email"
                defaultValue={(dealer.inquiry_email as string | null) ?? ""}
                className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <p className="text-xs text-zinc-500">Logo URL</p>
              <input
                id="logo_url"
                name="logo_url"
                defaultValue={(dealer.logo_url as string | null) ?? ""}
                className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                placeholder="https://..."
              />
              <div className="mt-2">
                <DealerLogoUploadInput targetInputId="logo_url" />
              </div>
            </div>

            <div className="mt-2 flex justify-end md:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Gegevens opslaan
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-3 rounded-2xl bg-white p-4 text-xs text-zinc-700 shadow-sm">
          {searchParams.delete_error === "failed" && (
            <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              Dealer kon niet worden verwijderd. Probeer het opnieuw.
            </div>
          )}
          <p className="text-xs font-semibold text-red-700">
            Dealer verwijderen
          </p>
          <p className="text-[11px] text-zinc-500">
            Dit verwijdert de dealer en alle gekoppelde dealer-producten
            definitief.
          </p>
          <form action={deleteDealerAction}>
            <input type="hidden" name="id" value={dealer.id as string} />
            <button
              type="submit"
              className="mt-2 inline-flex items-center rounded-full bg-red-600 px-4 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Dealer verwijderen
            </button>
          </form>
        </div>
      </div>

      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Producten voor deze dealer
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Selecteer welke producten zichtbaar zijn in de catalogus van deze
          dealer. De dealer kan zelf prijzen instellen in het dealerportaal.
        </p>

        {searchParams.products_ok === "updated" && (
          <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            Productkoppelingen succesvol bijgewerkt.
          </div>
        )}

        {assignmentRows.length === 0 ? (
          <p className="mt-3 text-xs text-zinc-500">
            Er zijn nog geen producten beschikbaar. Voeg eerst producten toe in
            het productbeheer.
          </p>
        ) : (
          <div className="mt-3 max-h-[400px] space-y-3 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs">
          <form
            id="dealer-products-form"
            action={updateDealerProductsAction}
            className="space-y-3"
          >
            <input type="hidden" name="dealer_id" value={dealer.id as string} />
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wide text-zinc-500">
                  <th className="px-2 py-1.5">Selecteer</th>
                  <th className="px-2 py-1.5">Product</th>
                  <th className="px-2 py-1.5">Materiaal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {assignmentRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-2 py-1.5 align-middle">
                      <input
                        type="checkbox"
                        name="product_id"
                        value={row.id}
                        defaultChecked={row.isAssigned}
                        className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="font-medium text-zinc-900">
                        {row.name}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        slug: {row.slug}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 align-middle text-[11px] text-zinc-600">
                      {row.material ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </form>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <form action={updateDealerProductsAction} className="inline-flex">
              <input type="hidden" name="dealer_id" value={dealer.id as string} />
              {assignmentRows.map((row) => (
                <input
                  key={row.id}
                  type="hidden"
                  name="product_id"
                  value={row.id}
                />
              ))}
              <button
                type="submit"
                className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-[11px] font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Alle producten opslaan
              </button>
            </form>
            <button
              type="submit"
              form="dealer-products-form"
              className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Productkoppelingen opslaan
            </button>
          </div>
          </div>
        )}
      </div>

      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Dealer login
        </p>

        {searchParams.user_error && (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.user_error === "missing"
              ? "Vul zowel e-mailadres als wachtwoord in."
              : searchParams.user_error}
          </div>
        )}

        {searchParams.user_ok === "created" && (
          <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Dealer-gebruiker succesvol aangemaakt. De dealer kan nu inloggen
            met dit e-mailadres en wachtwoord.
          </div>
        )}

        <form
          action={createDealerUserAction}
          className="mt-3 grid gap-3 text-sm md:grid-cols-[2fr,2fr,auto]"
        >
          <input type="hidden" name="dealer_id" value={dealer.id as string} />
          <div className="space-y-1.5">
            <label
              htmlFor="dealer_email"
              className="text-xs font-medium text-zinc-800"
            >
              Login e-mail
            </label>
            <input
              id="dealer_email"
              name="email"
              type="email"
              required
              className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="login@dealer.be"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="dealer_password"
              className="text-xs font-medium text-zinc-800"
            >
              Wachtwoord
            </label>
            <input
              id="dealer_password"
              name="password"
              type="password"
              required
              className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="Min. 6 tekens"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Dealer login aanmaken
            </button>
          </div>
        </form>
      </div>

      <BrandingEditor dealerId={dealer.id as string} initialBranding={branding} />
    </AdminShell>
  );
}


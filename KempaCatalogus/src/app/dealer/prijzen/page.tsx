import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  DealerShell,
  type DealerBranding,
} from "@/components/branding/DealerShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Prijzen | Dealer portal",
};

async function getDealerContext() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dealerId =
    (user?.user_metadata as any | undefined)?.dealer_id ?? null;

  if (!dealerId) return null;

  const { data: dealer } = await supabase
    .from("dealers")
    .select(
      "id, name, logo_url, primary_color, secondary_color, accent_color, background_color, text_color, font_heading, font_body",
    )
    .eq("id", dealerId)
    .maybeSingle();

  if (!dealer) return null;

  const branding: DealerBranding = {
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

  return { dealerId: dealer.id as string, branding };
}

type DealerProductRow = {
  product_id: string;
  show_price: boolean;
  price: number | null;
  product_name: string;
  product_slug: string;
  product_material: string | null;
};

async function getDealerProducts(dealerId: string): Promise<DealerProductRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data: dealerProducts } = await supabase
    .from("dealer_products")
    .select("product_id, show_price, price, products(name, slug, material)")
    .eq("dealer_id", dealerId);

  if (!dealerProducts) return [];

  return dealerProducts.map((dp) => {
    const product = dp.products as any;
    return {
      product_id: dp.product_id as string,
      show_price: (dp.show_price as boolean) ?? false,
      price: (dp.price as number | null) ?? null,
      product_name: (product?.name as string) ?? "Onbekend product",
      product_slug: (product?.slug as string) ?? "",
      product_material: (product?.material as string | null) ?? null,
    };
  });
}

async function updateDealerPricesAction(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dealerId =
    (user?.user_metadata as any | undefined)?.dealer_id ?? null;

  if (!dealerId) {
    redirect("/dealer/prijzen?error=no_dealer");
  }

  const productIds = formData.getAll("product_id") as string[];

  for (const productId of productIds) {
    const showPrice = formData.get(`show_price_${productId}`) === "on";
    const priceRaw = String(formData.get(`price_${productId}`) || "").trim();
    const price = priceRaw ? parseFloat(priceRaw) : null;

    await supabase
      .from("dealer_products")
      .update({
        show_price: showPrice,
        price,
      })
      .eq("dealer_id", dealerId)
      .eq("product_id", productId);
  }

  redirect("/dealer/prijzen?ok=saved");
}

type DealerPrijzenPageProps = {
  searchParams: Promise<{ error?: string; ok?: string }>;
};

export default async function DealerPrijzenPage(props: DealerPrijzenPageProps) {
  const searchParams = await props.searchParams;
  const context = await getDealerContext();

  if (!context) {
    redirect("/login");
  }

  const dealerProducts = await getDealerProducts(context.dealerId);

  return (
    <DealerShell branding={context.branding}>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="mb-1 text-lg font-semibold text-[var(--color-text)]">
            Mijn prijzen
          </h1>
          <p className="mb-6 text-sm text-[color-mix(in_srgb,var(--color-text)_70%,#9ca3af_30%)]">
            Stel per product in of u een prijs wilt tonen in uw catalogus en wat
            die prijs is. Deze prijzen zijn enkel zichtbaar voor uw klanten.
          </p>

          {searchParams.ok === "saved" && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Prijzen succesvol opgeslagen.
            </div>
          )}
          {searchParams.error === "no_dealer" && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Er is geen dealerprofiel gekoppeld aan dit account.
            </div>
          )}

          {dealerProducts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
              Er zijn nog geen producten aan uw dealerprofiel gekoppeld. Neem
              contact op met Kempa om producten toe te wijzen.
            </div>
          ) : (
            <form action={updateDealerPricesAction} className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-zinc-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                      <th className="px-4 py-2.5">Product</th>
                      <th className="px-4 py-2.5 text-center">Prijs tonen</th>
                      <th className="px-4 py-2.5">Prijs (€)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {dealerProducts.map((dp) => (
                      <tr key={dp.product_id}>
                        <td className="px-4 py-3">
                          <input
                            type="hidden"
                            name="product_id"
                            value={dp.product_id}
                          />
                          <p className="font-medium text-zinc-900">
                            {dp.product_name}
                          </p>
                          {dp.product_material && (
                            <p className="text-xs text-zinc-500">
                              {dp.product_material}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            name={`show_price_${dp.product_id}`}
                            defaultChecked={dp.show_price}
                            className="h-4 w-4 rounded border-zinc-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            name={`price_${dp.product_id}`}
                            step="0.01"
                            min="0"
                            defaultValue={dp.price != null ? String(dp.price) : ""}
                            placeholder="0.00"
                            className="block w-full max-w-[140px] rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Prijzen opslaan
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DealerShell>
  );
}

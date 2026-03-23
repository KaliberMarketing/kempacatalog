import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DealerShell } from "@/components/branding/DealerShell";
import { ProductDetail } from "@/components/catalog/ProductDetail";

type DealerProductPageProps = {
  params: Promise<{ productSlug: string }>;
};

export default async function DealerProductPage(props: DealerProductPageProps) {
  const params = await props.params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dealerId =
    (user?.user_metadata as any | undefined)?.dealer_id ?? null;

  if (!dealerId) {
    notFound();
  }

  const { data: dealer } = await supabase
    .from("dealers")
    .select(
      "name, logo_url, primary_color, secondary_color, accent_color, background_color, text_color, font_heading, font_body",
    )
    .eq("id", dealerId)
    .maybeSingle();

  const { data: product } = await supabase
    .from("products")
    .select("id, name, slug, description, material, finish, specs, images")
    .eq("slug", params.productSlug)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  let dealerShowPrice = false;
  let dealerPrice: number | null = null;

  if (dealerId) {
    const { data: dp } = await supabase
      .from("dealer_products")
      .select("show_price, price")
      .eq("dealer_id", dealerId)
      .eq("product_id", product.id)
      .maybeSingle();

    if (dp) {
      dealerShowPrice = (dp.show_price as boolean) ?? false;
      dealerPrice = (dp.price as number | null) ?? null;
    }
  }

  const branding = dealer
    ? {
        name: dealer.name as string,
        logoUrl: (dealer.logo_url as string | null) ?? null,
        primaryColor: (dealer.primary_color as string | null) ?? "#1a1a1a",
        secondaryColor: (dealer.secondary_color as string | null) ?? "#ffffff",
        accentColor: (dealer.accent_color as string | null) ?? "#c8a96e",
        backgroundColor:
          (dealer.background_color as string | null) ?? "#f9f9f9",
        textColor: (dealer.text_color as string | null) ?? "#1a1a1a",
        fontHeading: (dealer.font_heading as string | null) ?? "Syne",
        fontBody: (dealer.font_body as string | null) ?? "DM Sans",
      }
    : {
        name: "Kempa",
        logoUrl: null,
        primaryColor: "#1a1a1a",
        secondaryColor: "#ffffff",
        accentColor: "#c8a96e",
        backgroundColor: "#f9f9f9",
        textColor: "#1a1a1a",
        fontHeading: "Syne",
        fontBody: "DM Sans",
      };

  const specs =
    (product.specs as Record<string, string | number | null> | null) ?? null;

  return (
    <DealerShell branding={branding}>
      <ProductDetail
        name={product.name as string}
        description={(product.description as string | null) ?? null}
        material={(product.material as string | null) ?? null}
        finish={(product.finish as string | null) ?? null}
        images={(product.images as string[] | null) ?? null}
        specs={specs}
        price={dealerPrice}
        showPrice={dealerShowPrice}
      />
    </DealerShell>
  );
}

import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateCatalogPdf } from "@/lib/pdf/generateCatalog";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productIdsParam = searchParams.get("productIds");
  const mode = searchParams.get("mode"); // "dealer" | "sales"

  if (!productIdsParam) {
    return NextResponse.json(
      { error: "Missing productIds parameter" },
      { status: 400 },
    );
  }

  const productIds = productIdsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (productIds.length === 0) {
    return NextResponse.json(
      { error: "No valid productIds provided" },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dealerId: string | null = null;
  if (mode === "dealer") {
    dealerId = (user?.user_metadata as any | undefined)?.dealer_id ?? null;
    if (!dealerId) {
      return NextResponse.json(
        { error: "Dealer not authenticated" },
        { status: 401 },
      );
    }
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, slug, description, material, finish, base_price, specs, images")
    .in("id", productIds);

  if (productsError || !products || products.length === 0) {
    return NextResponse.json(
      { error: "No products found for given IDs" },
      { status: 404 },
    );
  }

  let branding = null;
  const isSales = mode === "sales";

  if (mode === "dealer" && dealerId) {
    const { data: dealer } = await supabase
      .from("dealers")
      .select(
        "name, logo_url, primary_color, secondary_color, accent_color, background_color, text_color, font_heading, font_body",
      )
      .eq("id", dealerId)
      .maybeSingle();

    if (dealer) {
      branding = {
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
      };
    }
  }

  let dealerPriceMap = new Map<
    string,
    { showPrice: boolean; price: number | null }
  >();

  if (!isSales && dealerId) {
    const { data: dealerProducts } = await supabase
      .from("dealer_products")
      .select("product_id, show_price, price")
      .eq("dealer_id", dealerId)
      .in("product_id", productIds);

    if (dealerProducts) {
      for (const dp of dealerProducts) {
        dealerPriceMap.set(dp.product_id as string, {
          showPrice: (dp.show_price as boolean) ?? false,
          price: (dp.price as number | null) ?? null,
        });
      }
    }
  }

  const catalogProducts = products.map((p) => {
    const images = (p.images as string[] | null) ?? null;
    let price: number | null = null;
    let showPrice = false;

    if (isSales) {
      price = (p.base_price as number | null) ?? null;
      showPrice = price != null;
    } else {
      const dp = dealerPriceMap.get(p.id as string);
      if (dp) {
        showPrice = dp.showPrice;
        price = dp.price;
      }
    }

    return {
      name: p.name as string,
      description: (p.description as string | null) ?? null,
      material: (p.material as string | null) ?? null,
      finish: (p.finish as string | null) ?? null,
      specs:
        (p.specs as Record<string, string | number | null> | null) ?? null,
      imageUrl: images?.[0] ?? null,
      price,
      showPrice,
    };
  });

  const pdfBuffer = await generateCatalogPdf({
    products: catalogProducts,
    branding,
    isSales,
  });

  const filenameBase = mode === "dealer" ? "dealer" : "sales";
  const filename = `catalog-${filenameBase}-selection.pdf`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}


import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateTechnicalSheetPdf } from "@/lib/pdf/generateSheet";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const mode = searchParams.get("mode"); // "dealer" | "sales"

  if (!productId) {
    return NextResponse.json(
      { error: "Missing productId parameter" },
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

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, slug, description, material, finish, base_price, specs, images")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product) {
    return NextResponse.json(
      { error: "Product not found" },
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

  const primaryImage =
    (product.images as string[] | null)?.[0] ?? null;

  let pdfPrice: number | null = null;
  let pdfShowPrice = false;

  if (isSales) {
    pdfPrice = (product.base_price as number | null) ?? null;
    pdfShowPrice = pdfPrice != null;
  } else if (dealerId) {
    const { data: dp } = await supabase
      .from("dealer_products")
      .select("show_price, price")
      .eq("dealer_id", dealerId)
      .eq("product_id", product.id)
      .maybeSingle();

    if (dp) {
      pdfShowPrice = (dp.show_price as boolean) ?? false;
      pdfPrice = (dp.price as number | null) ?? null;
    }
  }

  const pdfBuffer = await generateTechnicalSheetPdf({
    product: {
      name: product.name as string,
      description: (product.description as string | null) ?? null,
      material: (product.material as string | null) ?? null,
      finish: (product.finish as string | null) ?? null,
      specs:
        (product.specs as Record<string, string | number | null> | null) ??
        null,
      imageUrl: primaryImage,
      price: pdfPrice,
      showPrice: pdfShowPrice,
    },
    branding,
    isSales,
  });

  const filename = `technical-sheet-${
    mode === "dealer" ? "dealer" : "sales"
  }-${product.slug}.pdf`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}


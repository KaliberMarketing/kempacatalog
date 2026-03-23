import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  sendInquiryEmail,
  type InquirySource,
  type InquiryFormData,
} from "@/lib/email/sendInquiry";

export const runtime = "nodejs";

type PostBody = {
  mode: InquirySource;
  productIds: string[];
  form: InquiryFormData;
};

export async function POST(request: NextRequest) {
  let body: PostBody;

  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { mode, productIds, form } = body ?? {};

  if (!mode || (mode !== "dealer" && mode !== "sales")) {
    return NextResponse.json(
      { error: "Invalid or missing mode" },
      { status: 400 },
    );
  }

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json(
      { error: "productIds must be a non-empty array" },
      { status: 400 },
    );
  }

  if (!form?.name || !form?.email) {
    return NextResponse.json(
      { error: "name and email are required" },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();

  let dealerId: string | null = null;
  let dealerName: string | null = null;
  let dealerInquiryEmail: string | null = null;

  if (mode === "dealer") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    dealerId = (user?.user_metadata as any | undefined)?.dealer_id ?? null;

    if (!dealerId) {
      return NextResponse.json(
        { error: "Dealer not authenticated" },
        { status: 401 },
      );
    }

    const { data: dealer } = await supabase
      .from("dealers")
      .select("name, inquiry_email")
      .eq("id", dealerId)
      .maybeSingle();

    if (dealer) {
      dealerName = dealer.name as string;
      dealerInquiryEmail = (dealer.inquiry_email as string | null) ?? null;
    }
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, slug")
    .in("id", productIds);

  if (productsError || !products || products.length === 0) {
    return NextResponse.json(
      { error: "No products found for given IDs" },
      { status: 404 },
    );
  }

  const productSummaries = products.map((p) => ({
    id: p.id as string,
    name: p.name as string,
    slug: p.slug as string,
  }));

  await sendInquiryEmail({
    source: mode,
    dealerName,
    dealerInquiryEmail,
    products: productSummaries,
    form,
  });

  await supabase.from("inquiries").insert({
    source: mode,
    dealer_id: dealerId,
    product_ids: productIds,
    name: form.name,
    company: form.company ?? null,
    email: form.email,
    message: form.message ?? null,
    sent_to: dealerInquiryEmail,
  });

  return NextResponse.json({ ok: true });
}


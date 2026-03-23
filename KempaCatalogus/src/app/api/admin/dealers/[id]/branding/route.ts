import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type BrandingBody = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: dealerId } = await params;

  let body: BrandingBody;
  try {
    body = (await request.json()) as BrandingBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("dealers")
    .update({
      primary_color: body.primaryColor,
      secondary_color: body.secondaryColor,
      accent_color: body.accentColor,
      background_color: body.backgroundColor,
      text_color: body.textColor,
      font_heading: body.fontHeading,
      font_body: body.fontBody,
    })
    .eq("id", dealerId);

  if (error) {
    return NextResponse.json(
      { error: "Kon dealer-branding niet bijwerken." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}


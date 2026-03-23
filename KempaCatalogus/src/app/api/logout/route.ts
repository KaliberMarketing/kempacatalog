import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  const response = NextResponse.json({ ok: true });
  response.cookies.set("kempa_role", "", { maxAge: 0, path: "/" });
  response.cookies.set("kempa_dealer_id", "", { maxAge: 0, path: "/" });
  response.cookies.set("sales_auth", "", { maxAge: 0, path: "/" });

  return response;
}


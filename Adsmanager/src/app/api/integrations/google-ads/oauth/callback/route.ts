import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/actions/helpers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // MVP: organizationId

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/app/settings?google_ads=error_missing_code_state`);
  }

  // Auth check: ensures user cookies are present.
  await requireAuth();

  const clientSecret = process.env.GOOGLE_ADS_OAUTH_CLIENT_SECRET;
  const clientId = process.env.GOOGLE_ADS_OAUTH_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_ADS_OAUTH_REDIRECT_URI;

  if (!clientSecret || !clientId || !redirectUri) {
    return NextResponse.redirect(`${origin}/app/settings?google_ads=error_env`);
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/app/settings?google_ads=error_token_exchange`);
  }

  const tokenJson: any = await tokenRes.json();
  const refreshToken = tokenJson.refresh_token as string | undefined;
  const accessToken = tokenJson.access_token as string | undefined;
  const expiresIn = tokenJson.expires_in as number | undefined;
  const tokenExpiresAt =
    typeof expiresIn === "number" ? new Date(Date.now() + expiresIn * 1000) : null;

  if (!refreshToken || !accessToken) {
    return NextResponse.redirect(`${origin}/app/settings?google_ads=error_missing_refresh_or_access`);
  }

  const { supabase } = await requireAuth();

  // Check existing connection row and update/insert.
  const { data: existing } = await supabase
    .from("integration_connections")
    .select("id")
    .eq("organization_id", state)
    .eq("provider", "google_ads")
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("integration_connections")
      .update({
        status: "connected",
        google_access_token: accessToken,
        google_refresh_token: refreshToken,
        google_token_expires_at: tokenExpiresAt,
      })
      .eq("id", existing.id);
    if (error) {
      return NextResponse.redirect(`${origin}/app/settings?google_ads=error_updating_connection`);
    }
  } else {
    const { error } = await supabase.from("integration_connections").insert({
      organization_id: state,
      provider: "google_ads",
      status: "connected",
      google_access_token: accessToken,
      google_refresh_token: refreshToken,
      google_token_expires_at: tokenExpiresAt,
    });
    if (error) {
      return NextResponse.redirect(`${origin}/app/settings?google_ads=error_inserting_connection`);
    }
  }

  return NextResponse.redirect(`${origin}/app/settings?google_ads=connected`);
}


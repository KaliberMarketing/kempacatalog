import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/actions/helpers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.redirect(`${origin}/app/settings?google_ads=error_missing_org`);
  }

  // Ensure the user is authenticated (RLS will still enforce org permissions).
  await requireAuth();

  const clientId = process.env.GOOGLE_ADS_OAUTH_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_ADS_OAUTH_REDIRECT_URI ??
    `${origin}/api/integrations/google-ads/oauth/callback`;

  if (!clientId) {
    return NextResponse.redirect(`${origin}/app/settings?google_ads=error_env`);
  }

  const scopes =
    process.env.GOOGLE_ADS_OAUTH_SCOPES ??
    "https://www.googleapis.com/auth/adwords";

  // MVP: we only encode organizationId in state.
  const state = organizationId;

  const oauthUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    "?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      state,
    }).toString();

  return NextResponse.redirect(oauthUrl);
}


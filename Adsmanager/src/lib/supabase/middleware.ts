import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, Supabase client construction will throw.
  // In middleware, crashing results in a 500 for all protected routes.
  if (!supabaseUrl || !supabaseAnonKey) {
    const isAuthPage = request.nextUrl.pathname === "/login";
    const isProtected = request.nextUrl.pathname.startsWith("/app");

    if (!isAuthPage && isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        // Ensure cookie options are preserved.
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  let user: unknown = null;
  try {
    const {
      data: { user: maybeUser },
    } = await supabase.auth.getUser();
    user = maybeUser;
  } catch {
    // Treat failures as "not authenticated" and let the redirect logic below handle it.
    user = null;
  }

  const isAuthPage = request.nextUrl.pathname === "/login";
  const isProtected = request.nextUrl.pathname.startsWith("/app");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/app/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

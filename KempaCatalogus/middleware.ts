import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host") ?? "";
  const pathname = url.pathname;

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;

  // Extract subdomain (e.g. "dealer" from "dealer.kempacatalogus.be")
  let dealerSubdomain: string | null = null;
  if (
    appDomain &&
    host.endsWith(appDomain) &&
    host !== appDomain &&
    !host.startsWith("localhost")
  ) {
    dealerSubdomain = host.slice(0, -(appDomain.length + 1)); // strip ".appDomain"
  }

  // Role is set during login in a secure cookie
  const role = request.cookies.get("kempa_role")?.value;

  // Protect admin area: only admins
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Protect dealer portal: dealer or admin
  if (pathname.startsWith("/dealer")) {
    if (role !== "dealer" && role !== "admin") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Propagate dealer subdomain to the app via header if present
    if (dealerSubdomain) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-dealer-subdomain", dealerSubdomain);
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  // Protect sales catalogus with shared password (cookie-based)
  if (pathname.startsWith("/sales")) {
    // Allow access to the login page without cookie
    if (pathname.startsWith("/sales/login")) {
      return NextResponse.next({
        request: {
          headers: request.headers,
        },
      });
    }

    const salesAuth = request.cookies.get("sales_auth")?.value;
    if (salesAuth !== "true") {
      url.pathname = "/sales/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  // Default: let the request through
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};


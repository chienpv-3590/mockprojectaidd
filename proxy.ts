import { type NextRequest, NextResponse } from "next/server";
import { hasLocale } from "@/lib/i18n/config";
import { copyCookies, updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed the `middleware` file convention to `proxy`. This root
// proxy does two jobs on every (non-static) request:
//   1. i18n — mirror a `?lang=xx` query param into the NEXT_LOCALE cookie so the
//      root layout (which can't read searchParams) can set <html lang>.
//   2. auth gate — refresh the Supabase session and bounce logged-out users to
//      /login (and logged-in users away from /login).

const PUBLIC_PATHS = ["/login", "/auth"];
const LOCALE_COOKIE = "NEXT_LOCALE";
const ONE_YEAR = 60 * 60 * 24 * 365;

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Refresh the Supabase session (and capture refreshed cookies) on every request.
  const { response, user } = await updateSession(request);

  // i18n: persist a valid `?lang=xx` selection into the locale cookie so it
  // survives navigation and feeds the root layout's <html lang>.
  const langParam = searchParams.get("lang");
  if (
    langParam &&
    hasLocale(langParam) &&
    request.cookies.get(LOCALE_COOKIE)?.value !== langParam
  ) {
    response.cookies.set(LOCALE_COOKIE, langParam, { path: "/", maxAge: ONE_YEAR });
  }

  // Auth gate.
  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return copyCookies(NextResponse.redirect(url), response);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return copyCookies(NextResponse.redirect(url), response);
  }

  // Viewing your own profile via /sun-kudos/profile/{own-uuid} bounces to the
  // canonical /sun-kudos/profile route. Done here (instead of inside the page
  // via `redirect()`) because an in-page redirect throws before any children
  // render, leaving React 19's RSC dev perf tracker with childrenEndTime =
  // -Infinity and triggering "Failed to execute 'measure' on 'Performance':
  // '<ProfilePage>' cannot have a negative time stamp." (vercel/next.js#86060).
  if (user) {
    const profileMatch = pathname.match(/^\/sun-kudos\/profile\/([^/?#]+)\/?$/);
    if (profileMatch && profileMatch[1] === user.id) {
      const url = request.nextUrl.clone();
      url.pathname = "/sun-kudos/profile";
      url.search = "";
      return copyCookies(NextResponse.redirect(url), response);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except: API routes, the /auth OAuth callback, Next.js
    // internals, and any file with an extension (static assets in /public).
    "/((?!api|auth|_next/static|_next/image|.*\\.\\w+$).*)",
  ],
};

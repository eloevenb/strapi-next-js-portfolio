import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultSiteLocale, getLocales } from "./src/api/locales";
import { isKnownLocale, localeCookie, type SiteLocale } from "./src/i18n/locales";

function preferredLocale(request: NextRequest, available: SiteLocale[]): string {
  const fallback = defaultSiteLocale(available);
  const cookie = request.cookies.get(localeCookie)?.value;
  if (isKnownLocale(cookie, available)) return cookie;

  const header = request.headers.get("accept-language");
  if (!header) return fallback;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const quality = params.find((param) => param.trim().startsWith("q="));
      const q = quality ? Number(quality.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((item) => item.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const exact = available.find((locale) => locale.code.toLowerCase() === tag);
    if (exact) return exact.code;
    const primary = tag.split("-")[0];
    const byLanguage = available.find((locale) => locale.code.toLowerCase() === primary);
    if (byLanguage) return byLanguage.code;
  }

  return fallback;
}

export async function proxy(request: NextRequest) {
  const available = await getLocales();
  const { pathname } = request.nextUrl;
  const first = pathname.split("/").filter(Boolean)[0];

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (isKnownLocale(first, available)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const locale = preferredLocale(request, available);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};

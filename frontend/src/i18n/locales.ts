/** Locale code configured in Strapi, such as `en` or `fr`. */
export type Locale = string;

export type SiteLocale = {
  code: Locale;
  name: string;
  isDefault: boolean;
};

/** Used when Strapi does not flag a default, and for UI copy that has no translation yet. */
export const defaultLocale: Locale = "en";

export const localeCookie = "NEXT_LOCALE";

/** BCP 47 tags used for `lang`, dates, and hreflang. Unknown codes are used as-is. */
const htmlLanguageOverrides: Record<string, string> = {
  en: "en-US",
};

export function htmlLanguage(locale: Locale): string {
  return htmlLanguageOverrides[locale] ?? locale;
}

export function isKnownLocale(value: string | undefined | null, locales: readonly SiteLocale[]): value is Locale {
  return typeof value === "string" && locales.some((locale) => locale.code === value);
}

export function localePath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function stripLocale(pathname: string, codes: readonly string[]): string {
  const segments = pathname.split("/");
  if (!codes.includes(segments[1] ?? "")) return pathname || "/";
  const rest = segments.slice(2).join("/");
  return rest ? `/${rest}` : "/";
}

export function replaceLocale(pathname: string, locale: Locale, codes: readonly string[]): string {
  const segments = pathname.split("/");
  if (codes.includes(segments[1] ?? "")) {
    segments[1] = locale;
    return segments.join("/") || `/${locale}`;
  }
  return localePath(locale, pathname);
}

export function withLocale(path: string, locale: Locale): string {
  const join = path.includes("?") ? "&" : "?";
  return `${path}${join}locale=${encodeURIComponent(locale)}`;
}

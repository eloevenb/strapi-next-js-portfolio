import "server-only";

import { strapiFetch, type StrapiFetchOptions } from "./strapi";
import { defaultLocale, type SiteLocale } from "../i18n/locales";

const CACHE_TTL_MS = 60_000;

let cache: { expires: number; locales: SiteLocale[] } | null = null;

function bypassCache(options?: StrapiFetchOptions): boolean {
  return options?.cache === "no-store" || options?.cache === "no-cache" || options?.next?.revalidate === 0;
}

function parseLocales(payload: unknown): SiteLocale[] {
  const rows = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)
      ? (payload as { data: unknown[] }).data
      : [];

  const locales: SiteLocale[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const { code, name, isDefault } = row as { code?: unknown; name?: unknown; isDefault?: unknown };
    if (typeof code !== "string" || code.length === 0) continue;
    locales.push({
      code,
      name: typeof name === "string" && name.trim() ? name.trim() : code,
      isDefault: isDefault === true,
    });
  }

  if (locales.length > 0 && !locales.some((locale) => locale.isDefault)) {
    locales[0] = { ...locales[0], isDefault: true };
  }

  const defaultIndex = locales.findIndex((locale) => locale.isDefault);
  if (defaultIndex > 0) {
    const [fallback] = locales.splice(defaultIndex, 1);
    locales.unshift(fallback);
  }

  return locales;
}

/** Locales configured in Strapi's Internationalization settings. */
export async function getLocales(options?: StrapiFetchOptions): Promise<SiteLocale[]> {
  if (!bypassCache(options) && cache && cache.expires > Date.now()) {
    return cache.locales;
  }

  const payload = await strapiFetch<unknown>("/i18n/locales", {
    ...options,
    next: bypassCache(options)
      ? { revalidate: 0, ...(options?.next ?? {}) }
      : { tags: ["locales"], revalidate: 60, ...(options?.next ?? {}) },
  });
  const locales = parseLocales(payload);
  if (locales.length === 0) {
    throw new Error("Strapi returned no locales");
  }

  cache = { expires: Date.now() + CACHE_TTL_MS, locales };
  return locales;
}

export function defaultSiteLocale(locales: readonly SiteLocale[]): string {
  return locales.find((locale) => locale.isDefault)?.code ?? locales[0]?.code ?? defaultLocale;
}

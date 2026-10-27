import "server-only";

import { withLocale, type Locale } from "../i18n/locales";
import { defaultSiteLocale, getLocales } from "./locales";
import { strapiFetch, strapiFetchAll, type StrapiFetchOptions } from "./strapi";

function isMissingLocale(error: unknown): boolean {
  return error instanceof Error && error.message.includes("failed with 404");
}

/**
 * Load a localized Strapi entry. A locale Strapi has not created yet responds
 * with 404, and then the default locale is used. An empty collection stays
 * empty so a translated locale does not inherit another language's entries.
 */
export async function strapiFetchLocalized<T>(
  path: string,
  locale: Locale,
  options?: StrapiFetchOptions,
): Promise<T> {
  const fallback = defaultSiteLocale(await getLocales());
  if (locale === fallback) {
    return strapiFetch<T>(withLocale(path, locale), options);
  }

  try {
    return await strapiFetch<T>(withLocale(path, locale), options);
  } catch (error) {
    if (!isMissingLocale(error)) throw error;
  }

  return strapiFetch<T>(withLocale(path, fallback), options);
}

/** Every page of a localized collection. Empty locales are not replaced. */
export function strapiFetchAllLocalized<T>(
  path: string,
  locale: Locale,
  options?: StrapiFetchOptions,
): Promise<T[]> {
  return strapiFetchAll<T>(withLocale(path, locale), options);
}

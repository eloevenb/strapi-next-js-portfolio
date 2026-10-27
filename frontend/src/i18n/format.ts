import { htmlLanguage, type Locale } from "./locales";

/** Format a Strapi date in the active locale. UTC keeps date-only values stable across server and browser. */
export function formatDate(value: string, locale: Locale, options?: { day?: boolean }): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const includeDay = options?.day !== false;
  return new Intl.DateTimeFormat(htmlLanguage(locale), {
    year: "numeric",
    month: "long",
    ...(includeDay ? { day: "numeric" } : {}),
    timeZone: "UTC",
  }).format(date);
}

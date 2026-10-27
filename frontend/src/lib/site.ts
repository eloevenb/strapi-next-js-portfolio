import type { Metadata } from "next";
import { defaultSiteLocale, getLocales } from "../api/locales";
import { htmlLanguage, localePath, type Locale } from "../i18n/locales";

const DEFAULT_SITE_URL = "http://localhost:3000";

/** Public origin baked in from SITE_URL at build time. */
export function getSiteUrl(): URL {
  const configured = process.env.SITE_URL?.trim();
  if (!configured) return new URL(DEFAULT_SITE_URL);
  return new URL(configured);
}

export function absoluteUrl(path: string): string {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, getSiteUrl());
  url.pathname = url.pathname.replace(/\/$/, "") || "/";
  return url.pathname === "/" ? url.origin : url.toString();
}

export function projectPath(locale: Locale, projectSlug: string): string {
  return localePath(locale, `/projects/${encodeURIComponent(projectSlug)}`);
}

export function publicationPath(locale: Locale, projectSlug: string, publicationSlug: string): string {
  return localePath(
    locale,
    `/projects/${encodeURIComponent(projectSlug)}/${encodeURIComponent(publicationSlug)}`,
  );
}

export async function pageAlternates(locale: Locale, path: string): Promise<Metadata["alternates"]> {
  const available = await getLocales();
  const languages: Record<string, string> = {
    "x-default": absoluteUrl(localePath(defaultSiteLocale(available), path)),
  };
  for (const { code } of available) {
    languages[htmlLanguage(code)] = absoluteUrl(localePath(code, path));
  }
  return {
    canonical: absoluteUrl(localePath(locale, path)),
    languages,
  };
}

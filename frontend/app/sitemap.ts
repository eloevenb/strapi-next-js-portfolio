import type { MetadataRoute } from "next";
import { getPageSitemapEntries, notFoundPageSlug, pagePath, projectsPageSlug } from "@/api/pages";
import { getProjectSitemapEntries } from "@/api/projects";
import { getPublicationSitemapEntries } from "@/api/publications";
import { getLocales } from "@/api/locales";
import { htmlLanguage, localePath, type Locale } from "@/i18n/locales";
import { absoluteUrl } from "@/lib/site";

function lastModified(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function languages(path: string, codes: readonly Locale[]): Record<string, string> {
  const alternate: Record<string, string> = {};
  for (const locale of codes) {
    alternate[htmlLanguage(locale)] = absoluteUrl(localePath(locale, path));
  }
  return alternate;
}

function localizedEntry(
  locale: Locale,
  codes: readonly Locale[],
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
  modified?: string,
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(localePath(locale, path)),
    lastModified: lastModified(modified),
    changeFrequency,
    priority,
    alternates: { languages: languages(path, codes) },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const available = await getLocales();
  const codes = available.map((locale) => locale.code);
  const entries: MetadataRoute.Sitemap = [];

  try {
    for (const locale of codes) {
      const [pages, projects, publications] = await Promise.all([
        getPageSitemapEntries(locale),
        getProjectSitemapEntries(locale),
        getPublicationSitemapEntries(locale),
      ]);

      for (const page of pages) {
        if (!page.slug || page.slug === notFoundPageSlug) continue;
        const path = pagePath({ isHome: page.isHome === true, slug: page.slug });
        const listing = page.slug === projectsPageSlug;
        entries.push(
          localizedEntry(
            locale,
            codes,
            path,
            page.isHome || listing ? "weekly" : "yearly",
            page.isHome ? 1 : listing ? 0.9 : 0.5,
            page.updatedAt,
          ),
        );
      }

      for (const project of projects) {
        if (!project.slug) continue;
        entries.push(
          localizedEntry(
            locale,
            codes,
            `/projects/${encodeURIComponent(project.slug)}`,
            "monthly",
            0.8,
            project.updatedAt,
          ),
        );
      }

      for (const publication of publications) {
        const projectSlug = publication.project?.slug;
        if (!publication.slug || !projectSlug) continue;
        entries.push(
          localizedEntry(
            locale,
            codes,
            `/projects/${encodeURIComponent(projectSlug)}/${encodeURIComponent(publication.slug)}`,
            "monthly",
            0.7,
            publication.updatedAt,
          ),
        );
      }
    }
  } catch (error) {
    console.error("[sitemap] Failed to load Strapi content:", error);
  }

  return entries;
}

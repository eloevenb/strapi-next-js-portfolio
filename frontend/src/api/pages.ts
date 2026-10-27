import "server-only";

import { defaultLocale, type Locale } from "../i18n/locales";
import type { PageBlock } from "./page-blocks";
import { strapiFetchAllLocalized, strapiFetchLocalized } from "./localized";
import {
  strapiFetchAll,
  type StrapiEntity,
  type StrapiFetchOptions,
  type StrapiResponse,
} from "./strapi";

export { pagePath, projectsPageSlug } from "./page-blocks";

/** Slug of the page rendered for unknown URLs. */
export const notFoundPageSlug = "404";

export type CmsPage = StrapiEntity<{
  title: string;
  slug: string;
  isHome: boolean;
  content: PageBlock[];
  updatedAt?: string;
}>;

export type PageSitemapEntry = {
  slug: string;
  isHome?: boolean;
  updatedAt?: string;
};

const pagePopulate = [
  "populate[content][on][text.paragraph]=true",
  "populate[content][on][layout.vertical-spacing]=true",
  "populate[content][on][image.image][populate][image][fields][0]=url",
  "populate[content][on][image.image][populate][image][fields][1]=formats",
  "populate[content][on][image.image][populate][image][fields][2]=alternativeText",
  "populate[content][on][image.image][populate][image][fields][3]=caption",
  "populate[content][on][image.image][populate][image][fields][4]=width",
  "populate[content][on][image.image][populate][image][fields][5]=height",
  "populate[content][on][text.code-snippet]=true",
  "populate[content][on][page.home][fields][0]=eyebrow",
  "populate[content][on][page.home][fields][1]=title",
  "populate[content][on][page.home][fields][2]=intro",
  "populate[content][on][page.home][fields][3]=viewProjects",
  "populate[content][on][page.home][fields][4]=contact",
  "populate[content][on][page.home][fields][5]=findMe",
  "populate[content][on][page.home][populate][projectsPage][fields][0]=slug",
  "populate[content][on][page.home][populate][projectsPage][fields][1]=isHome",
  "populate[content][on][page.home][populate][projectsPage][fields][2]=title",
  "populate[content][on][page.home][populate][contactPage][fields][0]=slug",
  "populate[content][on][page.home][populate][contactPage][fields][1]=isHome",
  "populate[content][on][page.home][populate][contactPage][fields][2]=title",
  "populate[content][on][page.contact][fields][0]=eyebrow",
  "populate[content][on][page.contact][fields][1]=title",
  "populate[content][on][page.contact][fields][2]=intro",
  "populate[content][on][page.projects][fields][0]=title",
  "populate[content][on][page.projects][fields][1]=intro",
].join("&");

export function getPages(locale: Locale = defaultLocale, options?: StrapiFetchOptions) {
  return strapiFetchAllLocalized<CmsPage>(`/pages?${pagePopulate}&sort=title:asc`, locale, {
    ...options,
    next: { tags: ["pages"], ...(options?.next ?? {}) },
  });
}

export async function getHomePage(locale: Locale = defaultLocale, options?: StrapiFetchOptions) {
  const response = await strapiFetchLocalized<StrapiResponse<CmsPage[]>>(
    `/pages?filters[isHome][$eq]=true&${pagePopulate}`,
    locale,
    {
      ...options,
      next: { tags: ["pages", "page:home"], ...(options?.next ?? {}) },
    },
  );
  return response.data?.[0] ?? null;
}

export async function getPageBySlug(
  slug: string,
  locale: Locale = defaultLocale,
  options?: StrapiFetchOptions,
) {
  const response = await strapiFetchLocalized<StrapiResponse<CmsPage[]>>(
    `/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&${pagePopulate}`,
    locale,
    {
      ...options,
      next: { tags: ["pages", `page:${slug}`], ...(options?.next ?? {}) },
    },
  );
  return response.data?.[0] ?? null;
}

export function getPageSitemapEntries(locale: Locale = defaultLocale, options?: StrapiFetchOptions) {
  return strapiFetchAll<PageSitemapEntry>(
    `/pages?locale=${encodeURIComponent(locale)}&fields[0]=slug&fields[1]=isHome&fields[2]=updatedAt`,
    {
      ...options,
      next: { tags: ["pages"], ...(options?.next ?? {}) },
    },
  );
}

import "server-only";

import { defaultLocale, type Locale } from "../i18n/locales";
import { strapiFetchAllLocalized, strapiFetchLocalized } from "./localized";
import type { Publication } from "./publication-model";
import { strapiFetchAll, type StrapiFetchOptions, type StrapiResponse } from "./strapi";

export type {
  CodeSnippetComponent,
  ContentComponent,
  ImageComponent,
  ParagraphComponent,
  Publication,
  TableOfContentItemComponent,
  TableOfContents,
  VerticalSpacingComponent,
} from "./publication-model";
export { isCodeSnippet, isImage, isParagraph, isVerticalSpacing } from "./publication-model";

const publicationPopulate = [
  "populate[project][fields][0]=title",
  "populate[project][fields][1]=slug",
  "populate[content][on][text.paragraph]=true",
  "populate[content][on][layout.vertical-spacing]=true",
  "populate[content][on][image.image][populate][image][fields][0]=url",
  "populate[content][on][image.image][populate][image][fields][1]=formats",
  "populate[content][on][image.image][populate][image][fields][2]=alternativeText",
  "populate[content][on][image.image][populate][image][fields][3]=caption",
  "populate[content][on][image.image][populate][image][fields][4]=width",
  "populate[content][on][image.image][populate][image][fields][5]=height",
  "populate[content][on][text.code-snippet]=true",
  "populate[tableOfContents][populate][items][fields][0]=title",
  "populate[tableOfContents][populate][items][fields][1]=anchor",
  "populate[tableOfContents][populate][items][fields][2]=level",
  "sort=page:asc",
].join("&");

export type PublicationSitemapEntry = {
  slug: string;
  updatedAt?: string;
  project?: { slug?: string | null } | null;
};

export function getPublicationSitemapEntries(locale: Locale = defaultLocale, options?: StrapiFetchOptions) {
  return strapiFetchAll<PublicationSitemapEntry>(
    `/publications?locale=${encodeURIComponent(locale)}&fields[0]=slug&fields[1]=updatedAt&populate[project][fields][0]=slug`,
    {
      ...options,
      next: { tags: ["publications", "projects"], ...(options?.next ?? {}) },
    },
  );
}

async function allPublications(path: string, locale: Locale, options: StrapiFetchOptions | undefined, tags: string[]) {
  const data = await strapiFetchAllLocalized<Publication>(path, locale, {
    ...options,
    next: { tags, ...(options?.next ?? {}) },
  });
  return { data, meta: {} };
}

export function getPublications(locale: Locale = defaultLocale, options?: StrapiFetchOptions) {
  return allPublications(`/publications?${publicationPopulate}`, locale, options, ["publications"]);
}

export function getPublicationsByProject(
  documentId: string,
  locale: Locale = defaultLocale,
  options?: StrapiFetchOptions,
) {
  return allPublications(
    `/publications?filters[project][documentId][$eq]=${encodeURIComponent(documentId)}&${publicationPopulate}`,
    locale,
    options,
    ["publications", `project:${documentId}:publications`],
  );
}

export function getPublicationBySlug(slug: string, locale: Locale = defaultLocale, options?: StrapiFetchOptions) {
  return strapiFetchLocalized<StrapiResponse<Publication[]>>(
    `/publications?filters[slug][$eq]=${encodeURIComponent(slug)}&${publicationPopulate}`,
    locale,
    {
      ...options,
      next: { tags: ["publications", `publication:${slug}`], ...(options?.next ?? {}) },
    },
  );
}

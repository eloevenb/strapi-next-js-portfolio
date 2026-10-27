import "server-only";

import { defaultLocale, type Locale } from "../i18n/locales";
import { strapiFetchAllLocalized, strapiFetchLocalized } from "./localized";
import type { Project } from "./project-model";
import { strapiFetchAll, type StrapiFetchOptions, type StrapiResponse } from "./strapi";

export type { Author, Project, Tag } from "./project-model";
export { formatAuthorNames } from "./project-model";

const projectPopulate = [
  "populate[cover][fields][0]=url",
  "populate[cover][fields][1]=formats",
  "populate[cover][fields][2]=alternativeText",
  "populate[cover][fields][3]=width",
  "populate[cover][fields][4]=height",
  "populate[banner][fields][0]=url",
  "populate[banner][fields][1]=formats",
  "populate[banner][fields][2]=alternativeText",
  "populate[banner][fields][3]=width",
  "populate[banner][fields][4]=height",
  "populate[tags][fields][0]=name",
  "populate[tags][fields][1]=documentId",
  "populate[authors][fields][0]=username",
  "populate[authors][fields][1]=documentId",
  "populate[publications][fields][0]=title",
  "populate[publications][fields][1]=page",
  "populate[publications][fields][2]=documentId",
  "sort=creationDate:desc",
].join("&");

export async function getProjects(locale: Locale = defaultLocale, options?: StrapiFetchOptions) {
  const data = await strapiFetchAllLocalized<Project>(`/projects?${projectPopulate}`, locale, {
    ...options,
    next: { tags: ["projects"], ...(options?.next ?? {}) },
  });
  return { data, meta: {} };
}

export type ProjectSitemapEntry = {
  slug: string;
  updatedAt?: string;
};

export function getProjectSitemapEntries(locale: Locale = defaultLocale, options?: StrapiFetchOptions) {
  return strapiFetchAll<ProjectSitemapEntry>(
    `/projects?locale=${encodeURIComponent(locale)}&fields[0]=slug&fields[1]=updatedAt`,
    {
      ...options,
      next: { tags: ["projects"], ...(options?.next ?? {}) },
    },
  );
}

export function getProjectBySlug(slug: string, locale: Locale = defaultLocale, options?: StrapiFetchOptions) {
  return strapiFetchLocalized<StrapiResponse<Project[]>>(
    `/projects?filters[slug][$eq]=${encodeURIComponent(slug)}&${projectPopulate}`,
    locale,
    {
      ...options,
      next: { tags: ["projects", `project:${slug}`], ...(options?.next ?? {}) },
    },
  );
}

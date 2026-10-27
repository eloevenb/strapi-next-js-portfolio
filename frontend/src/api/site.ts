import "server-only";

import { defaultLocale, type Locale } from "../i18n/locales";
import { strapiFetchLocalized } from "./localized";
import type { Site, SiteCopy } from "./site-copy";
import { type StrapiFetchOptions, type StrapiResponse } from "./strapi";

export type { Site, SiteCopy, SiteFooter, SiteIdentity, SiteInterface } from "./site-copy";

const sitePopulate = ["populate[identity]=true", "populate[footer]=true", "populate[interface]=true"].join("&");

export function toCopy(site: Site): SiteCopy {
  const ui = site.interface;
  return {
    meta: {
      siteName: site.identity.siteName,
      description: site.identity.description,
    },
    nav: { menu: ui.openMenu, language: ui.language },
    projects: {
      empty: ui.projectsEmpty,
      noMatch: ui.projectsNoMatch,
      allCategories: ui.projectsAllCategories,
      project: ui.projectsProject,
      fallbackTitle: ui.projectsFallbackTitle,
      publicationCountOne: ui.publicationCountOne,
      publicationCountMany: ui.publicationCountMany,
      pageLabel: ui.pageLabel,
    },
    detail: {
      noPublications: ui.noPublications,
      tableOfContents: ui.tableOfContents,
      contents: ui.contents,
    },
    code: { copied: ui.codeCopied, copy: ui.codeCopy },
    theme: {
      switch: ui.themeSwitch,
      system: ui.themeSystem,
      light: ui.themeLight,
      dark: ui.themeDark,
    },
    media: {
      open: ui.imageOpen || "Open image: {alt}",
      previous: ui.imagePrevious || "Previous image",
      next: ui.imageNext || "Next image",
      zoomIn: ui.imageZoomIn || "Zoom in",
      zoomOut: ui.imageZoomOut || "Zoom out",
      close: ui.imageClose || "Close",
    },
    footer: {
      pages: site.footer.pages,
      privacy: site.footer.privacy,
      terms: site.footer.terms,
      copyright: site.footer.copyright,
    },
  };
}

export function getSite(locale: Locale = defaultLocale, options?: StrapiFetchOptions) {
  return strapiFetchLocalized<StrapiResponse<Site>>(`/site?${sitePopulate}`, locale, {
    ...options,
    next: { tags: ["site"], ...(options?.next ?? {}) },
  });
}

export async function getSiteCopy(locale: Locale = defaultLocale, options?: StrapiFetchOptions) {
  const site = (await getSite(locale, options)).data;
  if (!site?.identity || !site.footer || !site.interface) {
    throw new Error("Strapi site content is unavailable");
  }
  return toCopy(site);
}

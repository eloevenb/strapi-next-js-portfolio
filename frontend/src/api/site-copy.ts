import type { StrapiEntity } from "./strapi-media";

export type SiteIdentity = {
  id: number;
  siteName: string;
  description: string;
};

export type SiteFooter = {
  id: number;
  pages: string;
  privacy: string;
  terms: string;
  copyright: string;
};

export type SiteInterface = {
  id: number;
  openMenu: string;
  language: string;
  projectsEmpty: string;
  projectsNoMatch: string;
  projectsAllCategories: string;
  projectsProject: string;
  projectsFallbackTitle: string;
  publicationCountOne: string;
  publicationCountMany: string;
  pageLabel: string;
  noPublications: string;
  tableOfContents: string;
  contents: string;
  codeCopied: string;
  codeCopy: string;
  themeSwitch: string;
  themeSystem: string;
  themeLight: string;
  themeDark: string;
  imageOpen?: string;
  imagePrevious?: string;
  imageNext?: string;
  imageZoomIn?: string;
  imageZoomOut?: string;
  imageClose?: string;
};

export type Site = StrapiEntity<{
  identity: SiteIdentity;
  footer: SiteFooter;
  interface: SiteInterface;
}>;

/** Interface copy loaded from Strapi. Count and page labels may contain `{count}` and `{page}`. The image open label may contain `{alt}`. */
export type SiteCopy = {
  meta: { siteName: string; description: string };
  nav: { menu: string; language: string };
  projects: {
    empty: string;
    noMatch: string;
    allCategories: string;
    project: string;
    fallbackTitle: string;
    publicationCountOne: string;
    publicationCountMany: string;
    pageLabel: string;
  };
  detail: { noPublications: string; tableOfContents: string; contents: string };
  code: { copied: string; copy: string };
  theme: { switch: string; system: string; light: string; dark: string };
  media: {
    open: string;
    previous: string;
    next: string;
    zoomIn: string;
    zoomOut: string;
    close: string;
  };
  footer: { pages: string; privacy: string; terms: string; copyright: string };
};

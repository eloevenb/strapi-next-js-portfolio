import type { ContentComponent } from "./publication-model";

/** Slug of the Strapi page that renders the project listing. Detail URLs stay under this path. */
export const projectsPageSlug = "projects";

export const contactPageSlug = "contact";

export type LinkedPage = {
  id?: number;
  documentId?: string;
  title?: string;
  slug?: string;
  isHome?: boolean | null;
};

export type HomeBlock = {
  __component: "page.home";
  id: number;
  eyebrow?: string;
  title?: string;
  intro?: string;
  viewProjects?: string;
  contact?: string;
  findMe?: string;
  projectsPage?: LinkedPage | null;
  contactPage?: LinkedPage | null;
};

export type ContactBlock = {
  __component: "page.contact";
  id: number;
  eyebrow?: string;
  title?: string;
  intro?: string;
};

export type ProjectsBlock = {
  __component: "page.projects";
  id: number;
  title?: string;
  intro?: string;
};

export type PageBlock = ContentComponent | HomeBlock | ContactBlock | ProjectsBlock;

/** Public path of a page. The home page is the locale root. */
export function pagePath(page: { isHome?: boolean | null; slug: string }): string {
  return page.isHome ? "/" : `/${encodeURIComponent(page.slug)}`;
}

export function isHomeBlock(component: { __component: string }): component is HomeBlock {
  return component.__component === "page.home";
}

export function isContactBlock(component: { __component: string }): component is ContactBlock {
  return component.__component === "page.contact";
}

export function isProjectsBlock(component: { __component: string }): component is ProjectsBlock {
  return component.__component === "page.projects";
}

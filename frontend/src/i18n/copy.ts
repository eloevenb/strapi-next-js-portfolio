import type { SiteCopy } from "../api/site-copy";

export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function publicationCountLabel(projects: SiteCopy["projects"], count: number): string {
  const template = count === 1 ? projects.publicationCountOne : projects.publicationCountMany;
  return fillTemplate(template, { count });
}

export function publicationPageLabel(projects: SiteCopy["projects"], page: number): string {
  return fillTemplate(projects.pageLabel, { page });
}

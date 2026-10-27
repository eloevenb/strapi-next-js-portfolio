import "server-only";

import { getProjectBySlug } from "../api/projects";
import { getPublicationsByProject } from "../api/publications";
import type { Project } from "../api/project-model";
import type { Publication } from "../api/publication-model";
import { highlightPublication } from "../components/publication/highlightCode";
import type { Locale } from "../i18n/locales";

export type ProjectPageData = {
  project: Project;
  publications: Publication[];
  selectedPublication?: Publication;
};

export function projectCanonicalPath(projectSlug: string, publicationSlug?: string): string {
  const projectPath = `/projects/${encodeURIComponent(projectSlug)}`;
  if (!publicationSlug) return projectPath;
  return `${projectPath}/${encodeURIComponent(publicationSlug)}`;
}

/** Project plus its publications. Without a publication slug, the first page is selected. */
export async function loadProjectPage(
  locale: Locale,
  projectSlug: string,
  publicationSlug?: string,
): Promise<ProjectPageData | null> {
  const project = (await getProjectBySlug(projectSlug, locale)).data[0];
  if (!project) return null;

  const publications = (await getPublicationsByProject(project.documentId ?? `${project.id}`, locale)).data
    .slice()
    .sort((a, b) => a.page - b.page)
    .map(highlightPublication);

  if (publicationSlug) {
    return {
      project,
      publications,
      selectedPublication: publications.find((entry) => entry.slug === publicationSlug),
    };
  }

  return { project, publications, selectedPublication: publications[0] };
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { defaultSiteLocale, getLocales } from "@/api/locales";
import { getProjects } from "@/api/projects";
import { getPublicationsByProject } from "@/api/publications";
import ProjectDetail from "@/components/projects/ProjectDetail";
import { getSiteCopy } from "@/api/site";
import { assertLocale } from "@/i18n/assertLocale";
import { loadProjectPage, projectCanonicalPath } from "@/lib/load-project";
import { pageAlternates } from "@/lib/site";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const locale = defaultSiteLocale(await getLocales());
    const projects = (await getProjects(locale)).data;
    const params: { projectSlug: string; publicationSlug: string }[] = [];

    for (const project of projects) {
      const projectId = project.documentId ?? `${project.id}`;
      const publications = (await getPublicationsByProject(projectId, locale)).data;
      for (const publication of publications) {
        if (project.slug && publication.slug) {
          params.push({ projectSlug: project.slug, publicationSlug: publication.slug });
        }
      }
    }

    return params;
  } catch (error) {
    console.error("[generateStaticParams] Failed to build publication paths:", error);
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; projectSlug: string; publicationSlug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, projectSlug, publicationSlug } = await params;
  const locale = await assertLocale(localeParam);
  const copy = await getSiteCopy(locale);
  const loaded = await loadProjectPage(locale, projectSlug, publicationSlug);
  const project = loaded?.project;
  const publication = loaded?.selectedPublication;

  return {
    title: publication && project
      ? `${publication.title} - ${project.title}`
      : project?.title ?? copy.projects.fallbackTitle,
    alternates: await pageAlternates(
      locale,
      projectCanonicalPath(project?.slug ?? projectSlug, publication?.slug ?? publicationSlug),
    ),
  };
}

export default async function PublicationPage({
  params,
}: {
  params: Promise<{ locale: string; projectSlug: string; publicationSlug: string }>;
}) {
  const { locale: localeParam, projectSlug, publicationSlug } = await params;
  const locale = await assertLocale(localeParam);
  const loaded = await loadProjectPage(locale, projectSlug, publicationSlug);

  if (!loaded?.selectedPublication) {
    notFound();
  }

  return (
    <ProjectDetail
      project={loaded.project}
      publications={loaded.publications}
      selectedPublication={loaded.selectedPublication}
    />
  );
}

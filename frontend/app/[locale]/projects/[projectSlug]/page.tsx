import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { defaultSiteLocale, getLocales } from "@/api/locales";
import { getProjects } from "@/api/projects";
import ProjectDetail from "@/components/projects/ProjectDetail";
import { getSiteCopy } from "@/api/site";
import { assertLocale } from "@/i18n/assertLocale";
import { loadProjectPage, projectCanonicalPath } from "@/lib/load-project";
import { pageAlternates } from "@/lib/site";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const projects = (await getProjects(defaultSiteLocale(await getLocales()))).data;
    return projects.filter((project) => project.slug).map((project) => ({ projectSlug: project.slug }));
  } catch (error) {
    console.error("[generateStaticParams] Failed to build project paths:", error);
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; projectSlug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, projectSlug } = await params;
  const locale = await assertLocale(localeParam);
  const copy = await getSiteCopy(locale);
  const loaded = await loadProjectPage(locale, projectSlug);
  return {
    title: loaded?.project.title ?? copy.projects.fallbackTitle,
    alternates: await pageAlternates(
      locale,
      projectCanonicalPath(loaded?.project.slug ?? projectSlug, loaded?.selectedPublication?.slug),
    ),
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; projectSlug: string }>;
}) {
  const { locale: localeParam, projectSlug } = await params;
  const locale = await assertLocale(localeParam);
  const loaded = await loadProjectPage(locale, projectSlug);

  if (!loaded) {
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

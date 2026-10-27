import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug, pagePath, projectsPageSlug } from "@/api/pages";
import { PageBody } from "@/components/pages/PageBody";
import { assertLocale } from "@/i18n/assertLocale";
import { pageAlternates } from "@/lib/site";

export const revalidate = 60;

// Project detail URLs live at /projects/[projectSlug], so this static route
// renders the Strapi page whose slug is "projects".
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await assertLocale((await params).locale);
  const page = await getPageBySlug(projectsPageSlug, locale);
  return {
    title: page?.title,
    alternates: await pageAlternates(locale, page ? pagePath(page) : `/${projectsPageSlug}`),
  };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await assertLocale((await params).locale);
  const page = await getPageBySlug(projectsPageSlug, locale);
  if (!page) notFound();

  return <PageBody content={page.content} locale={locale} />;
}

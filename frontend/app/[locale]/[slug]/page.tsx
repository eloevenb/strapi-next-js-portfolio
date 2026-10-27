import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPages, getPageBySlug, notFoundPageSlug, pagePath, projectsPageSlug } from "@/api/pages";
import { PageBody } from "@/components/pages/PageBody";
import { defaultSiteLocale, getLocales } from "@/api/locales";
import { assertLocale } from "@/i18n/assertLocale";
import { localePath } from "@/i18n/locales";
import { pageAlternates } from "@/lib/site";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const pages = await getPages(defaultSiteLocale(await getLocales()));
    return pages
      .filter(
        (page) =>
          page.slug && !page.isHome && page.slug !== projectsPageSlug && page.slug !== notFoundPageSlug,
      )
      .map((page) => ({ slug: page.slug }));
  } catch (error) {
    console.error("[generateStaticParams] Failed to build page paths:", error);
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = await assertLocale(localeParam);
  if (slug === notFoundPageSlug) notFound();
  const page = await getPageBySlug(slug, locale);
  return {
    title: page?.title,
    alternates: await pageAlternates(locale, page ? pagePath(page) : `/${slug}`),
  };
}

export default async function CmsPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = await assertLocale(localeParam);
  if (slug === notFoundPageSlug) notFound();
  const page = await getPageBySlug(slug, locale);
  if (!page) notFound();
  if (page.isHome) redirect(localePath(locale, "/"));

  return <PageBody content={page.content} locale={locale} />;
}

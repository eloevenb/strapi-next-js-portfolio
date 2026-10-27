import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHomePage } from "@/api/pages";
import { PageBody } from "@/components/pages/PageBody";
import { assertLocale } from "@/i18n/assertLocale";
import { pageAlternates } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await assertLocale((await params).locale);
  const page = await getHomePage(locale);
  return {
    title: page?.title,
    alternates: await pageAlternates(locale, "/"),
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await assertLocale((await params).locale);
  const page = await getHomePage(locale);
  if (!page) notFound();

  return <PageBody content={page.content} locale={locale} />;
}

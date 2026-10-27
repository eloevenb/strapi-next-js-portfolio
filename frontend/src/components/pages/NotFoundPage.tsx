import { headers } from "next/headers";
import { getPageBySlug, notFoundPageSlug } from "../../api/pages";
import { defaultLocale } from "../../i18n/locales";
import { PageBody } from "./PageBody";

function localeFromPath(pathname: string): string {
  const [locale] = pathname.split("/").filter(Boolean);
  return locale || defaultLocale;
}

export async function NotFoundPage() {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? headerList.get("next-url") ?? "";
  const locale = localeFromPath(pathname);
  const page = await getPageBySlug(notFoundPageSlug, locale).catch(() => null);
  if (!page?.content?.length) return null;

  return <PageBody content={page.content} locale={locale} />;
}

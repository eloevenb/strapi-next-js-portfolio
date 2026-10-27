import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPageBySlug, notFoundPageSlug } from "@/api/pages";
import { defaultLocale } from "@/i18n/locales";
import { NotFoundPage } from "@/components/pages/NotFoundPage";

function localeFromPath(pathname: string): string {
  const [locale] = pathname.split("/").filter(Boolean);
  return locale || defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const page = await getPageBySlug(notFoundPageSlug, localeFromPath(pathname)).catch(() => null);
  return { title: page?.title };
}

export default NotFoundPage;

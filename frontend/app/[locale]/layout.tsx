import type { Metadata } from "next";
import type { ReactNode } from "react";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import ThemeRegistry from "@/shared-theme/ThemeRegistry";
import AppAppBar from "@/components/blog/AppAppBar";
import Footer from "@/components/blog/Footer";
import { getAppBar, type AppBar } from "@/api/app-bar";
import { pagePath } from "@/api/pages";
import { getSiteCopy, type SiteCopy } from "@/api/site";
import { getSiteSetting } from "@/api/site-setting";
import { getSocials, type Social } from "@/api/socials";
import { getStrapiMediaUrl } from "@/api/strapi";
import { getLocales } from "@/api/locales";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LocaleCookie } from "@/i18n/LocaleCookie";
import { assertLocale } from "@/i18n/assertLocale";
import { htmlLanguage, localePath, type Locale } from "@/i18n/locales";
import { getSiteUrl, pageAlternates } from "@/lib/site";

// Unknown locales are rejected in the layout. Unknown page slugs must still render
// so the 404 page can be shown inside this layout.
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ locale: string }[]> {
  const locales = await getLocales();
  return locales.map((locale) => ({ locale: locale.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await assertLocale((await params).locale);
  const copy = await getSiteCopy(locale);

  let faviconUrl = "";
  try {
    const siteSetting = (await getSiteSetting()).data;
    faviconUrl = getStrapiMediaUrl(siteSetting?.favicon);
  } catch {
    faviconUrl = "";
  }

  return {
    metadataBase: getSiteUrl(),
    title: {
      default: copy.meta.siteName,
      template: `%s | ${copy.meta.siteName}`,
    },
    description: copy.meta.description,
    alternates: await pageAlternates(locale, "/"),
    ...(faviconUrl ? { icons: { icon: faviconUrl } } : {}),
  };
}

function navigationLinks(appBar: AppBar | undefined, locale: Locale) {
  return (appBar?.links ?? []).flatMap((link) => {
    const page = link.page;
    if (!page?.title || !page.slug) return [];
    const path = pagePath(page);
    return [{ id: String(link.id), title: page.title, path, href: localePath(locale, path) }];
  });
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = await assertLocale((await params).locale);
  const copy: SiteCopy = await getSiteCopy(locale);
  const [settled, locales] = await Promise.all([
    Promise.allSettled([getSocials(), getAppBar(locale)]),
    getLocales(),
  ]);
  const [socialsResponse, appBarResponse] = settled;

  const socials: Social | undefined =
    socialsResponse.status === "fulfilled" ? socialsResponse.value.data : undefined;
  const appBar = appBarResponse.status === "fulfilled" ? appBarResponse.value.data : undefined;
  const links = navigationLinks(appBar, locale);

  return (
    <html lang={htmlLanguage(locale)} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="data-mui-color-scheme" defaultMode="system" />
        <ThemeRegistry>
          <I18nProvider locale={locale} copy={copy}>
            <LocaleCookie locale={locale} />
            <CssBaseline enableColorScheme />
            <AppAppBar brand={appBar} links={links} locales={locales} />
            <Container
              maxWidth="lg"
              component="main"
              sx={{ display: "flex", flexDirection: "column", my: 16, gap: 4 }}
            >
              {children}
            </Container>
            <Footer socials={socials} locale={locale} copy={copy} links={links} brand={appBar} />
          </I18nProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}

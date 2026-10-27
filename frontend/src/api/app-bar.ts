import "server-only";

import { defaultLocale, type Locale } from "../i18n/locales";
import { strapiFetchLocalized } from "./localized";
import {
  type StrapiEntity,
  type StrapiFetchOptions,
  type StrapiMedia,
  type StrapiResponse,
} from "./strapi";

export type AppBarPage = {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  isHome: boolean;
};

export type AppBarLink = {
  id: number;
  page?: AppBarPage | null;
};

export type AppBar = StrapiEntity<{
  title?: string;
  logo?: StrapiMedia | null;
  links?: AppBarLink[];
}>;

const appBarPopulate = [
  "populate[logo][fields][0]=url",
  "populate[logo][fields][1]=formats",
  "populate[logo][fields][2]=alternativeText",
  "populate[logo][fields][3]=width",
  "populate[logo][fields][4]=height",
  "populate[links][populate][page][fields][0]=title",
  "populate[links][populate][page][fields][1]=slug",
  "populate[links][populate][page][fields][2]=isHome",
].join("&");

export function getAppBar(locale: Locale = defaultLocale, options?: StrapiFetchOptions) {
  return strapiFetchLocalized<StrapiResponse<AppBar>>(`/app-bar?${appBarPopulate}`, locale, {
    ...options,
    next: { tags: ["app-bar", "pages"], ...(options?.next ?? {}) },
  });
}

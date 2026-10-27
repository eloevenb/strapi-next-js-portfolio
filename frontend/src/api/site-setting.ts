import "server-only";

import {
  strapiFetch,
  type StrapiEntity,
  type StrapiFetchOptions,
  type StrapiMedia,
  type StrapiResponse,
} from "./strapi";

export type SiteSetting = StrapiEntity<{
  favicon?: StrapiMedia | null;
}>;

const siteSettingPopulate = [
  "populate[favicon][fields][0]=url",
  "populate[favicon][fields][1]=formats",
  "populate[favicon][fields][2]=alternativeText",
].join("&");

export function getSiteSetting(options?: StrapiFetchOptions) {
  return strapiFetch<StrapiResponse<SiteSetting>>(`/site-setting?${siteSettingPopulate}`, {
    ...options,
    next: { tags: ["site-setting"], ...(options?.next ?? {}) },
  });
}

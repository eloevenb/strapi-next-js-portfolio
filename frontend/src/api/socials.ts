import "server-only";

import {
  strapiFetch,
  type StrapiEntity,
  type StrapiFetchOptions,
  type StrapiResponse,
} from "./strapi";

export type Social = StrapiEntity<{
  Linkedin?: string;
  GitHub?: string;
  HackTheBox?: string;
  Email?: string;
}>;

export function getSocials(options?: StrapiFetchOptions) {
  return strapiFetch<StrapiResponse<Social>>("/social", {
    ...options,
    next: { tags: ["socials"], ...(options?.next ?? {}) },
  });
}

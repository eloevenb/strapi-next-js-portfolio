import type { StrapiEntity, StrapiMedia } from "./strapi-media";

export type Tag = StrapiEntity<{
  name: string;
}>;

export type Author = StrapiEntity<{
  username: string;
  email?: string;
}>;

export function formatAuthorNames(authors: Author[] | null | undefined): string {
  return (authors ?? [])
    .map((author) => author.username)
    .filter(Boolean)
    .join(", ");
}

export type Project = StrapiEntity<{
  title: string;
  slug: string;
  description?: string;
  creationDate: string;
  cover: StrapiMedia;
  banner?: StrapiMedia | null;
  tags?: Tag[];
  authors?: Author[];
  publications?: { documentId?: string; id: number; title: string; slug: string; page: number }[];
}>;

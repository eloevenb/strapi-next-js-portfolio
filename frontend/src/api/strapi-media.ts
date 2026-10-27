export type StrapiEntity<T> = T & {
  id: number;
  documentId?: string;
};

export type StrapiMediaFormat = {
  url: string;
  width?: number | null;
  height?: number | null;
};

export type StrapiMedia = StrapiEntity<{
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  };
}>;

const apiUrl = (process.env.STRAPI_API_URL ?? "").replace(/\/$/, "");
const publicStrapiUrl = (
  process.env.NEXT_PUBLIC_STRAPI_URL ??
  process.env.PUBLIC_STRAPI_URL ??
  apiUrl.replace("/api", "")
).replace(/\/$/, "");

export function toAbsoluteStrapiUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${publicStrapiUrl}${path}`;
}

/** Origin the image optimizer fetches. Docker dev cannot reach the public localhost URL. */
const optimizerOrigin = (process.env.NEXT_PUBLIC_STRAPI_IMAGE_URL ?? "").replace(/\/$/, "");

/**
 * URL passed to next/image. The Next server fetches this URL, so it may differ
 * from the public origin the browser uses for favicons and the lightbox.
 */
export function toOptimizerStrapiUrl(url: string): string {
  const absolute = toAbsoluteStrapiUrl(url);
  if (!optimizerOrigin || !publicStrapiUrl || !absolute.startsWith(`${publicStrapiUrl}/`)) {
    return absolute;
  }
  return `${optimizerOrigin}${absolute.slice(publicStrapiUrl.length)}`;
}

export function getStrapiMediaUrl(
  media?: StrapiMedia | null,
  size?: keyof NonNullable<StrapiMedia["formats"]>,
): string {
  if (!media) return "";
  const url = size && media.formats?.[size]?.url ? media.formats[size].url : media.url;
  return toAbsoluteStrapiUrl(url);
}

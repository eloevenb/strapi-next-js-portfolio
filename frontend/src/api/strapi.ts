import "server-only";

export type { StrapiEntity, StrapiMedia, StrapiMediaFormat } from "./strapi-media";
export { getStrapiMediaUrl, toAbsoluteStrapiUrl, toOptimizerStrapiUrl } from "./strapi-media";

// Next.js augments fetch with these options at runtime.
export type NextFetchRequestConfig = {
  revalidate?: number | false;
  tags?: string[];
};

export type StrapiFetchOptions = RequestInit & { next?: NextFetchRequestConfig };

export type StrapiResponse<T> = {
  data: T;
  meta: Record<string, unknown>;
};

const apiUrl = (process.env.STRAPI_API_URL ?? "").replace(/\/$/, "");
const token = process.env.STRAPI_READ_ONLY_TOKEN;

const inFlightRequests = new Map<string, Promise<unknown>>();

type StrapiPaginationMeta = {
  pagination?: {
    page?: number;
    pageSize?: number;
    pageCount?: number;
    total?: number;
  };
};

/** Follow Strapi page metadata until every entry is collected. */
export async function strapiFetchAll<T>(
  path: string,
  options: StrapiFetchOptions = {},
  pageSize = 100,
): Promise<T[]> {
  const items: T[] = [];
  const separator = path.includes("?") ? "&" : "?";

  for (let page = 1; page <= 50; page += 1) {
    const response = await strapiFetch<StrapiResponse<T[]>>(
      `${path}${separator}pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
      options,
    );
    const batch = response.data ?? [];
    items.push(...batch);

    const pageCount = (response.meta as StrapiPaginationMeta).pagination?.pageCount ?? 1;
    if (page >= pageCount || batch.length === 0) break;
  }

  return items;
}

export async function strapiFetch<T>(path: string, options: StrapiFetchOptions = {}): Promise<T> {
  const { next, ...rest } = options;
  const key = `${rest.method ?? "GET"}:${path}:${typeof rest.body === "string" ? rest.body : JSON.stringify(rest.body)}`;

  // Avoid reusing an in-flight request when the caller explicitly bypasses caching
  // (e.g. the on-demand revalidation route needs fresh data).
  const skipDedup =
    rest.cache === "no-store" || rest.cache === "no-cache" || next?.revalidate === 0;

  if (!skipDedup) {
    const cached = inFlightRequests.get(key);
    if (cached) return cached as Promise<T>;
  }

  const headers = new Headers(rest.headers);
  headers.set("Accept", "application/json");

  if (token) headers.set("Authorization", `Bearer ${token}`);

  const fetchOptions: StrapiFetchOptions = { ...rest, headers };
  if (next !== undefined) fetchOptions.next = next;

  const promise = fetch(`${apiUrl}${path}`, fetchOptions)
    .then((response) => {
      if (!response.ok) throw new Error(`Strapi request failed with ${response.status}`);
      return response.json() as Promise<T>;
    })
    .finally(() => {
      if (!skipDedup) inFlightRequests.delete(key);
    });

  if (!skipDedup) inFlightRequests.set(key, promise);
  return promise;
}

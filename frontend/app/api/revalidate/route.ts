import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { defaultSiteLocale, getLocales } from "@/api/locales";
import { getPublicationBySlug } from "@/api/publications";
import { localePath } from "@/i18n/locales";

type StrapiWebhookEvent = {
  event?: string;
  createdAt?: string;
  model?: string;
  uid?: string;
  entry?: {
    id?: number;
    documentId?: string;
    slug?: string;
    isHome?: boolean;
    project?: {
      documentId?: string;
      slug?: string;
    } | null;
  };
};

function expireTag(tag: string) {
  revalidateTag(tag, { expire: 0 });
}

function revalidateLocalized(codes: readonly string[], path: string, type?: "layout" | "page") {
  for (const code of codes) {
    revalidatePath(localePath(code, path), type);
  }
}

const globalContentTypes = [
  { model: "app-bar", uid: "api::app-bar.app-bar", tag: "app-bar" },
  { model: "site", uid: "api::site.site", tag: "site" },
  { model: "site-setting", uid: "api::site-setting.site-setting", tag: "site-setting" },
  { model: "social", uid: "api::social.social", tag: "socials" },
] as const;

function getGlobalContent(model?: string, uid?: string) {
  return globalContentTypes.find((type) => type.model === model || type.uid === uid);
}

function getSecret(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (header) {
    // Support both "Bearer <secret>" and "<secret>" formats used by Strapi webhooks
    const parts = header.split(" ");
    return parts.length === 2 ? parts[1] : header;
  }
  return request.nextUrl.searchParams.get("secret");
}

export async function POST(request: NextRequest) {
  const secret = getSecret(request);
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  let event: StrapiWebhookEvent;
  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const model = event.model;
  const uid = event.uid;
  const entry = event.entry;

  if (!entry) {
    return NextResponse.json({ message: "Missing entry" }, { status: 400 });
  }

  try {
    const available = await getLocales({ cache: "no-store" });
    const localeCodes = available.map((locale) => locale.code);
    const fallbackLocale = defaultSiteLocale(available);

    if (model === "project" || uid === "api::project.project") {
      const slug = entry.slug;
      if (!slug) {
        return NextResponse.json({ message: "Missing project slug" }, { status: 400 });
      }

      // Invalidate the projects list and this specific project everywhere it appears.
      expireTag("projects");
      expireTag(`project:${slug}`);
      revalidateLocalized(localeCodes, "/projects");
      revalidateLocalized(localeCodes, `/projects/${slug}`);
      revalidateLocalized(localeCodes, `/projects/${slug}`, "layout");
      revalidatePath("/sitemap.xml");

      return NextResponse.json({ revalidated: true, model: "project", slug });
    }

    if (model === "publication" || uid === "api::publication.publication") {
      const slug = entry.slug;
      if (!slug) {
        return NextResponse.json({ message: "Missing publication slug" }, { status: 400 });
      }

      expireTag("publications");
      expireTag(`publication:${slug}`);

      // Try to resolve the owning project slug. Webhook payloads may or may not populate relations,
      // so fall back to a fresh Strapi lookup for publish/update events.
      let projectSlug = entry.project?.slug;
      let projectDocumentId = entry.project?.documentId;

      const isLiveEvent = event.event === "entry.publish" || event.event === "entry.update";
      if (!projectSlug && isLiveEvent) {
        const fresh = await getPublicationBySlug(slug, fallbackLocale, { cache: "no-store" });
        const publication = fresh.data[0];
        if (publication?.project) {
          projectSlug = publication.project.slug;
          projectDocumentId = publication.project.documentId;
        }
      }

      if (projectDocumentId) {
        expireTag(`project:${projectDocumentId}:publications`);
      }

      if (projectSlug) {
        revalidateLocalized(localeCodes, `/projects/${projectSlug}`);
        revalidateLocalized(localeCodes, `/projects/${projectSlug}/${slug}`);
        revalidateLocalized(localeCodes, `/projects/${projectSlug}`, "layout");
      } else {
        revalidateLocalized(localeCodes, "/projects", "layout");
      }
      revalidatePath("/sitemap.xml");

      return NextResponse.json({
        revalidated: true,
        model: "publication",
        slug,
        projectSlug,
      });
    }

    if (model === "page" || uid === "api::page.page") {
      expireTag("pages");
      expireTag("app-bar");
      if (entry.isHome) revalidateLocalized(localeCodes, "/");
      if (entry.slug) revalidateLocalized(localeCodes, `/${entry.slug}`);
      revalidateLocalized(localeCodes, "/", "layout");
      revalidatePath("/sitemap.xml");
      return NextResponse.json({ revalidated: true, model: "page", slug: entry.slug ?? null });
    }

    // Single types rendered by the root layout (header, footer, favicon).
    // Revalidating the root layout refreshes every page that includes them.
    const globalContent = getGlobalContent(model, uid);
    if (globalContent) {
      expireTag(globalContent.tag);
      revalidateLocalized(localeCodes, "/", "layout");

      return NextResponse.json({ revalidated: true, model: globalContent.model });
    }

    return NextResponse.json({ message: "Ignored event" }, { status: 200 });
  } catch (err) {
    console.error("[revalidate] error", err);
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}

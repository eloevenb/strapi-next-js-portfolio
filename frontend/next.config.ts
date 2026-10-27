import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

function strapiRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
  const seen = new Set<string>();

  for (const raw of [process.env.NEXT_PUBLIC_STRAPI_URL, process.env.NEXT_PUBLIC_STRAPI_IMAGE_URL]) {
    const value = raw?.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);

    let url: URL;
    try {
      url = new URL(value);
    } catch {
      continue;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") continue;

    patterns.push({
      protocol: url.protocol.slice(0, -1) as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/uploads/**",
    });
  }

  return patterns;
}

export default function nextConfig(phase: string): NextConfig {
  const siteUrl = process.env.SITE_URL?.trim();

  if (phase === PHASE_PRODUCTION_BUILD && !siteUrl) {
    throw new Error(
      "SITE_URL is required for the production build. Set it in .env.prod so Compose passes it as a Docker build arg.",
    );
  }

  // Private addresses are blocked unless this is on. Development always needs it
  // (localhost / the strapi service). Production needs it only when images are
  // fetched from NEXT_PUBLIC_STRAPI_IMAGE_URL instead of the public https host.
  const allowLocalImageIp =
    process.env.NODE_ENV !== "production" || Boolean(process.env.NEXT_PUBLIC_STRAPI_IMAGE_URL?.trim());

  return {
    images: {
      remotePatterns: strapiRemotePatterns(),
      dangerouslyAllowLocalIP: allowLocalImageIp,
    },
    // Inline the origin into the build so sitemap and robots keep it after the image starts.
    env: siteUrl ? { SITE_URL: siteUrl } : {},
  };
}

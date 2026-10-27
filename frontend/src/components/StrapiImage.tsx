import type { CSSProperties } from "react";
import Image from "next/image";
import { toAbsoluteStrapiUrl, toOptimizerStrapiUrl } from "../api/strapi-media";

type StrapiImageProps = {
  src: string;
  alt: string;
  sizes: string;
  width?: number | null;
  height?: number | null;
  fill?: boolean;
  priority?: boolean;
  title?: string;
  style?: CSSProperties;
};

function bypassesOptimizer(src: string): boolean {
  const path = src.split("?")[0].split("#")[0].toLowerCase();
  return path.endsWith(".svg") || path.endsWith(".gif");
}

export function StrapiImage({
  src,
  alt,
  sizes,
  width,
  height,
  fill = false,
  priority = false,
  title,
  style,
}: StrapiImageProps) {
  const absolute = toAbsoluteStrapiUrl(src);
  if (!absolute) return null;

  if (bypassesOptimizer(absolute)) {
    return <img src={absolute} alt={alt} title={title} style={style} />;
  }

  const optimizedSrc = toOptimizerStrapiUrl(absolute);

  if (fill) {
    return (
      <Image
        src={optimizedSrc}
        alt={alt}
        title={title}
        fill
        sizes={sizes}
        priority={priority}
        style={style}
      />
    );
  }

  if (!width || !height) {
    return <img src={absolute} alt={alt} title={title} style={style} />;
  }

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      title={title}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      style={style}
    />
  );
}

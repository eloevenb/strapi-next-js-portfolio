"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getStrapiMediaUrl } from "../../api/strapi-media";
import type { ImageComponent } from "../../api/publication-model";
import { fillTemplate } from "../../i18n/copy";
import { useI18n } from "../../i18n/I18nProvider";
import { StrapiImage } from "../StrapiImage";

type PublicationImageProps = {
  component: ImageComponent;
  onClick?: () => void;
};

export function PublicationImage({ component, onClick }: PublicationImageProps) {
  const { t } = useI18n();
  const imageUrl = getStrapiMediaUrl(component.image);
  const altText = component.image.alternativeText || component.description || "";
  const captionText = component.image.caption || component.description || altText;

  if (!imageUrl) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, my: 2 }}>
      <Box
        component="button"
        onClick={onClick}
        sx={{
          p: 0,
          border: 0,
          background: "none",
          cursor: onClick ? "pointer" : "default",
          textAlign: "left",
          width: "fit-content",
        }}
        aria-label={onClick ? fillTemplate(t.media.open, { alt: altText }) : undefined}
      >
        <StrapiImage
          src={imageUrl}
          alt={altText}
          title={captionText}
          width={component.image.width}
          height={component.image.height}
          sizes="(min-width: 900px) 900px, 100vw"
          style={{ maxWidth: "100%", height: "auto", display: "block" }}
        />
      </Box>
      {(component.image.caption || component.description) && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
          {component.image.caption || component.description}
        </Typography>
      )}
    </Box>
  );
}

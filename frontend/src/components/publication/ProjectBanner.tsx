"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatAuthorNames, type Project } from "../../api/project-model";
import { getStrapiMediaUrl } from "../../api/strapi-media";
import { formatDate } from "../../i18n/format";
import { useI18n } from "../../i18n/I18nProvider";
import { StrapiImage } from "../StrapiImage";

type ProjectBannerProps = {
  project: Project;
};

export function ProjectBanner({ project }: ProjectBannerProps) {
  const { locale } = useI18n();
  const bannerUrl = getStrapiMediaUrl(project.banner);
  if (!bannerUrl) return null;

  const authorNames = formatAuthorNames(project.authors);
  const formattedDate = formatDate(project.creationDate, locale);
  const byline = [authorNames, formattedDate].filter(Boolean).join(" • ");

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: 240, md: 360 },
        borderRadius: 2,
        overflow: "hidden",
        mb: 2,
      }}
    >
      <StrapiImage
        src={bannerUrl}
        alt={project.banner?.alternativeText ?? project.title}
        fill
        priority
        sizes="(min-width: 1200px) 1200px, 100vw"
        style={{ objectFit: "cover" }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 45%, rgba(0, 0, 0, 0) 100%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          p: { xs: 2, md: 4 },
          color: "common.white",
        }}
      >
        <Typography variant="h1" gutterBottom sx={{ color: "inherit" }}>
          {project.title}
        </Typography>
        <Typography variant="subtitle1" component="p" sx={{ color: "inherit", opacity: 0.9 }}>
          {byline}
        </Typography>
      </Box>
    </Box>
  );
}

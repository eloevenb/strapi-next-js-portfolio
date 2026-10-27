"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import Link from "next/link";
import { formatAuthorNames, type Project, type Tag } from "../../api/project-model";
import { getStrapiMediaUrl } from "../../api/strapi-media";
import { publicationCountLabel } from "../../i18n/copy";
import { formatDate } from "../../i18n/format";
import { useI18n } from "../../i18n/I18nProvider";
import { StrapiImage } from "../StrapiImage";

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: 0,
  height: "100%",
  backgroundColor: (theme.vars || theme).palette.background.paper,
  "&:hover": {
    backgroundColor: "transparent",
    cursor: "pointer",
  },
}));

const StyledCardContent = styled(CardContent)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: 16,
  flexGrow: 1,
  "&:last-child": {
    paddingBottom: 16,
  },
});

const StyledTypography = styled(Typography)({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  overflow: "hidden",
  textOverflow: "ellipsis",
});

type MainContentProps = {
  projects: Project[];
  title: string;
  intro: string;
  allTags?: Tag[];
  selectedTagIds?: string[];
  onTagToggle?: (tagIds: string[]) => void;
  projectHref?: (project: Project) => string;
};

function ProjectCard({
  project,
  showImage = true,
  imageSx,
  imageSizes = "(min-width: 900px) 370px, 100vw",
  priority = false,
  href,
  fillHeight = true,
}: {
  project: Project;
  showImage?: boolean;
  imageSx?: SxProps<Theme>;
  imageSizes?: string;
  priority?: boolean;
  href?: string;
  fillHeight?: boolean;
}) {
  const { locale, t } = useI18n();
  const coverUrl = getStrapiMediaUrl(project.cover);
  const authorNames = formatAuthorNames(project.authors);

  const card = (
    <StyledCard variant="outlined">
      {showImage && coverUrl && (
        <Box
          sx={{
            position: "relative",
            aspectRatio: "16 / 9",
            borderBottom: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            ...imageSx,
          }}
        >
          <StrapiImage
            src={coverUrl}
            alt={project.title}
            fill
            priority={priority}
            sizes={imageSizes}
            style={{ objectFit: "cover" }}
          />
        </Box>
      )}
      <StyledCardContent>
        <Typography gutterBottom variant="caption" component="div" color="primary">
          {formatDate(project.creationDate, locale, { day: false })}
        </Typography>
        {project.tags && project.tags.length > 0 && (
          <Typography gutterBottom variant="caption" component="div">
            {project.tags.map((tag) => tag.name).join(", ")}
          </Typography>
        )}
        <Typography gutterBottom variant="h6" component="div">
          {project.title}
        </Typography>
        <StyledTypography variant="body2" gutterBottom sx={{ color: "text.secondary" }}>
          {project.description}
        </StyledTypography>
      </StyledCardContent>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
        }}
      >
        {authorNames ? (
          <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
            <AvatarGroup max={3}>
              {project.authors?.map((author) => (
                <Avatar
                  key={author.documentId ?? author.id}
                  alt={author.username}
                  sx={{ width: 24, height: 24, fontSize: 12 }}
                >
                  {author.username.trim().charAt(0).toUpperCase()}
                </Avatar>
              ))}
            </AvatarGroup>
            <Typography variant="caption">{authorNames}</Typography>
          </Box>
        ) : (
          <Box />
        )}
        <Typography variant="caption">
          {project.publications?.length
            ? publicationCountLabel(t.projects, project.publications.length)
            : t.projects.project}
        </Typography>
      </Box>
    </StyledCard>
  );

  if (!href) return card;

  return (
    <Box
      component={Link}
      href={href}
      sx={{
        display: "block",
        height: fillHeight ? "100%" : "auto",
        color: "inherit",
        textDecoration: "none",
        borderRadius: 1,
        "&:focus-visible": {
          outline: "3px solid",
          outlineColor: "hsla(210, 98%, 48%, 0.5)",
          outlineOffset: "2px",
        },
      }}
    >
      {card}
    </Box>
  );
}

export default function MainContent({
  projects,
  title,
  intro,
  allTags = [],
  selectedTagIds = [],
  onTagToggle,
  projectHref,
}: MainContentProps) {
  const { t } = useI18n();
  const showFilter = allTags.length > 0;

  if (projects.length === 0 && selectedTagIds.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Typography variant="h1" gutterBottom>
          {title}
        </Typography>
        <Typography>{t.projects.empty}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div>
        <Typography variant="h1" gutterBottom>
          {title}
        </Typography>
        <Typography>{intro}</Typography>
      </div>

      {showFilter && (
        <Box
          sx={{
            display: "inline-flex",
            flexDirection: "row",
            gap: 3,
            overflow: "auto",
          }}
        >
          <Chip
            label={t.projects.allCategories}
            size="medium"
            onClick={() => onTagToggle?.([])}
            sx={
              selectedTagIds.length === 0
                ? undefined
                : { backgroundColor: "transparent", border: "none" }
            }
          />
          {allTags.map((tag) => {
            const tagId = tag.documentId ?? `${tag.id}`;
            const isSelected = selectedTagIds.includes(tagId);
            return (
              <Chip
                key={tagId}
                label={tag.name}
                size="medium"
                onClick={() =>
                  onTagToggle?.(
                    isSelected
                      ? selectedTagIds.filter((id) => id !== tagId)
                      : [...selectedTagIds, tagId],
                  )
                }
                sx={
                  isSelected
                    ? undefined
                    : { backgroundColor: "transparent", border: "none" }
                }
              />
            );
          })}
        </Box>
      )}

      {projects.length === 0 && selectedTagIds.length > 0 && (
        <Typography>{t.projects.noMatch}</Typography>
      )}

      <Grid container spacing={2} columns={12}>
        {projects.map((project, index) => {
          // Replicate the blog template grid pattern for the first 6 projects.
          let size: { xs: number; md: number } = { xs: 12, md: 4 };
          let showImage = true;
          let imageSx: SxProps<Theme> = {};
          let imageSizes = "(min-width: 900px) 370px, 100vw";

          if (index === 0 || index === 1) {
            size = { xs: 12, md: 6 };
            imageSizes = "(min-width: 900px) 560px, 100vw";
          } else if (index === 2 || index === 5) {
            size = { xs: 12, md: 4 };
            imageSx = { height: { sm: "auto", md: "50%" }, aspectRatio: { sm: "16 / 9", md: "" } };
          } else if (index === 3 || index === 4) {
            size = { xs: 12, md: 4 };
            showImage = false;
          }

          // Stack index 3 and 4 in a vertical column.
          if (index === 3) {
            return (
              <Grid key={project.documentId ?? project.id} size={size}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
                  {projects[index] && (
                    <ProjectCard
                      project={projects[index]}
                      showImage={false}
                      fillHeight={false}
                      href={projectHref?.(projects[index])}
                    />
                  )}
                  {projects[index + 1] && (
                    <ProjectCard
                      project={projects[index + 1]}
                      showImage={false}
                      fillHeight={false}
                      href={projectHref?.(projects[index + 1])}
                    />
                  )}
                </Box>
              </Grid>
            );
          }

          if (index === 4) return null;

          return (
            <Grid key={project.documentId ?? project.id} size={size}>
              <ProjectCard
                project={project}
                showImage={showImage}
                imageSx={imageSx}
                imageSizes={imageSizes}
                priority={index === 0}
                href={projectHref?.(project)}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

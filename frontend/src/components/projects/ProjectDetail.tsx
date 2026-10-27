"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";
import { ProjectBanner } from "@/components/publication";
import { PublicationContent } from "@/components/publication";
import { PublicationTableOfContents } from "@/components/publication/PublicationTableOfContents";
import type { Project } from "@/api/project-model";
import type { Publication } from "@/api/publication-model";
import { publicationPageLabel } from "@/i18n/copy";
import { useI18n } from "@/i18n/I18nProvider";
import { localePath } from "@/i18n/locales";

type ProjectDetailProps = {
  project: Project;
  publications: Publication[];
  selectedPublication?: Publication;
};

export default function ProjectDetail({ project, publications, selectedPublication }: ProjectDetailProps) {
  const router = useRouter();
  const { locale, t } = useI18n();

  const publicationIndex = selectedPublication
    ? publications.findIndex((p) => p.slug === selectedPublication.slug)
    : -1;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {project.banner ? <ProjectBanner project={project} /> : <Typography variant="h1">{project.title}</Typography>}

      {selectedPublication ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 4 },
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0, order: { xs: 2, md: 1 } }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="overline" color="primary">
                {publicationPageLabel(t.projects, selectedPublication.page)}
              </Typography>
              <Typography variant="h4" component="h2">
                {selectedPublication.title}
              </Typography>
              {selectedPublication.description && (
                <Typography variant="body1" color="text.secondary">
                  {selectedPublication.description}
                </Typography>
              )}
              <PublicationContent content={selectedPublication.content} />
            </Box>
          </Box>

          {selectedPublication.tableOfContents && (
            <Box
              component="nav"
              aria-label={t.detail.tableOfContents}
              sx={{
                width: { md: 242 },
                flexShrink: 0,
                position: { md: "sticky" },
                top: { md: 96 },
                alignSelf: "flex-start",
                order: { xs: 1, md: 2 },
              }}
            >
              <PublicationTableOfContents items={selectedPublication.tableOfContents.items} />
            </Box>
          )}
        </Box>
      ) : (
        <Typography>{t.detail.noPublications}</Typography>
      )}

      {publications.length > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
          <Pagination
            count={publications.length}
            page={publicationIndex >= 0 ? publicationIndex + 1 : 1}
            onChange={(_event, page) => {
              const publication = publications[page - 1];
              if (publication) {
                router.push(localePath(locale, `/projects/${project.slug}/${publication.slug}`));
              }
            }}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}

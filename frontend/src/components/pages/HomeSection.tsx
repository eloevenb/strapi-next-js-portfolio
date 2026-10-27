"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { linkedSocials, type SocialSource } from "../../lib/socials";
import { contactPageSlug, pagePath, projectsPageSlug, type HomeBlock, type LinkedPage } from "../../api/page-blocks";
import { ButtonLink } from "../AppLink";
import { useI18n } from "../../i18n/I18nProvider";
import { localePath } from "../../i18n/locales";

function buttonHref(page: LinkedPage | null | undefined, locale: string, fallback: string) {
  if (!page?.slug) return localePath(locale, fallback);
  return localePath(locale, pagePath({ isHome: page.isHome === true, slug: page.slug }));
}

type HomeSectionProps = {
  component: HomeBlock;
  socials?: SocialSource;
};

export function HomeSection({ component, socials }: HomeSectionProps) {
  const { locale } = useI18n();
  const visibleSocials = linkedSocials(socials);

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography variant="overline" color="primary">
        {component.eyebrow}
      </Typography>
      <Typography variant="h1" component="h1" gutterBottom>
        {component.title}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ fontSize: "1.2rem", maxWidth: 700, lineHeight: 1.6, mb: 4 }}
      >
        {component.intro}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <ButtonLink
          href={buttonHref(component.projectsPage, locale, `/${projectsPageSlug}`)}
          variant="contained"
          size="large"
        >
          {component.viewProjects}
        </ButtonLink>
        <ButtonLink
          href={buttonHref(component.contactPage, locale, `/${contactPageSlug}`)}
          variant="outlined"
          size="large"
        >
          {component.contact}
        </ButtonLink>
      </Stack>

      {visibleSocials.length > 0 && (
        <Box sx={{ mt: 8 }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: "block" }} gutterBottom>
            {component.findMe}
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {visibleSocials.map(({ key, label, href, external, Icon }) => (
              <Button
                key={key}
                variant="outlined"
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                startIcon={<Icon />}
              >
                {label}
              </Button>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

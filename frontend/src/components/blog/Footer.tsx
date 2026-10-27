import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { TextLink } from "../AppLink";
import SitemarkIcon, { type Brand } from "./SitemarkIcon";
import type { AppBarNavLink } from "./AppAppBar";
import type { SiteCopy } from "../../api/site-copy";
import type { Locale } from "../../i18n/locales";
import { linkedSocials, type SocialSource } from "../../lib/socials";

function Copyright({ copy, homeHref }: { copy: SiteCopy; homeHref: string }) {
  return (
    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
      {copy.footer.copyright}{" "}
      <TextLink href={homeHref} sx={{ color: "text.secondary" }}>
        {copy.meta.siteName}
      </TextLink>
      &nbsp;
      {new Date().getFullYear()}
    </Typography>
  );
}

type FooterProps = {
  socials?: SocialSource;
  locale: Locale;
  copy: SiteCopy;
  links: AppBarNavLink[];
  brand?: Brand;
};

export default function Footer({ socials, locale, copy, links, brand }: FooterProps) {
  const visibleSocials = linkedSocials(socials);
  const homeHref = links.find((link) => link.path === "/")?.href ?? `/${locale}`;

  return (
    <React.Fragment>
      <Divider />
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 4, sm: 8 },
          py: { xs: 8, sm: 10 },
          textAlign: { sm: "center", md: "left" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              minWidth: { xs: "100%", sm: "60%" },
            }}
          >
            <Box sx={{ width: { xs: "100%", sm: "60%" } }}>
              <SitemarkIcon brand={brand} homeLabel={copy.meta.siteName} />
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                {copy.meta.siteName}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                {copy.meta.description}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {copy.footer.pages}
            </Typography>
            {links.map((link) => (
              <TextLink key={link.id} variant="body2" href={link.href} sx={{ color: "text.secondary" }}>
                {link.title}
              </TextLink>
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            pt: { xs: 4, sm: 8 },
            width: "100%",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <div>
            <Typography variant="body2" component="span" sx={{ color: "text.secondary" }}>
              {copy.footer.privacy}
            </Typography>
            <Typography sx={{ display: "inline", mx: 0.5, opacity: 0.5 }}>
              &nbsp;•&nbsp;
            </Typography>
            <Typography variant="body2" component="span" sx={{ color: "text.secondary" }}>
              {copy.footer.terms}
            </Typography>
            <Copyright copy={copy} homeHref={homeHref} />
          </div>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ justifyContent: "left", color: "text.secondary" }}
          >
            {visibleSocials.map(({ key, label, href, external, Icon }) => (
              <IconButton
                key={key}
                color="inherit"
                size="small"
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                aria-label={label}
                sx={{ alignSelf: "center" }}
              >
                <Icon />
              </IconButton>
            ))}
          </Stack>
        </Box>
      </Container>
    </React.Fragment>
  );
}

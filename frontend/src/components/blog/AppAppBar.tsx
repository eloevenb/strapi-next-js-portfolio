"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { alpha, styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import ColorModeIconDropdown from "../../shared-theme/ColorModeIconDropdown";
import Sitemark, { type Brand } from "./SitemarkIcon";
import { getStrapiMediaUrl } from "../../api/strapi-media";
import { useI18n } from "../../i18n/I18nProvider";
import { htmlLanguage, replaceLocale, stripLocale, type SiteLocale } from "../../i18n/locales";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: "blur(24px)",
  border: "1px solid",
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: "8px 12px",
}));

export type AppBarNavLink = {
  id: string;
  title: string;
  path: string;
  href: string;
};

type AppAppBarProps = {
  brand?: Brand;
  links: AppBarNavLink[];
  locales: SiteLocale[];
};

function useActivePath(codes: readonly string[], links: AppBarNavLink[]): string | undefined {
  const pathname = stripLocale(usePathname() ?? "", codes);
  const exact = links.find((link) => link.path === pathname);
  if (exact) return exact.path;
  return links
    .filter((link) => link.path !== "/" && pathname.startsWith(`${link.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0]?.path;
}

function LanguageSwitcher({ locales }: { locales: SiteLocale[] }) {
  const pathname = usePathname() ?? "/";
  const { locale, t } = useI18n();
  const codes = locales.map((item) => item.code);

  return (
    <Box component="nav" aria-label={t.nav.language} sx={{ display: "flex", alignItems: "center" }}>
      {locales.map((item) => (
        <Button
          key={item.code}
          component={Link}
          href={replaceLocale(pathname, item.code, codes)}
          prefetch={false}
          hrefLang={htmlLanguage(item.code)}
          title={item.name}
          size="small"
          color={item.code === locale ? "primary" : "info"}
          aria-current={item.code === locale ? "page" : undefined}
          sx={{ minWidth: 0, px: 1 }}
        >
          {item.code.toUpperCase()}
        </Button>
      ))}
    </Box>
  );
}

export default function AppAppBar({ brand, links = [], locales }: AppAppBarProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const codes = locales.map((item) => item.code);
  const activePath = useActivePath(codes, links);
  const { t } = useI18n();
  const homeLink = links.find((link) => link.path === "/");
  const homeLabel = homeLink?.title ?? brand?.title ?? t.meta.siteName;

  const isSitemarkImage = Boolean(getStrapiMediaUrl(brand?.logo, "small"));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: "calc(var(--template-frame-height, 0px) + 28px)",
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 3 }}>
            <Button
              component={Link}
              href={homeLink?.href ?? links[0]?.href ?? "/"}
              disableRipple={isSitemarkImage}
              sx={{
                p: 0,
                minWidth: 0,
                ...(isSitemarkImage && {
                  "&:hover": { backgroundColor: "transparent" },
                  "&:focus-visible": { backgroundColor: "transparent" },
                }),
              }}
              aria-label={homeLabel}
            >
              <Sitemark brand={brand} homeLabel={homeLabel} />
            </Button>
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              {links.map((link) => (
                <Button
                  key={link.id}
                  component={Link}
                  href={link.href}
                  variant="text"
                  color={activePath === link.path ? "primary" : "info"}
                  size="small"
                  aria-current={activePath === link.path ? "page" : undefined}
                >
                  {link.title}
                </Button>
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
            <LanguageSwitcher locales={locales} />
            <ColorModeIconDropdown />
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            <LanguageSwitcher locales={locales} />
            <ColorModeIconDropdown size="medium" />
            <IconButton aria-label={t.nav.menu} onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: 160,
                  },
                },
              }}
            >
              {links.map((link) => (
                <MenuItem
                  key={link.id}
                  component={Link}
                  href={link.href}
                  selected={activePath === link.path}
                  onClick={handleMenuClose}
                >
                  {link.title}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}

import Typography from "@mui/material/Typography";
import { getStrapiMediaUrl, type StrapiMedia } from "../../api/strapi-media";
import { StrapiImage } from "../StrapiImage";

export type Brand = {
  title?: string;
  logo?: StrapiMedia | null;
};

type SitemarkIconProps = {
  brand?: Brand;
  homeLabel?: string;
};

export default function SitemarkIcon({ brand, homeLabel }: SitemarkIconProps) {
  const logoUrl = getStrapiMediaUrl(brand?.logo);
  const label = brand?.logo?.alternativeText ?? brand?.title ?? homeLabel;

  if (logoUrl) {
    return (
      <StrapiImage
        src={logoUrl}
        alt={label ?? ""}
        width={brand?.logo?.width}
        height={brand?.logo?.height}
        sizes="32px"
        style={{ height: 32, width: "auto", display: "block" }}
      />
    );
  }

  if (brand?.title) {
    return (
      <Typography
        variant="h6"
        component="span"
        noWrap
        sx={{
          mr: 2,
          fontWeight: 700,
          letterSpacing: ".04em",
          textTransform: "uppercase",
          color: "text.primary",
        }}
      >
        {brand.title}
      </Typography>
    );
  }

  return null;
}

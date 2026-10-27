import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ContactBlock } from "../../api/page-blocks";
import { linkedSocials, type SocialSource } from "../../lib/socials";

type ContactSectionProps = {
  component: ContactBlock;
  socials?: SocialSource;
};

export function ContactSection({ component, socials }: ContactSectionProps) {
  const visibleSocials = linkedSocials(socials);

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Typography variant="overline" color="primary" sx={{ display: "block" }} gutterBottom>
        {component.eyebrow}
      </Typography>
      <Typography variant="h2" component="h1" gutterBottom>
        {component.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, mb: 4 }}>
        {component.intro}
      </Typography>

      {visibleSocials.length > 0 && (
        <Stack direction="column" spacing={2} sx={{ alignItems: "flex-start" }}>
          {visibleSocials.map(({ key, label, href, external, Icon }) => (
            <Stack key={key} direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Icon fontSize="small" />
              <Link
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                variant="button"
                underline="hover"
                color="primary"
              >
                {key === "Email" ? socials?.Email : label}
              </Link>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
}

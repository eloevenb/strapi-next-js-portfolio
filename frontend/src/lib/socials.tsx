import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { HackTheBoxIcon } from "../components/icons/HackTheBoxIcon";

export type SocialSource = {
  Linkedin?: string;
  GitHub?: string;
  HackTheBox?: string;
  Email?: string;
};

export type SocialPlatformKey = keyof SocialSource;

export type SocialPlatform = {
  key: SocialPlatformKey;
  label: string;
  Icon: ComponentType<SvgIconProps>;
  href: (value: string) => string;
  external: boolean;
};

export const socialPlatforms: SocialPlatform[] = [
  { key: "Email", label: "Email", Icon: EmailIcon, href: (value) => `mailto:${value}`, external: false },
  { key: "GitHub", label: "GitHub", Icon: GitHubIcon, href: (value) => value, external: true },
  { key: "Linkedin", label: "LinkedIn", Icon: LinkedInIcon, href: (value) => value, external: true },
  { key: "HackTheBox", label: "Hack The Box", Icon: HackTheBoxIcon, href: (value) => value, external: true },
];

export type LinkedSocial = {
  key: SocialPlatformKey;
  label: string;
  href: string;
  external: boolean;
  Icon: ComponentType<SvgIconProps>;
};

export function linkedSocials(socials: SocialSource | undefined): LinkedSocial[] {
  if (!socials) return [];
  return socialPlatforms.flatMap((platform) => {
    const value = socials[platform.key];
    if (!value) return [];
    return [
      {
        key: platform.key,
        label: platform.label,
        href: platform.href(value),
        external: platform.external,
        Icon: platform.Icon,
      },
    ];
  });
}

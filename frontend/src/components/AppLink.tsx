"use client";

import Button, { type ButtonProps } from "@mui/material/Button";
import MuiLink, { type LinkProps } from "@mui/material/Link";
import NextLink from "next/link";

type ButtonLinkProps = ButtonProps<typeof NextLink>;

export function ButtonLink(props: ButtonLinkProps) {
  return <Button {...props} component={NextLink} />;
}

type TextLinkProps = LinkProps<typeof NextLink>;

export function TextLink(props: TextLinkProps) {
  return <MuiLink {...props} component={NextLink} />;
}

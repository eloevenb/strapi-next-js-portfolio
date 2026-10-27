"use client";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import type { CodeSnippetComponent } from "../../api/publication-model";
import { useI18n } from "../../i18n/I18nProvider";
import { codeLanguage } from "./codeLanguages";
import styles from "./code-snippet.module.css";

const codeFontFamily =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

type PublicationCodeSnippetProps = {
  component: CodeSnippetComponent;
};

function CopyCodeButton({ value }: { value: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeoutId = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <IconButton size="small" aria-label={copied ? t.code.copied : t.code.copy} onClick={handleCopy}>
      {copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
    </IconButton>
  );
}

export function PublicationCodeSnippet({ component }: PublicationCodeSnippetProps) {
  if (typeof component.content !== "string" || component.content.length === 0) return null;

  const label = codeLanguage(component.language)?.label;
  const highlighted = component.html ?? escapeHtml(component.content);

  return (
    <Box
      className={styles.root}
      sx={(theme) => ({
        my: 2,
        color: "#24292e",
        backgroundColor: (theme.vars || theme).palette.grey[50],
        border: "1px solid",
        borderColor: (theme.vars || theme).palette.divider,
        borderRadius: 1,
        ...theme.applyStyles("dark", {
          color: "#c9d1d9",
          backgroundColor: (theme.vars || theme).palette.grey[800],
        }),
      })}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          minHeight: 40,
          pl: 2,
          pr: 0.5,
        }}
      >
        {label && (
          <Typography
            variant="caption"
            component="div"
            sx={{
              mr: "auto",
              color: "text.secondary",
              fontFamily: codeFontFamily,
            }}
          >
            {label}
          </Typography>
        )}
        <CopyCodeButton value={component.content} />
      </Box>
      <Box
        component="pre"
        spellCheck={false}
        sx={{
          m: 0,
          px: 2,
          pt: 0.5,
          pb: 2,
          overflowX: "auto",
          fontFamily: codeFontFamily,
          fontSize: "0.8125rem",
          lineHeight: 1.7,
          tabSize: 2,
        }}
      >
        <Box component="code" sx={{ fontFamily: "inherit" }} dangerouslySetInnerHTML={{ __html: highlighted }} />
      </Box>
    </Box>
  );
}

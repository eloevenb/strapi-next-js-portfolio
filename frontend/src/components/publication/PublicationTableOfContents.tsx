"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { TableOfContentItemComponent } from "../../api/publication-model";
import { useI18n } from "../../i18n/I18nProvider";

type TreeNode = TableOfContentItemComponent & {
  children: TreeNode[];
};

type PublicationTableOfContentsProps = {
  items: TableOfContentItemComponent[];
};

function buildTree(items: TableOfContentItemComponent[]): TreeNode[] {
  const root: TreeNode = {
    id: -1,
    title: "",
    anchor: "",
    level: -1,
    children: [],
  };
  const parents: TreeNode[] = [root];

  for (const item of items) {
    const node: TreeNode = { ...item, children: [] };
    const previousLevel = parents.length - 1;
    const effectiveLevel = Math.min(node.level, previousLevel + 1);

    while (parents.length > 1 && (parents[parents.length - 1]?.level ?? -1) >= effectiveLevel) {
      parents.pop();
    }

    const parent = parents[effectiveLevel - 1] ?? root;
    parent.children.push(node);

    parents[effectiveLevel] = node;
    parents.length = effectiveLevel + 1;
  }

  return root.children;
}

function getHashAnchor(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace("#", "");
}

/** Activate a section once its anchor reaches slightly above the vertical center. */
const ACTIVE_ANCHOR_LINE_RATIO = 0.4;

function getActivationLine(): number {
  return window.innerHeight * ACTIVE_ANCHOR_LINE_RATIO;
}

function useActiveAnchor(items: TableOfContentItemComponent[]) {
  const [activeAnchor, setActiveAnchor] = useState<string>(() => getHashAnchor());

  useEffect(() => {
    const handleHashChange = () => setActiveAnchor(getHashAnchor());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Build a stable key from the anchors so the scroll effect only re-runs when
  // the actual anchor list changes, not when the parent re-creates the array.
  const anchorsKey = items.map((item) => item.anchor).join(",");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const anchors = items.map((item) => item.anchor).filter(Boolean);
    let rafId: number | null = null;
    let lastAnchor = "";

    const computeActiveAnchor = () => {
      rafId = null;

      const activationLine = getActivationLine();
      let current: string | null = null;
      let bestTop = -Infinity;

      for (const anchor of anchors) {
        const element = document.getElementById(anchor);
        if (!element) continue;
        const top = element.getBoundingClientRect().top;
        if (top <= activationLine && top > bestTop) {
          current = anchor;
          bestTop = top;
        }
      }

      if (!current) {
        let nearestBelowTop = Infinity;
        for (const anchor of anchors) {
          const element = document.getElementById(anchor);
          if (!element) continue;
          const top = element.getBoundingClientRect().top;
          if (top < nearestBelowTop) {
            nearestBelowTop = top;
            current = anchor;
          }
        }
      }

      if (current && current !== lastAnchor) {
        lastAnchor = current;
        setActiveAnchor(current);
      }
    };

    const handleScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(computeActiveAnchor);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    computeActiveAnchor();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorsKey]);

  return activeAnchor;
}

const levelPadding: Record<number, number> = {
  0: 1.5, // 12px
  1: 3, // 24px
  2: 4.5, // 36px
};

function renderTree(
  nodes: TreeNode[],
  activeAnchor: string,
  keyPrefix: string,
): React.ReactNode {
  if (nodes.length === 0) return null;

  return (
    <Box
      component="ul"
      sx={{
        listStyle: "none",
        pl: 0,
        m: 0,
      }}
    >
      {nodes.map((node, index) => {
        const key = `${keyPrefix}-${node.anchor}-${index}`;
        const isActive = node.anchor === activeAnchor;
        const paddingLeft = levelPadding[node.level] ?? levelPadding[0];

        return (
          <Box component="li" key={key}>
            <Link
              href={`#${node.anchor}`}
              underline="none"
              aria-current={isActive ? "true" : undefined}
              sx={(theme) => ({
                display: "block",
                py: 0.75,
                pl: paddingLeft,
                fontSize: "0.8125rem",
                lineHeight: 1.5,
                fontWeight: 500,
                color: isActive
                  ? (theme.vars || theme).palette.primary.main
                  : (theme.vars || theme).palette.text.secondary,
                textDecoration: "none",
                borderLeft: 2,
                borderColor: isActive
                  ? (theme.vars || theme).palette.primary.main
                  : "transparent",
                transition: theme.transitions.create(["color", "border-color"], {
                  duration: theme.transitions.duration.shortest,
                }),
                "&:hover": {
                  color: (theme.vars || theme).palette.text.primary,
                  textDecoration: "none",
                },
                "&:focus": {
                  textDecoration: "none",
                },
              })}
            >
              <Box component="span" sx={{ display: "inline-flex" }}>
                {node.title}
              </Box>
            </Link>
            {renderTree(node.children, activeAnchor, key)}
          </Box>
        );
      })}
    </Box>
  );
}

export function PublicationTableOfContents({ items }: PublicationTableOfContentsProps) {
  const { t } = useI18n();
  const activeAnchor = useActiveAnchor(items);

  if (!Array.isArray(items) || items.length === 0) return null;

  const tree = buildTree(items);

  return (
    <Box sx={{ pt: 4, pr: 4, pb: 7, pl: 0.75 }}>
      <Typography
        variant="body2"
        sx={(theme) => ({
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: (theme.vars || theme).palette.text.secondary,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          mb: 1,
        })}
      >
        {t.detail.contents}
      </Typography>
      {renderTree(tree, activeAnchor, "toc")}
    </Box>
  );
}

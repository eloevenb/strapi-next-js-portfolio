import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { StrapiImage } from "./StrapiImage";

type TextModifier = "bold" | "italic" | "underline" | "strikethrough" | "code";

type TextNode = {
  type: "text";
  text: string;
} & Partial<Record<TextModifier, boolean>>;

type LinkNode = {
  type: "link";
  url: string;
  children: InlineNode[];
};

type InlineNode = TextNode | LinkNode;

function safeLink(url: string): { href: string; external: boolean } | null {
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("//")) return null;
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return { href: trimmed, external: false };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol === "http:" || parsed.protocol === "https:") {
    return { href: parsed.href, external: true };
  }
  if (parsed.protocol === "mailto:") return { href: parsed.href, external: false };
  return null;
}

type ListItemNode = {
  type: "list-item";
  children: InlineNode[];
};

type BlockNode =
  | { type: "paragraph"; children: InlineNode[] }
  | { type: "heading"; level: number; children: InlineNode[] }
  | { type: "list"; format: "ordered" | "unordered"; children: ListItemNode[] }
  | { type: "quote"; children: BlockNode[] }
  | { type: "code"; language?: string; children: InlineNode[] }
  | { type: "image"; image: { url: string; alternativeText?: string | null; caption?: string | null; width?: number; height?: number } };

function renderInline(nodes: InlineNode[], keyPrefix: string): React.ReactNode {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    if (node.type === "link") {
      const destination = safeLink(node.url);
      const children = renderInline(node.children, key);
      if (!destination) return <span key={key}>{children}</span>;

      return (
        <Link
          key={key}
          href={destination.href}
          {...(destination.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          sx={(theme) => ({
            color: (theme.vars || theme).palette.primary.main,
            fontWeight: 500,
            "&:hover": {
              color: (theme.vars || theme).palette.primary.dark,
            },
          })}
        >
          {children}
        </Link>
      );
    }

    let element: React.ReactNode = node.text || "\u00A0";

    if (node.bold) {
      element = (
        <Box key={key} component="strong" sx={{ fontWeight: 700 }}>
          {element}
        </Box>
      );
    }
    if (node.italic) {
      element = (
        <Box key={key} component="em">
          {element}
        </Box>
      );
    }
    if (node.underline) {
      element = (
        <Box key={key} component="u">
          {element}
        </Box>
      );
    }
    if (node.strikethrough) {
      element = (
        <Box key={key} component="s">
          {element}
        </Box>
      );
    }
    if (node.code) {
      element = (
        <Box
          key={key}
          component="code"
          sx={{
            fontFamily: "monospace",
            backgroundColor: "action.hover",
            px: 0.5,
            borderRadius: 0.5,
          }}
        >
          {element}
        </Box>
      );
    }

    return <span key={key}>{element}</span>;
  });
}

function renderBlock(node: BlockNode, keyPrefix: string): React.ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <Typography key={keyPrefix} variant="body1" component="p" sx={{ mb: 2 }}>
          {renderInline(node.children, keyPrefix)}
        </Typography>
      );

    case "heading": {
      const variant = `h${node.level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <Typography key={keyPrefix} variant={variant} gutterBottom>
          {renderInline(node.children, keyPrefix)}
        </Typography>
      );
    }

    case "list": {
      const ListComponent = node.format === "ordered" ? "ol" : "ul";
      return (
        <Box key={keyPrefix} component={ListComponent} sx={{ pl: 3, my: 2 }}>
          {node.children.map((item, index) => (
            <Box key={`${keyPrefix}-li-${index}`} component="li">
              {renderInline(item.children, `${keyPrefix}-li-${index}`)}
            </Box>
          ))}
        </Box>
      );
    }

    case "quote":
      return (
        <Box
          key={keyPrefix}
          component="blockquote"
          sx={{
            borderLeft: 4,
            borderColor: "divider",
            pl: 2,
            my: 2,
            color: "text.secondary",
          }}
        >
          {node.children.map((child, index) => renderBlock(child, `${keyPrefix}-q-${index}`))}
        </Box>
      );

    case "code":
      return (
        <Box
          key={keyPrefix}
          component="pre"
          sx={{
            backgroundColor: "action.hover",
            p: 2,
            borderRadius: 1,
            overflowX: "auto",
            my: 2,
          }}
        >
          <Box component="code" sx={{ fontFamily: "monospace" }}>
            {renderInline(node.children, keyPrefix)}
          </Box>
        </Box>
      );

    case "image": {
      const altText = node.image.alternativeText ?? "";
      const captionText = node.image.caption || altText;
      return (
        <Box key={keyPrefix} sx={{ my: 2 }}>
          <StrapiImage
            src={node.image.url}
            alt={altText}
            title={captionText}
            width={node.image.width}
            height={node.image.height}
            sizes="(min-width: 900px) 900px, 100vw"
            style={{ maxWidth: "100%", height: "auto" }}
          />
          {node.image.caption && (
            <Typography variant="caption" color="text.secondary" component="div">
              {node.image.caption}
            </Typography>
          )}
        </Box>
      );
    }

    default:
      return null;
  }
}

type BlocksContentProps = {
  content: unknown;
};

export function BlocksContent({ content }: BlocksContentProps) {
  if (!Array.isArray(content)) return null;

  return (
    <Box>
      {(content as BlockNode[]).map((node, index) => renderBlock(node, `block-${index}`))}
    </Box>
  );
}

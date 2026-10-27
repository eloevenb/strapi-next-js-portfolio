import type { StrapiEntity, StrapiMedia } from "./strapi-media";

export type ParagraphComponent = {
  __component: "text.paragraph";
  id: number;
  content: unknown;
};

export type VerticalSpacingComponent = {
  __component: "layout.vertical-spacing";
  id: number;
  Size: number;
  anchor?: string;
};

export type ImageComponent = {
  __component: "image.image";
  id: number;
  image: StrapiMedia;
  description?: string;
};

export type CodeSnippetComponent = {
  __component: "text.code-snippet";
  id: number;
  content: string;
  language: string;
  html?: string;
};

export type TableOfContentItemComponent = {
  id: number;
  title: string;
  anchor: string;
  level: number;
};

export type TableOfContents = {
  id: number;
  items: TableOfContentItemComponent[];
};

export type ContentComponent =
  | ParagraphComponent
  | VerticalSpacingComponent
  | ImageComponent
  | CodeSnippetComponent;

export function isParagraph(component: { __component: string }): component is ParagraphComponent {
  return component.__component === "text.paragraph";
}

export function isVerticalSpacing(component: { __component: string }): component is VerticalSpacingComponent {
  return component.__component === "layout.vertical-spacing";
}

export function isImage(component: { __component: string }): component is ImageComponent {
  return component.__component === "image.image";
}

export function isCodeSnippet(component: { __component: string }): component is CodeSnippetComponent {
  return component.__component === "text.code-snippet";
}

export type Publication = StrapiEntity<{
  title: string;
  slug: string;
  description?: string;
  content: ContentComponent[];
  page: number;
  tableOfContents?: TableOfContents | null;
  project?: { title: string; slug: string; documentId?: string };
}>;

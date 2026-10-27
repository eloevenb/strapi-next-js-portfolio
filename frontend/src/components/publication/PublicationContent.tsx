"use client";

import Box from "@mui/material/Box";
import { Fragment, useMemo, useState, type ReactNode } from "react";
import { PublicationCodeSnippet } from "./PublicationCodeSnippet";
import { PublicationImage } from "./PublicationImage";
import { PublicationImageViewer } from "./PublicationImageViewer";
import { PublicationParagraph } from "./PublicationParagraph";
import { PublicationVerticalSpacing } from "./PublicationVerticalSpacing";
import {
  isCodeSnippet,
  isImage,
  isParagraph,
  isVerticalSpacing,
  type ContentComponent,
} from "../../api/publication-model";

type PublicationContentProps<T extends { __component: string; id: number }> = {
  content: T[];
  renderAdditional?: (component: T) => ReactNode;
};

export function PublicationContent<T extends { __component: string; id: number } = ContentComponent>({
  content,
  renderAdditional,
}: PublicationContentProps<T>) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const images = useMemo(
    () => content.flatMap((component) => (isImage(component) ? [component] : [])),
    [content],
  );

  if (!Array.isArray(content)) return null;

  return (
    <Box>
      {content.map((component) => {
        // Component ids are only unique per Strapi component type, so the key must
        // include the component discriminator to avoid collisions across types.
        const key = `${component.__component}-${component.id}`;

        if (isParagraph(component)) {
          return <PublicationParagraph key={key} component={component} />;
        }

        if (isVerticalSpacing(component)) {
          return <PublicationVerticalSpacing key={key} component={component} />;
        }

        if (isCodeSnippet(component)) {
          return <PublicationCodeSnippet key={key} component={component} />;
        }

        if (isImage(component)) {
          const imageIndex = images.findIndex((image) => image.id === component.id);
          return (
            <PublicationImage
              key={key}
              component={component}
              onClick={() => setViewerIndex(imageIndex)}
            />
          );
        }

        if (renderAdditional) {
          const additional = renderAdditional(component);
          if (additional) return <Fragment key={key}>{additional}</Fragment>;
        }

        return null;
      })}

      <PublicationImageViewer
        images={images}
        currentIndex={viewerIndex ?? 0}
        open={viewerIndex !== null}
        onClose={() => setViewerIndex(null)}
        onChangeIndex={setViewerIndex}
      />
    </Box>
  );
}

import { BlocksContent } from "../BlocksContent";
import type { ParagraphComponent } from "../../api/publication-model";

type PublicationParagraphProps = {
  component: ParagraphComponent;
};

export function PublicationParagraph({ component }: PublicationParagraphProps) {
  return <BlocksContent content={component.content} />;
}

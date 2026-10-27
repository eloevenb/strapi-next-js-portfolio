import Box from "@mui/material/Box";
import type { VerticalSpacingComponent } from "../../api/publication-model";

type PublicationVerticalSpacingProps = {
  component: VerticalSpacingComponent;
};

export function PublicationVerticalSpacing({ component }: PublicationVerticalSpacingProps) {
  return (
    <Box
      id={component.anchor || undefined}
      aria-hidden="true"
      sx={{
        height: typeof component.Size === "number" ? component.Size : 0,
        scrollMarginTop: "96px",
      }}
    />
  );
}

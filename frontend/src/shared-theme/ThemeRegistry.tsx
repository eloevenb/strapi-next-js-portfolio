"use client";

import * as React from "react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";
import { inputsCustomizations } from "./customizations/inputs";
import { dataDisplayCustomizations } from "./customizations/dataDisplay";
import { feedbackCustomizations } from "./customizations/feedback";
import { navigationCustomizations } from "./customizations/navigation";
import { surfacesCustomizations } from "./customizations/surfaces";
import { colorSchemes, typography, shadows, shape } from "./themePrimitives";

interface ThemeRegistryProps {
  children: React.ReactNode;
  themeComponents?: ThemeOptions["components"];
}

function createThemeInstance(themeComponents?: ThemeOptions["components"]) {
  return createTheme({
    cssVariables: {
      colorSchemeSelector: "data-mui-color-scheme",
      cssVarPrefix: "template",
    },
    colorSchemes,
    typography,
    shadows,
    shape,
    components: {
      ...inputsCustomizations,
      ...dataDisplayCustomizations,
      ...feedbackCustomizations,
      ...navigationCustomizations,
      ...surfacesCustomizations,
      ...themeComponents,
    },
  });
}

export default function ThemeRegistry({ children, themeComponents }: ThemeRegistryProps) {
  const [{ cache, theme }] = React.useState(() => {
    const cache = createCache({ key: "css", prepend: true });
    cache.compat = true;
    return { cache, theme: createThemeInstance(themeComponents) };
  });

  useServerInsertedHTML(() => {
    const names = Object.keys(cache.inserted);
    if (names.length === 0) return null;
    let styles = "";
    for (const name of names) {
      const style = cache.inserted[name];
      if (typeof style === "string") {
        styles += style;
      }
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme} disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}

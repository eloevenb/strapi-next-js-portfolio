"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteCopy } from "../api/site-copy";
import type { Locale } from "./locales";

const LocaleContext = createContext<{ locale: Locale; copy: SiteCopy } | null>(null);

export function I18nProvider({
  locale,
  copy,
  children,
}: {
  locale: Locale;
  copy: SiteCopy;
  children: ReactNode;
}) {
  return <LocaleContext.Provider value={{ locale, copy }}>{children}</LocaleContext.Provider>;
}

export function useI18n(): { locale: Locale; t: SiteCopy } {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return { locale: value.locale, t: value.copy };
}

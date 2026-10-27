"use client";

import { useEffect } from "react";
import { localeCookie, type Locale } from "./locales";

const oneYear = 60 * 60 * 24 * 365;

/** Remember the locale without a response cookie. A proxy Set-Cookie on prefetched language links reloads the page forever. */
export function LocaleCookie({ locale }: { locale: Locale }) {
  useEffect(() => {
    const current = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${localeCookie}=`))
      ?.slice(localeCookie.length + 1);
    if (current === locale) return;
    document.cookie = `${localeCookie}=${locale}; path=/; max-age=${oneYear}; samesite=lax`;
  }, [locale]);

  return null;
}

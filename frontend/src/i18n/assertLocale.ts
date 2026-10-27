import { notFound } from "next/navigation";
import { getLocales } from "../api/locales";
import { isKnownLocale, type Locale } from "./locales";

export async function assertLocale(value: string): Promise<Locale> {
  const locales = await getLocales();
  if (!isKnownLocale(value, locales)) notFound();
  return value;
}

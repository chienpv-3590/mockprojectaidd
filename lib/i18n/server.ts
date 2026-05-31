import { cookies } from "next/headers";
import { defaultLocale, hasLocale, type Locale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * Resolves the active locale from the NEXT_LOCALE cookie (set by the language
 * switcher / proxy from the `?lang` query param). Falls back to the default.
 * Server-only — relies on `next/headers`.
 */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return value && hasLocale(value) ? value : defaultLocale;
}

/** Resolves the active locale together with its dictionary. */
export async function getServerI18n(): Promise<{ locale: Locale; dict: Dictionary }> {
  const locale = await getLocale();
  return { locale, dict: await getDictionary(locale) };
}

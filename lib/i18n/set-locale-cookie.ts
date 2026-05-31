import type { Locale } from "./config";

const LOCALE_COOKIE = "NEXT_LOCALE";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Persists the chosen locale to the NEXT_LOCALE cookie (client-side) so the
 * server layout picks it up on the very next render — keeping the locale switch
 * instant and surviving navigation.
 */
export function setLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

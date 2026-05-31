// Locale configuration — single source of truth for supported languages.
// NO `server-only` here: the proxy (edge), client components, and unit tests
// all import these pure constants.

export const locales = ["vi", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "vi";

/** Narrows an arbitrary string to a supported `Locale`. */
export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

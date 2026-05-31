import type { Locale } from "./config";
import type vi from "./dictionaries/vi.json";

// Server-only by convention: `getDictionary` is invoked exclusively inside
// Server Components (layout/pages), which then pass plain serializable dict
// slices down to client components as props. The JSON never reaches the
// client bundle. (`server-only` is not installed in this project, so the
// build-time guard is enforced by this convention instead.)

// `en` is typed against `vi`'s shape so the two dictionaries can never drift
// out of key-parity without a compile error.
export type Dictionary = typeof vi;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  vi: () => import("./dictionaries/vi.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();

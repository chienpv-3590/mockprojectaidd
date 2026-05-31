"use client";

import { createContext, useContext } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries";

type I18nValue = { locale: Locale; dict: Dictionary };

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Provides the active locale + dictionary to client components. Mounted once in
 * the root layout with values resolved server-side from the NEXT_LOCALE cookie.
 */
export function I18nProvider({
  value,
  children,
}: {
  value: I18nValue;
  children: React.ReactNode;
}) {
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Reads the active locale + dictionary. Must be used under <I18nProvider>. */
export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}

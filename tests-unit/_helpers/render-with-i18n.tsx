/**
 * Drop-in replacement for `@testing-library/react`'s `render` that wraps the
 * tree in <I18nProvider> with the real VN dictionary. Client components using
 * `useI18n` throw without a provider, so every component test renders through
 * this wrapper. Re-exports the rest of testing-library (`screen`, `fireEvent`,
 * `within`, `waitFor`, …) so tests can swap a single import line.
 *
 * The `wrapper` option is forwarded to RTL, so `rerender` keeps the provider.
 */
import {
  render as rtlRender,
  type RenderOptions,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n/locale-context";
import viDict from "@/lib/i18n/dictionaries/vi.json";

function I18nWrapper({ children }: { children: ReactNode }) {
  return (
    <I18nProvider value={{ locale: "vi", dict: viDict }}>{children}</I18nProvider>
  );
}

export function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return rtlRender(ui, { wrapper: I18nWrapper, ...options });
}

export * from "@testing-library/react";

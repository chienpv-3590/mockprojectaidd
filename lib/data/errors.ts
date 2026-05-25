// Shared helper for the data access layer.
// Supabase errors come back as `{ code, message, ... }`.

/**
 * PostgREST error code returned when a queried table does not exist
 * in the schema cache (i.e. the migration hasn't been applied yet).
 *
 * We treat this as "degrade gracefully" rather than throwing — so the
 * home page renders an empty state instead of crashing while the
 * operator is mid-setup of the Supabase project.
 */
export const PG_TABLE_MISSING = "PGRST205";

/**
 * `true` if the Supabase error represents a missing table — safe to
 * swallow and fall back to an empty result.
 */
export function isMissingTable(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === PG_TABLE_MISSING;
}

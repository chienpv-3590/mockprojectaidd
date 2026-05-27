import type { SupabaseClient } from "@supabase/supabase-js";
import type { Department } from "./types";
import { isMissingTable } from "./errors";

/**
 * List all departments ordered by display_order.
 */
export async function listDepartments(supabase: SupabaseClient): Promise<Department[]> {
  const { data, error } = await supabase
    .from("departments")
    .select("code, name_vi, display_order")
    .order("display_order", { ascending: true });

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []) as Department[];
}

import { describe, it, expect } from "vitest";
import { isMissingTable, PG_TABLE_MISSING } from "@/lib/data/errors";

describe("lib/data/errors", () => {
  it("PG_TABLE_MISSING constant is PGRST205", () => {
    expect(PG_TABLE_MISSING).toBe("PGRST205");
  });

  it("isMissingTable() true for PGRST205", () => {
    expect(isMissingTable({ code: "PGRST205" })).toBe(true);
  });

  it("isMissingTable() false for other PG codes", () => {
    expect(isMissingTable({ code: "PGRST116" })).toBe(false);
    expect(isMissingTable({ code: "23505" })).toBe(false);
  });

  it("isMissingTable() false for null/undefined/primitive", () => {
    expect(isMissingTable(null)).toBe(false);
    expect(isMissingTable(undefined)).toBe(false);
    expect(isMissingTable("PGRST205")).toBe(false);
    expect(isMissingTable(0)).toBe(false);
  });

  it("isMissingTable() false for object without code", () => {
    expect(isMissingTable({ message: "boom" })).toBe(false);
    expect(isMissingTable({})).toBe(false);
  });
});

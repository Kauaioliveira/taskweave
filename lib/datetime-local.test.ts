import { describe, expect, it } from "vitest";
import { isoToDatetimeLocalValue } from "@/lib/datetime-local";

describe("isoToDatetimeLocalValue", () => {
  it("returns empty string for null or undefined", () => {
    expect(isoToDatetimeLocalValue(null)).toBe("");
    expect(isoToDatetimeLocalValue(undefined)).toBe("");
  });

  it("returns empty string for invalid iso", () => {
    expect(isoToDatetimeLocalValue("not-a-date")).toBe("");
  });

  it("accepts a Date instance", () => {
    const out = isoToDatetimeLocalValue(new Date("2025-06-07T12:30:00.000Z"));
    expect(out).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it("returns a YYYY-MM-DDTHH:mm shaped string for valid ISO string input", () => {
    const out = isoToDatetimeLocalValue("2025-06-07T12:30:00.000Z");
    expect(out).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});

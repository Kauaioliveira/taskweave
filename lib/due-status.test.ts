import { describe, expect, it } from "vitest";
import { getDueStatus } from "@/lib/due-status";

const now = new Date("2025-06-10T12:00:00.000Z");

describe("getDueStatus", () => {
  it("returns null without a due date", () => {
    expect(getDueStatus(null, now)).toBeNull();
    expect(getDueStatus(undefined, now)).toBeNull();
  });

  it("returns null for an invalid date", () => {
    expect(getDueStatus("not-a-date", now)).toBeNull();
  });

  it("flags past dates as overdue", () => {
    expect(getDueStatus("2025-06-10T11:59:00.000Z", now)).toBe("overdue");
  });

  it("flags dates within 48 hours as soon", () => {
    expect(getDueStatus(new Date("2025-06-11T12:00:00.000Z"), now)).toBe("soon");
    expect(getDueStatus("2025-06-12T12:00:00.000Z", now)).toBe("soon");
  });

  it("returns later beyond 48 hours", () => {
    expect(getDueStatus("2025-06-12T12:00:01.000Z", now)).toBe("later");
  });
});

import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "@/lib/relative-time";

const now = new Date("2025-06-10T12:00:00.000Z");

describe("formatRelativeTime", () => {
  it("returns just now for sub-minute differences", () => {
    expect(formatRelativeTime(new Date("2025-06-10T11:59:30.000Z"), now)).toBe("just now");
  });

  it("formats past and future values", () => {
    expect(formatRelativeTime(new Date("2025-06-07T12:00:00.000Z"), now)).toBe("3 days ago");
    expect(formatRelativeTime(new Date("2025-06-10T14:00:00.000Z"), now)).toBe("in 2 hours");
    expect(formatRelativeTime(new Date("2025-06-09T12:00:00.000Z"), now)).toBe("yesterday");
  });
});

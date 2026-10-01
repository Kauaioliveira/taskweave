import { describe, expect, it } from "vitest";
import { parseWorkspaceRole } from "@/lib/roles";

describe("parseWorkspaceRole", () => {
  it("accepts known roles", () => {
    expect(parseWorkspaceRole("OWNER")).toBe("OWNER");
    expect(parseWorkspaceRole("VIEWER")).toBe("VIEWER");
  });

  it("falls back for unknown or missing values", () => {
    expect(parseWorkspaceRole("ADMIN")).toBe("MEMBER");
    expect(parseWorkspaceRole(null, "VIEWER")).toBe("VIEWER");
  });
});

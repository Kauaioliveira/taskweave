import { describe, expect, it } from "vitest";
import { minimumRoleForBoardEdit, roleMeetsMinimum } from "@/lib/rbac";

describe("rbac", () => {
  it("VIEWER cannot edit boards by default threshold", () => {
    expect(roleMeetsMinimum("VIEWER", minimumRoleForBoardEdit())).toBe(false);
  });

  it("MEMBER can edit boards", () => {
    expect(roleMeetsMinimum("MEMBER", minimumRoleForBoardEdit())).toBe(true);
  });

  it("OWNER can edit boards", () => {
    expect(roleMeetsMinimum("OWNER", minimumRoleForBoardEdit())).toBe(true);
  });
});

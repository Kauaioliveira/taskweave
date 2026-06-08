import { describe, expect, it } from "vitest";
import { reorderCardIdsAfterDrop } from "@/lib/reorder-card-ids";

describe("reorderCardIdsAfterDrop", () => {
  const listId = "list-1";

  it("returns null when over is missing", () => {
    expect(reorderCardIdsAfterDrop(["a", "b", "c"], "b", undefined, listId)).toBeNull();
  });

  it("returns null when dropping a card onto itself (no reorder)", () => {
    expect(reorderCardIdsAfterDrop(["a", "b", "c"], "b", "card:b", listId)).toBeNull();
  });

  it("moves a card before another card in the same list", () => {
    expect(reorderCardIdsAfterDrop(["a", "b", "c", "d"], "d", "card:b", listId)).toEqual(["a", "d", "b", "c"]);
  });

  it("moves an earlier card to immediately before a later card", () => {
    expect(reorderCardIdsAfterDrop(["a", "b", "c"], "a", "card:c", listId)).toEqual(["b", "a", "c"]);
  });

  it("appends to the end when dropping on the list column", () => {
    expect(reorderCardIdsAfterDrop(["a", "b", "c"], "a", `list:${listId}`, listId)).toEqual(["b", "c", "a"]);
  });

  it("returns null when list id does not match column for list drop", () => {
    expect(reorderCardIdsAfterDrop(["a", "b"], "a", "list:other", listId)).toBeNull();
  });

  it("returns null when active id is not in the list", () => {
    expect(reorderCardIdsAfterDrop(["a", "b"], "x", "card:a", listId)).toBeNull();
  });
});

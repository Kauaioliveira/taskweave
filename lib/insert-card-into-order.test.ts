import { describe, expect, it } from "vitest";
import { insertCardIntoTargetOrder } from "@/lib/insert-card-into-order";

describe("insertCardIntoTargetOrder", () => {
  it("appends when beforeCardId is null", () => {
    expect(insertCardIntoTargetOrder(["a", "b"], "c", null)).toEqual(["a", "b", "c"]);
  });

  it("appends when beforeCardId is empty string", () => {
    expect(insertCardIntoTargetOrder(["a"], "b", "")).toEqual(["a", "b"]);
  });

  it("inserts before the given card", () => {
    expect(insertCardIntoTargetOrder(["a", "b", "c"], "x", "b")).toEqual(["a", "x", "b", "c"]);
  });

  it("throws if card is already in the target list", () => {
    expect(() => insertCardIntoTargetOrder(["a", "b"], "a", null)).toThrow(/already in target list/);
  });

  it("throws if beforeCardId is not in the list", () => {
    expect(() => insertCardIntoTargetOrder(["a", "b"], "x", "z")).toThrow(/Invalid target position/);
  });
});

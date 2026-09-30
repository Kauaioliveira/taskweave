import { describe, expect, it } from "vitest";
import { applyCardOrder } from "@/lib/apply-card-order";

const lists = [
  { id: "a", cards: [{ id: "1" }, { id: "2" }, { id: "3" }] },
  { id: "b", cards: [{ id: "4" }] },
];

const ids = (l: { cards: { id: string }[] }) => l.cards.map((c) => c.id);

describe("applyCardOrder", () => {
  it("reorders cards within a list", () => {
    const out = applyCardOrder(lists, { a: ["3", "1", "2"] });
    expect(ids(out[0]!)).toEqual(["3", "1", "2"]);
    expect(out[1]).toBe(lists[1]);
  });

  it("moves a card across lists and removes it from the source", () => {
    const out = applyCardOrder(lists, { b: ["2", "4"] });
    expect(ids(out[0]!)).toEqual(["1", "3"]);
    expect(ids(out[1]!)).toEqual(["2", "4"]);
  });

  it("does not mutate the input", () => {
    applyCardOrder(lists, { b: ["1", "4"] });
    expect(ids(lists[0]!)).toEqual(["1", "2", "3"]);
  });
});

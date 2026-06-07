import { describe, expect, it } from "vitest";
import { escapeHtml } from "./escape-html";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`a&b<c>"`)).toBe("a&amp;b&lt;c&gt;&quot;");
  });

  it("leaves plain text unchanged", () => {
    expect(escapeHtml("hello")).toBe("hello");
  });
});

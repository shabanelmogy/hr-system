import { describe, expect, it } from "vitest";
import { matchesConfirmationText } from "./confirmation";

describe("matchesConfirmationText", () => {
  it("accepts the exact keyword and harmless surrounding whitespace", () => {
    expect(matchesConfirmationText("DELETE", "DELETE")).toBe(true);
    expect(matchesConfirmationText("  DELETE  ", "DELETE")).toBe(true);
  });

  it("rejects missing, partial, and differently-cased values", () => {
    expect(matchesConfirmationText("", "DELETE")).toBe(false);
    expect(matchesConfirmationText("DEL", "DELETE")).toBe(false);
    expect(matchesConfirmationText("delete", "DELETE")).toBe(false);
  });

  it("rejects an empty configured keyword", () => {
    expect(matchesConfirmationText("", "  ")).toBe(false);
  });
});

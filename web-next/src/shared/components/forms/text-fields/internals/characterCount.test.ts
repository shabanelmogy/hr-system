import { describe, expect, it } from "vitest";
import { formatCharacterCount, getCharacterCount } from "./characterCount";

const options = {
  maxLength: 10,
  normalColor: "primary",
  warningColor: "warning",
  errorColor: "error",
  warningThreshold: 70,
  errorThreshold: 90,
};

describe("character counter", () => {
  it("calculates the current, remaining, and percentage values", () => {
    expect(getCharacterCount("hello", options)).toEqual({
      count: 5,
      remaining: 5,
      percentage: 50,
      color: "primary",
    });
  });

  it("formats every supported counter presentation", () => {
    const count = getCharacterCount("12345678", options);

    expect(formatCharacterCount(count, 10, "fraction")).toBe("8/10");
    expect(formatCharacterCount(count, 10, "remaining")).toBe("2 remaining");
    expect(formatCharacterCount(count, 10, "percentage")).toBe("80%");
  });
});

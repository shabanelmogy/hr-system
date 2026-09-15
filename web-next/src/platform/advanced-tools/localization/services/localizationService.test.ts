import { describe, expect, it } from "vitest";

import { parseLocalizationDictionary } from "./localizationService";

describe("localization response contract", () => {
  it("accepts a string dictionary", () => {
    expect(parseLocalizationDictionary({ hello: "Hello", goodbye: "Goodbye" })).toEqual({
      hello: "Hello",
      goodbye: "Goodbye",
    });
  });

  it("rejects compatibility coercion for non-string values", () => {
    expect(() => parseLocalizationDictionary({ count: 3 })).toThrow(
      "Invalid localization response",
    );
    expect(() => parseLocalizationDictionary(null)).toThrow("Invalid localization response");
  });
});

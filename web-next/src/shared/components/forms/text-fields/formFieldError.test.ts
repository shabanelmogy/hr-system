import { describe, expect, it } from "vitest";
import { getFormFieldError } from "./formFieldError";

describe("getFormFieldError", () => {
  it("reads flat and nested field errors", () => {
    const errors = {
      name: { message: "Name is required" },
      address: { country: { message: "Country is required" } },
    };

    expect(getFormFieldError(errors, "name")?.message).toBe("Name is required");
    expect(getFormFieldError(errors, "address.country")?.message).toBe(
      "Country is required",
    );
  });

  it("returns undefined for missing or malformed paths", () => {
    expect(getFormFieldError({}, "missing")).toBeUndefined();
    expect(getFormFieldError({ address: null }, "address.country")).toBeUndefined();
  });
});

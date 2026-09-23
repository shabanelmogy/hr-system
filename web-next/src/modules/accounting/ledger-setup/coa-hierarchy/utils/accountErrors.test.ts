import { describe, expect, it } from "vitest";
import { ApiClientError } from "@/lib/api/client";
import { isAccountCodeConflict } from "./accountErrors";

const conflict = (code: string) =>
  new ApiClientError({
    status: 409,
    title: "Conflict",
    message: "Conflict",
    code,
    fieldErrors: null,
    errors: null,
  });

describe("isAccountCodeConflict", () => {
  it("recognizes both domain duplicate and host unique-conflict responses", () => {
    expect(isAccountCodeConflict(conflict("Accounting.Account.Duplicate"))).toBe(
      true,
    );
    expect(isAccountCodeConflict(conflict("UniqueConstraintViolation"))).toBe(
      true,
    );
  });

  it("does not treat unrelated 409 conflicts as a code race", () => {
    expect(isAccountCodeConflict(conflict("Accounting.ConcurrencyConflict"))).toBe(
      false,
    );
  });
});

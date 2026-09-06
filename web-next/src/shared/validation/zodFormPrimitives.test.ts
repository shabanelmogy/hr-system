import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  formBoolean,
  optionalFormEmail,
  optionalFormId,
  optionalFormNonNegativeNumber,
} from "./zodFormPrimitives";

describe("Zod form primitives", () => {
  const schema = z.object({
    parentId: optionalFormId(),
    amount: optionalFormNonNegativeNumber(),
    enabled: formBoolean(),
    email: optionalFormEmail("Invalid email"),
  });

  it("accepts an object whose optional controls are completely omitted", () => {
    expect(schema.parse({})).toEqual({ enabled: false });
  });

  it("normalizes blank controls without creating hidden validation errors", () => {
    expect(schema.parse({ parentId: 0, amount: "", enabled: null, email: "  " }))
      .toEqual({ parentId: undefined, amount: undefined, enabled: false, email: undefined });
  });

  it("coerces valid form values and still rejects invalid ones", () => {
    expect(schema.parse({ parentId: "12", amount: "3.5", enabled: true, email: " user@example.com " }))
      .toEqual({ parentId: 12, amount: 3.5, enabled: true, email: "user@example.com" });
    expect(schema.safeParse({ parentId: -1 }).success).toBe(false);
    expect(schema.safeParse({ amount: -1 }).success).toBe(false);
    expect(schema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });
});

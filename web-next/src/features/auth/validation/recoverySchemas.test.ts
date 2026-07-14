import { describe, expect, it } from "vitest";
import {
  getEmailRecoverySchema,
  getResetPasswordLinkSchema,
  getResetPasswordSchema,
} from "./recoverySchemas";

const t = (key: string, options?: Record<string, unknown>) =>
  options?.count ? `${key}:${options.count}` : key;

describe("recovery schemas", () => {
  it("requires a valid email for recovery requests", () => {
    const schema = getEmailRecoverySchema(t);

    expect(schema.safeParse({ email: "" }).success).toBe(false);
    expect(schema.safeParse({ email: "invalid" }).success).toBe(false);
    expect(schema.safeParse({ email: "person@example.com" }).success).toBe(true);
  });

  it("requires both values from a reset link", () => {
    const schema = getResetPasswordLinkSchema(t);

    expect(schema.safeParse({ email: "", code: "" }).success).toBe(false);
    expect(
      schema.safeParse({ email: "person@example.com", code: "reset-code" }).success,
    ).toBe(true);
  });

  it("enforces the backend password policy", () => {
    const schema = getResetPasswordSchema(t);

    expect(
      schema.safeParse({
        email: "person@example.com",
        code: "reset-code",
        newPassword: "weak",
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        email: "person@example.com",
        code: "reset-code",
        newPassword: "StrongPass1!",
      }).success,
    ).toBe(true);
  });
});

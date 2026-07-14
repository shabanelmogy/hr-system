import { describe, expect, it } from "vitest";
import {
  getRegistrationValidationSchema,
  getValidationSchema,
} from "./validation";

const t = (key: string, options?: Record<string, unknown>) =>
  options?.count ? `${key}:${options.count}` : key;

const validRegistration = {
  firstName: "John",
  lastName: "Smith",
  userName: "johnsmith",
  email: "john@example.com",
  password: "StrongPass1!",
  confirmPassword: "StrongPass1!",
};

describe("registration schemas", () => {
  it("validates the complete registration payload", () => {
    const schema = getRegistrationValidationSchema(t);

    expect(schema.safeParse(validRegistration).success).toBe(true);
    expect(schema.safeParse({ ...validRegistration, confirmPassword: "Different1!" }).success).toBe(
      false,
    );
  });

  it("does not treat the final profile-picture step as an empty schema", () => {
    const schema = getValidationSchema(2, t);

    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse(validRegistration).success).toBe(true);
  });
});

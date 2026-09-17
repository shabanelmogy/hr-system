import { describe, expect, it } from "vitest";
import type { ResolverOptions } from "react-hook-form";
import type { Translator } from "../../types";
import {
  createLoginResolver,
  type LoginFormData,
} from "./loginValidation";

const t: Translator = (key, options) =>
  options?.count === undefined ? key : `${key}:${String(options.count)}`;

const resolverOptions: ResolverOptions<LoginFormData> = {
  criteriaMode: "firstError",
  fields: {},
  shouldUseNativeValidation: false,
};

const resolve = (values: LoginFormData) =>
  createLoginResolver(t)(values, undefined, resolverOptions);

describe("createLoginResolver", () => {
  it("trims valid credentials before submission", async () => {
    const result = await resolve({
      username: "  admin  ",
      password: "  secret  ",
    });

    expect(result).toEqual({
      values: { username: "admin", password: "secret" },
      errors: {},
    });
  });

  it("requires both username and password after trimming", async () => {
    const result = await resolve({ username: "   ", password: "   " });

    expect(result.errors.username?.message).toBe("validation.required");
    expect(result.errors.password?.message).toBe("validation.required");
  });

  it("preserves the username length constraints", async () => {
    const shortResult = await resolve({ username: "ab", password: "secret" });
    const longResult = await resolve({ username: "a".repeat(51), password: "secret" });

    expect(shortResult.errors.username?.message).toBe("validation.minLength:3");
    expect(longResult.errors.username?.message).toBe("validation.maxLength:50");
  });
});

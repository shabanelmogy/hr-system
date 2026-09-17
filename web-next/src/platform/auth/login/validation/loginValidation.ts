import type { FieldErrors, Resolver } from "react-hook-form";
import type { Translator } from "../../types";

export type LoginFormData = {
  username: string;
  password: string;
};

export const createLoginResolver = (t: Translator): Resolver<LoginFormData> =>
  (values) => {
    const username = values.username.trim();
    const password = values.password.trim();
    const errors: FieldErrors<LoginFormData> = {};

    if (!username) {
      errors.username = {
        type: "required",
        message: t("validation.required"),
      };
    } else if (username.length < 3) {
      errors.username = {
        type: "minLength",
        message: t("validation.minLength", { count: 3 }),
      };
    } else if (username.length > 50) {
      errors.username = {
        type: "maxLength",
        message: t("validation.maxLength", { count: 50 }),
      };
    }

    if (!password) {
      errors.password = {
        type: "required",
        message: t("validation.required"),
      };
    }

    if (Object.keys(errors).length > 0) {
      return { values: {} as Record<string, never>, errors };
    }

    return {
      values: { username, password },
      errors: {},
    };
  };

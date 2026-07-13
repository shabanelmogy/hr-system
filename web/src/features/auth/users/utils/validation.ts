import { email, englishOnly } from "@/constants";
import * as yup from "yup";

export const getUserValidationSchema = (t: any, isAddMode: boolean = false) => {
  return yup.object({
    // Required: First Name
    firstName: yup
      .string()
      .trim()
      .required(t("validation.required"))
      .min(2, t("validation.minLength", { count: 2 }))
      .max(50, t("validation.maxLength", { count: 50 }))
      .matches(englishOnly, t("validation.invalidEnglishName")),

    // Required: Last Name
    lastName: yup
      .string()
      .trim()
      .required(t("validation.required"))
      .min(2, t("validation.minLength", { count: 2 }))
      .max(50, t("validation.maxLength", { count: 50 }))
      .matches(englishOnly, t("validation.invalidEnglishName")),

    // Required: User Name
    userName: yup
      .string()
      .trim()
      .required(t("validation.required"))
      .min(3, t("validation.minLength", { count: 3 }))
      .max(30, t("validation.maxLength", { count: 30 }))
      .matches(englishOnly, t("validation.invalidEnglishName")),

    // Required: Email
    email: yup
      .string()
      .trim()
      .required(t("validation.required"))
      .max(100, t("validation.maxLength", { count: 100 }))
      .matches(email, t("validation.invalidEmail")),

    // Password: Conditional validation based on mode
    password: yup.string().when([], {
      is: () => isAddMode,
      then: (schema) =>
        schema
          .required(t("validation.required"))
          .min(8, t("validation.minLength", { count: 8 }))
          .max(128, t("validation.maxLength", { count: 128 }))
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            t("users.passwordRequirements") ||
              "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
          ),
      otherwise: (schema) =>
        schema
          .notRequired()
          .nullable()
          .when("password", {
            is: (value: any) => value && value.length > 0,
            then: (schema) =>
              schema
                .min(8, t("validation.minLength", { count: 8 }))
                .max(128, t("validation.maxLength", { count: 128 }))
                .matches(
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  t("users.passwordRequirements") ||
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                ),
            otherwise: (schema) => schema.notRequired(),
          }),
    }),

    // Confirm Password: Required if password is provided
    confirmPassword: yup
      .string()
      .notRequired()
      .nullable()
      .when("password", {
        is: (password: any) => password && password.length > 0,
        then: (schema) =>
          schema
            .required(t("validation.required"))
            .oneOf(
              [yup.ref("password")],
              t("validation.passwordsMustMatch") || "Passwords must match"
            ),
        otherwise: (schema) => schema.notRequired(),
      }),

    // Optional: Roles
    roles: yup
      .array()
      .of(yup.string())
      .min(1, t("users.atLeastOneRole"))
      .max(10, t("users.maxRoles", { count: 10 })),

    // Required: Account Status
    isDisabled: yup.boolean().required(t("validation.required")),
  });
};

export default getUserValidationSchema;

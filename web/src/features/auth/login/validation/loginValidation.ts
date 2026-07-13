import { password } from "@/constants/regex";
import * as yup from "yup";

export const createLoginValidationSchema = (t: any) => {
  return yup.object().shape({
    username: yup
      .string()
      .required(t("validation.required"))
      .min(3, t("validation.minLength", { count: 3 }))
      .max(50, t("validation.maxLength", { count: 50 }))
      .trim(),

    password: yup
      .string()
      .required(t("validation.required"))
      .min(8, t("validation.minLength", { count: 8 }))
      .max(128, t("validation.maxLength", { count: 128 }))
      // Optional: Add password strength validation
      .matches(password, t("validation.invalidPassword")),
  });
};

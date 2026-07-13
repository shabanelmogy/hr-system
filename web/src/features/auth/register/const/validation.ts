import { englishOnly, password } from "@/constants/regex";
import * as yup from "yup";

export const getValidationSchema = (activeStep: number, t: (key: string, options?: any) => string) => {
  const personalDetailsSchema = yup.object({
    firstName: yup
      .string()
      .required(t("validation.required"))
      .min(2, t("validation.minLength", { count: 2 }))
      .max(50, t("validation.maxLength", { count: 50 }))
      .matches(englishOnly, t("validation.invalidEnglishName")),
    lastName: yup
      .string()
      .required(t("validation.required"))
      .min(2, t("validation.minLength", { count: 2 }))
      .max(50, t("validation.maxLength", { count: 50 }))
      .matches(englishOnly, t("validation.invalidEnglishName")),
    userName: yup
      .string()
      .required(t("validation.required"))
      .min(3, t("validation.minLength", { count: 3 }))
      .max(30, t("validation.maxLength", { count: 30 }))
      .matches(englishOnly, t("validation.invalidUsername")),
  });

  const accountSecuritySchema = yup.object({
    email: yup
      .string()
      .required(t("validation.required"))
      .email(t("validation.invalidEmail")),
    password: yup
      .string()
      .required(t("validation.required"))
      .min(8, t("validation.invalidPassword", { count: 8 }))
      .matches(password, t("validation.invalidPassword")),
    confirmPassword: yup
      .string()
      .required(t("validation.invalidPassword"))
      .oneOf([yup.ref("password")], t("validation.passwordsMustMatch")),
  });

  if (activeStep === 0) return personalDetailsSchema;
  if (activeStep === 1) return accountSecuritySchema;

  return yup.object(); // default empty schema
};

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
      .trim(),
  });
};

import { password } from "@/constants/regex";
import * as yup from "yup";

const getPasswordChangeSchema = (t: (key: string, options?: any) => string) =>
  yup.object({
    currentPassword: yup.string().required(t("validation.required")),

    newPassword: yup
      .string()
      .required(t("validation.required"))
      .min(8, t("validation.minLength", { count: 8 }))
      .matches(password, t("validation.invalidPassword"))
      .notOneOf(
        [yup.ref("currentPassword")],
        t("validation.passwordMustNotBeCurrent")
      ),
  });

export default getPasswordChangeSchema;

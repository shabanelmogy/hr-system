import * as yup from "yup";

export const getRoleValidationSchema = (t: any) => {
  return yup.object({
    // Required: Role Name
    name: yup
      .string()
      .trim()
      .required(t("validation.required"))
      .min(2, t("validation.minLength", { count: 2 }))
      .max(50, t("validation.maxLength", { count: 50 }))
      .matches(
        /^[a-zA-Z\s]+$/,
        t("validation.englishOnly") ||
          "Role name can only contain letters and spaces"
      ),
  });
};

export const getRoleClaimsValidationSchema = () => {
  return yup.object({
    id: yup.string().required(),
    name: yup.string().required(),
    roleClaims: yup.array().of(
      yup.object({
        displayValue: yup.string().required(),
        isSelected: yup.boolean().required(),
      })
    ),
  });
};

export default getRoleValidationSchema;

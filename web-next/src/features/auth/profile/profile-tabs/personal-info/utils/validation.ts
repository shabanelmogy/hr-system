import * as yup from "yup";

// Function to generate the schema with translations
const getPersonalDetailsSchema = (t: (key: string, options?: any) => string) =>
  yup.object({
    firstName: yup
      .string()
      .required(t("validation.required"))
      .min(3, t("validation.minLengthError", { count: 3 }))
      .max(50, t("validation.maxLengthError", { count: 50 })),

    lastName: yup
      .string()
      .required(t("validation.required"))
      .min(3, t("validation.minLengthError", { count: 3 }))
      .max(50, t("validation.maxLengthError", { count: 50 })),

    userName: yup
      .string()
      .required(t("validation.required"))
      .min(3, t("validation.minLengthError", { count: 3 }))
      .max(50, t("validation.maxLengthError", { count: 50 })),
  });

export default getPersonalDetailsSchema;

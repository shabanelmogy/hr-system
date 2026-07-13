// District validation schemas
import { z } from "zod";

export type DistrictValidationSchema = z.infer<ReturnType<typeof getDistrictValidationSchema>>;

export const getDistrictValidationSchema = (t: (key: string) => string) => {
  return z.object({
    nameAr: z
      .string()
      .trim()
      .min(1, t("general.required"))
      .min(2, t("validation.minLength"))
      .max(100, t("validation.maxLength"))
      .regex(/^[\u0600-\u06FF\s]+$/, t("validation.arabicLettersOnly")),

    nameEn: z
      .string()
      .trim()
      .min(1, t("general.required"))
      .min(2, t("validation.minLength"))
      .max(100, t("validation.maxLength"))
      .regex(/^[A-Za-z\s]+$/, t("validation.englishLettersOnly")),

    code: z
      .string()
      .trim()
      .min(1, t("general.required"))
      .min(2, t("validation.minLength"))
      .max(10, t("validation.maxLength")),

    stateId: z
      .number()
      .min(1, t("general.required"))
      .positive(t("validation.positiveNumber"))
      .int(t("validation.integerNumber")),
  });
};
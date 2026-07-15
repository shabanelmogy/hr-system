// District validation schemas
import { z } from "zod";
import {
  arabicLettersAndSpacesPattern,
  englishLettersAndSpacesPattern,
  stateCodePattern,
} from "@/features/basic-data/geographical-information/validation/patterns";
import type { TFunction } from "i18next";

export type DistrictValidationSchema = z.infer<ReturnType<typeof getDistrictValidationSchema>>;

export const getDistrictValidationSchema = (t: TFunction) => {
  return z.object({
    nameAr: z
      .string()
      .trim()
      .min(1, t("general.required"))
      .min(2, t("validation.minLength", { count: 2 }))
      .max(100, t("validation.maxLength", { count: 100 }))
      .regex(arabicLettersAndSpacesPattern, t("validation.arabicOnly")),

    nameEn: z
      .string()
      .trim()
      .min(1, t("general.required"))
      .min(2, t("validation.minLength", { count: 2 }))
      .max(100, t("validation.maxLength", { count: 100 }))
      .regex(englishLettersAndSpacesPattern, t("validation.englishOnly")),

    code: z
      .string()
      .trim()
      .min(1, t("general.required"))
      .min(2, t("validation.minLength", { count: 2 }))
      .max(10, t("validation.maxLength", { count: 10 }))
      .regex(stateCodePattern, t("validation.invalidValues")),

    stateId: z.preprocess(
      (value) => (value === null || value === "" ? undefined : value),
      z
      .number({ message: t("validation.required") })
      .min(1, t("general.required"))
      .positive(t("validation.positiveNumber"))
      .int(t("validation.integerNumber")),
    ),
  });
};

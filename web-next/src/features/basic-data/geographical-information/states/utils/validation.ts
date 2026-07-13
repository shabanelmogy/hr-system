// State validation schemas
import { z } from "zod";
import {
  arabicLettersAndSpacesPattern,
  englishLettersAndSpacesPattern,
  stateCodePattern,
} from "@/features/basic-data/geographical-information/validation/patterns";

export type StateValidationSchema = z.infer<ReturnType<typeof getStateValidationSchema>>;

export const getStateValidationSchema = (t: (key: string) => string) => {
  return z.object({
    nameAr: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(2, t("validation.minLength"))
      .max(100, t("validation.maxLength"))
      .regex(arabicLettersAndSpacesPattern, t("validation.arabicOnly")),

    nameEn: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(2, t("validation.minLength"))
      .max(100, t("validation.maxLength"))
      .regex(englishLettersAndSpacesPattern, t("validation.englishOnly")),

    code: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(2, t("validation.minLength"))
      .max(10, t("validation.maxLength"))
      .regex(stateCodePattern, t("validation.invalidValues")),

    countryId: z
      .number()
      .min(1, t("validation.required"))
      .positive(t("validation.positiveNumber"))
      .int(t("validation.integerNumber")),
  });
};

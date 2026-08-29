// State validation schemas
import { z } from "zod";
import { stateCodePattern } from "@/features/basic-data/geographical-information/validation/patterns";
import { createGeographicalNameSchema } from "@/features/basic-data/geographical-information/validation/nameValidation";
import type { TFunction } from "i18next";

export type StateValidationSchema = z.infer<ReturnType<typeof getStateValidationSchema>>;

export const getStateValidationSchema = (t: TFunction) => {
  return z.object({
    nameAr: createGeographicalNameSchema(t),

    nameEn: createGeographicalNameSchema(t),

    code: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(2, t("validation.minLength", { count: 2 }))
      .max(10, t("validation.maxLength", { count: 10 }))
      .regex(stateCodePattern, t("validation.invalidValues")),

    countryId: z.preprocess(
      (value) => (value === null || value === "" ? undefined : value),
      z
      .number({ message: t("validation.required") })
      .min(1, t("validation.required"))
      .positive(t("validation.positiveNumber"))
      .int(t("validation.integerNumber")),
    ),
  });
};

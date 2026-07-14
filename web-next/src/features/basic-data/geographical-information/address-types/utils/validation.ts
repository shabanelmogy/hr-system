import { z } from "zod";
import {
  arabicLettersAndSpacesPattern,
  englishLettersAndSpacesPattern,
} from "@/features/basic-data/geographical-information/validation/patterns";

export type AddressTypeValidationSchema = z.infer<ReturnType<typeof getAddressTypeValidationSchema>>;

export const getAddressTypeValidationSchema = (t: (key: string, options?: any) => string) => {
  return z.object({
    // Required: Arabic Name
    nameAr: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(2, t("validation.minLength", { count: 2 }))
      .max(100, t("validation.maxLength", { count: 100 }))
      .regex(arabicLettersAndSpacesPattern, t("validation.arabicOnly")),

    // Required: English Name
    nameEn: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(2, t("validation.minLength", { count: 2 }))
      .max(100, t("validation.maxLength", { count: 100 }))
      .regex(englishLettersAndSpacesPattern, t("validation.englishOnly")),
  });
};

export default getAddressTypeValidationSchema;

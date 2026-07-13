import { arabicOnly, englishOnly } from "@/constants";
import { z } from "zod";

export type AddressTypeValidationSchema = z.infer<ReturnType<typeof getAddressTypeValidationSchema>>;

export const getAddressTypeValidationSchema = (t: (key: string) => string) => {
  return z.object({
    // Required: Arabic Name
    nameAr: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(2, t("validation.minLength"))
      .max(100, t("validation.maxLength"))
      .regex(arabicOnly, t("validation.invalidArabicName")),

    // Required: English Name
    nameEn: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(2, t("validation.minLength"))
      .max(100, t("validation.maxLength"))
      .regex(englishOnly, t("validation.invalidEnglishName")),
  });
};

export default getAddressTypeValidationSchema;

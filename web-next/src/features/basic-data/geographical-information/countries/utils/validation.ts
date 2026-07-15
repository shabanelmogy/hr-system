import {
  arabicLettersAndSpacesPattern,
  currencyCodePattern,
  englishLettersAndSpacesPattern,
  internationalPhoneCodePattern,
  isoAlpha2CodePattern,
  isoAlpha3CodePattern,
} from "@/features/basic-data/geographical-information/validation/patterns";
import type { TFunction } from "i18next";
import { z } from "zod";

export const getCountryValidationSchema = (t: TFunction) => {
  return z.object({
    // Required: Arabic Name
    nameAr: z
      .string({ message: t("validation.required") })
      .trim()
      .min(2, t("validation.minLength", { count: 2 }))
      .max(100, t("validation.maxLength", { count: 100 }))
      .regex(arabicLettersAndSpacesPattern, t("validation.invalidArabicName")),

    // Required: English Name
    nameEn: z
      .string({ message: t("validation.required") })
      .trim()
      .min(2, t("validation.minLength", { count: 2 }))
      .max(100, t("validation.maxLength", { count: 100 }))
      .regex(englishLettersAndSpacesPattern, t("validation.invalidEnglishName")),

    // Optional: Alpha2 Code
    alpha2Code: z
      .string()
      .default("")
      .transform((val) => val.toUpperCase())
      .refine((val) => !val || isoAlpha2CodePattern.test(val), {
        message: t("countries.invalidAlpha2Code")
      }),

    // Optional: Alpha3 Code
    alpha3Code: z
      .string()
      .default("")
      .transform((val) => val.toUpperCase())
      .refine((val) => !val || isoAlpha3CodePattern.test(val), {
        message: t("countries.invalidAlpha3Code")
      }),

    // Optional: Phone Code
    phoneCode: z
      .string()
      .default("")
      .refine((val) => !val || internationalPhoneCodePattern.test(val), {
        message: t("countries.invalidPhoneCode")
      }),

    // Optional: Currency Code
    currencyCode: z
      .string()
      .default("")
      .transform((val) => val.toUpperCase())
      .refine((val) => !val || currencyCodePattern.test(val), {
        message: t("countries.invalidCurrency")
      }),
  });
};

export default getCountryValidationSchema;

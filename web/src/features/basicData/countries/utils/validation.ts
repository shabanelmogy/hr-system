import {
  arabicOnly,
  englishOnly,
  flexNumber,
  uppercaseCode,
} from "@/constants";
import { z } from "zod";

export const getCountryValidationSchema = (t: any) => {
  return z.object({
    // Required: Arabic Name
    nameAr: z
      .string({ message: t("validation.required") })
      .trim()
      .min(2, t("validation.minLength", { count: 2 }))
      .max(100, t("validation.maxLength", { count: 100 }))
      .regex(arabicOnly, t("validation.invalidArabicName")),

    // Required: English Name
    nameEn: z
      .string({ message: t("validation.required") })
      .trim()
      .min(2, t("validation.minLength", { count: 2 }))
      .max(100, t("validation.maxLength", { count: 100 }))
      .regex(englishOnly, t("validation.invalidEnglishName")),

    // Optional: Alpha2 Code
    alpha2Code: z
      .string()
      .default("")
      .transform((val) => val.toUpperCase())
      .refine((val) => !val || uppercaseCode(2).test(val), {
        message: t("countries.invalidAlpha2Code")
      }),

    // Optional: Alpha3 Code
    alpha3Code: z
      .string()
      .default("")
      .transform((val) => val.toUpperCase())
      .refine((val) => !val || uppercaseCode(3).test(val), {
        message: t("countries.invalidAlpha3Code")
      }),

    // Optional: Phone Code
    phoneCode: z
      .string()
      .default("")
      .refine((val) => !val || flexNumber.range(1, 5).test(val), {
        message: t("countries.invalidPhoneCode")
      }),

    // Optional: Currency Code
    currencyCode: z
      .string()
      .default("")
      .transform((val) => val.toUpperCase())
      .refine((val) => !val || uppercaseCode(3).test(val), {
        message: t("countries.invalidCurrency")
      }),
  });
};

export default getCountryValidationSchema;

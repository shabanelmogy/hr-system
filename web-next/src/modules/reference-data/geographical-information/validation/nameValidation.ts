import type { TFunction } from "i18next";
import { z } from "zod";

const forbiddenCharactersPattern = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;

export function isValidGeographicalName(value: string): boolean {
  return value.trim().length > 0 && !forbiddenCharactersPattern.test(value);
}

export function createGeographicalNameSchema(t: TFunction) {
  return z
    .string({ message: t("validation.required") })
    .trim()
    .transform((value) => value.normalize("NFC"))
    .pipe(
      z
        .string()
        .min(2, t("validation.minLength", { count: 2 }))
        .max(100, t("validation.maxLength", { count: 100 }))
        .refine((value) => !value || isValidGeographicalName(value), {
          message: t("validation.invalidText"),
        }),
    );
}

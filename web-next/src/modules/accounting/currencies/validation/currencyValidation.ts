import { z } from "zod";
import type { TFunction } from "i18next";

export const getCurrencySchema = (t: TFunction) => z.object({
  currencyCode: z.string().trim().regex(/^[A-Za-z]{3}$/, t("currencies.validation.code")),
  nameEn: z.string().trim().min(2, t("currencies.validation.name")).max(100, t("currencies.validation.name")),
  nameAr: z.string().trim().min(2, t("currencies.validation.name")).max(100, t("currencies.validation.name")),
  symbol: z.string().trim().min(1, t("currencies.validation.symbol")).max(10, t("currencies.validation.symbol")),
});

export type CurrencyFormValues = z.infer<ReturnType<typeof getCurrencySchema>>;

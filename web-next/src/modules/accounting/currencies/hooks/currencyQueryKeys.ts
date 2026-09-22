import type { CurrencyPageQuery } from "../types/Currency";

export const currencyKeys = {
  all: ["currencies"] as const,
  pages: () => [...currencyKeys.all, "page"] as const,
  page: (query: CurrencyPageQuery) => [...currencyKeys.pages(), query] as const,
  details: () => [...currencyKeys.all, "detail"] as const,
  detail: (id: number) => [...currencyKeys.details(), id] as const,
  lookup: () => [...currencyKeys.all, "lookup"] as const,
};

import type { CountryPageQuery } from "../types/Country";

export const countryKeys = {
  all: ["countries"] as const,
  pages: () => [...countryKeys.all, "page"] as const,
  page: (query: CountryPageQuery) => [...countryKeys.pages(), query] as const,
  lookup: () => [...countryKeys.all, "lookup"] as const,
  details: () => [...countryKeys.all, "detail"] as const,
  detail: (id: number) => [...countryKeys.details(), id] as const,
};

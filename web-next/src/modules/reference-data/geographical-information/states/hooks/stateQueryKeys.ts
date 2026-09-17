import type { StatePageQuery } from "../types/State";

export const stateKeys = {
  all: ["states"] as const,
  pages: () => [...stateKeys.all, "page"] as const,
  page: (query: StatePageQuery) => [...stateKeys.pages(), query] as const,
  lookup: (countryId?: number) => [...stateKeys.all, "lookup", countryId ?? "all"] as const,
  details: () => [...stateKeys.all, "detail"] as const,
  detail: (id: number) => [...stateKeys.details(), id] as const,
  withDistricts: (id: number) => [...stateKeys.all, "districts", id] as const,
};

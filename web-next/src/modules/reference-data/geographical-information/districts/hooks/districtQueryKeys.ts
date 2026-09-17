import type { DistrictPageQuery } from "../types/District";

export const districtKeys = {
  all: ["districts"] as const,
  pages: () => [...districtKeys.all, "page"] as const,
  page: (query: DistrictPageQuery) => [...districtKeys.pages(), query] as const,
  lookup: (stateId?: number) => [...districtKeys.all, "lookup", stateId ?? "all"] as const,
  details: () => [...districtKeys.all, "detail"] as const,
  detail: (id: number) => [...districtKeys.details(), id] as const,
  withAddresses: (id: number) => [...districtKeys.all, "addresses", id] as const,
};

import type { AddressTypePageQuery } from "../types/AddressType";

export const addressTypeKeys = {
  all: ["addressTypes"] as const,
  list: () => [...addressTypeKeys.all, "list"] as const,
  page: (query: AddressTypePageQuery) => [...addressTypeKeys.list(), query] as const,
};

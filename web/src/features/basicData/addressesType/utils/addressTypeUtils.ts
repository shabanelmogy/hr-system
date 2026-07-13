import type { AddressType } from "../types/AddressType";

// Returns only non-deleted address types
export const getActiveAddressTypes = (items: AddressType[] = []): AddressType[] =>
  items.filter((a) => !(a as any)?.isDeleted);

// Safely returns a display name based on locale preference
export const getAddressTypeDisplayName = (
  item: Partial<AddressType> | undefined | null,
  locale: "ar" | "en" = "en"
): string => {
  if (!item) return "";
  const nameAr = (item as any).nameAr ?? "";
  const nameEn = (item as any).nameEn ?? "";
  return locale === "ar" ? nameAr || nameEn || "" : nameEn || nameAr || "";
};

// Returns count of address types with option to include deleted
export const getAddressTypesCount = (
  items: AddressType[] = [],
  includeDeleted: boolean = false
): number => (includeDeleted ? items.length : getActiveAddressTypes(items).length);

// Formats items for select components
export const formatAddressTypesForSelect = (
  items: AddressType[] = [],
  locale: "ar" | "en" = "en"
): { value: string | number; label: string }[] =>
  getActiveAddressTypes(items).map((a) => ({
    value: a.id,
    label: getAddressTypeDisplayName(a, locale),
  }));

// Client-side search across English/Arabic names
export const searchAddressTypes = (
  items: AddressType[] = [],
  searchTerm: string
): AddressType[] => {
  if (!searchTerm?.trim()) return getActiveAddressTypes(items);
  const term = searchTerm.toLowerCase().trim();
  return getActiveAddressTypes(items).filter(
    (item) => item.nameEn?.toLowerCase().includes(term) || item.nameAr?.includes(term)
  );
};

export default {
  getActiveAddressTypes,
  getAddressTypeDisplayName,
  getAddressTypesCount,
  formatAddressTypesForSelect,
  searchAddressTypes,
};

import type { AddressType } from "../../types/AddressType";
import type { AddressTypePermissionSet } from "../../utils/addressTypePermissions";

export interface AddressTypeCardProps {
  addressType: AddressType;
  index: number;
  isHovered: boolean;
  onHover: (id: number | null) => void;
  onEdit: (item: AddressType) => void;
  onDelete: (item: AddressType) => void;
  onRestore: (item: AddressType) => void;
  onView: (item: AddressType) => void;
  permissions: AddressTypePermissionSet;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}

export interface AddressTypeCardChipsProps {
  addressType: AddressType;
}

export interface EmptyStateProps {
  onAdd?: () => void;
}

export interface NoResultsStateProps {
  searchTerm: string;
  onClearSearch: () => void;
  onClearFilters?: () => void;
  onRefresh?: () => void;
}

export interface AddressTypeCardViewPaginationProps {
  page: number;
  rowsPerPage: number;
  totalItems: number;
  itemsPerPageOptions: number[];
  pinned?: boolean;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

export interface AddressTypeCardViewHeaderProps {
  searchTerm: string;
  searchField: "all" | "nameAr" | "nameEn";
  searchOperator: "contains" | "doesNotContain" | "equals" | "doesNotEqual" | "startsWith" | "endsWith";
  sortBy: "nameAr" | "nameEn" | "createdOn";
  sortOrder: "ASC" | "DESC";
  filterBy: "active" | "archived" | "all";
  totalCount: number;
  page: number;
  onSearchChange: (value: string) => void;
  onSearchFieldChange: (value: AddressTypeCardViewHeaderProps["searchField"]) => void;
  onSearchOperatorChange: (value: AddressTypeCardViewHeaderProps["searchOperator"]) => void;
  onSortChange: (column: AddressTypeCardViewHeaderProps["sortBy"], direction: AddressTypeCardViewHeaderProps["sortOrder"]) => void;
  onFilterChange: (value: AddressTypeCardViewHeaderProps["filterBy"]) => void;
  onReset: () => void;
  selectedCount: number;
  canBulkArchive: boolean;
  isBulkArchiving: boolean;
  onBulkArchive: () => void;
}

export interface AddressTypesCardViewProps {
  items: AddressType[];
  loading: boolean;
  onEdit: (item: AddressType) => void;
  onDelete: (item: AddressType) => void;
  onRestore: (item: AddressType) => void;
  onView: (item: AddressType) => void;
  onAdd: () => void;
  onRefresh: () => void;
  permissions: AddressTypePermissionSet;
  page: number;
  pageSize: number;
  totalCount: number;
  hasActiveCriteria: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onClearCriteria: () => void;
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
}

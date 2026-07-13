import { SelectChangeEvent } from "@mui/material";
import type { AddressType } from "../../types/AddressType";

export interface AddressTypeCardProps {
  addressType: AddressType;
  index: number;
  isHovered: boolean;
  isHighlighted: boolean;
  highlightLabel?: string | null;
  onEdit: (addressType: AddressType) => void;
  onDelete: (addressType: AddressType) => void;
  onView: (addressType: AddressType) => void;
  onHover: (id: string | number | null) => void;
}

export interface CardViewHeaderProps {
  searchTerm: string;
  sortBy: string;
  sortOrder: string;
  filterBy: string;
  processedAddressTypesLength: number;
  page: number;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onFilterByChange: (value: string) => void;
  onClearSearch: () => void;
  onReset: () => void;
}

export interface CardViewPaginationProps {
  page: number;
  rowsPerPage: number;
  totalItems: number;
  itemsPerPageOptions: number[];
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: SelectChangeEvent<number>) => void;
}

export interface AddressTypesCardViewProps {
  items: AddressType[];
  loading: boolean;
  onEdit: (addressType: AddressType) => void;
  onDelete: (addressType: AddressType) => void;
  onView: (addressType: AddressType) => void;
  onAdd: () => void;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

export interface AddressTypeCardFooterProps {
  addressType: AddressType;
  onView: (addressType: AddressType) => void;
  onEdit: (addressType: AddressType) => void;
  onDelete: (addressType: AddressType) => void;
}

export interface AddressTypeCardChipsProps {
  addressType: AddressType;
}

export interface EmptyStateProps {
  onAdd: () => void;
}

export interface NoResultsStateProps {
  searchTerm: string;
  onClearSearch: () => void;
  onClearFilters?: () => void;
  onRefresh?: () => void;
}
import { SelectChangeEvent } from "@mui/material";
import type { CountryListItem, CountrySortColumn, CountryStatus } from "../../types/Country";

export interface CountryCardProps {
  country: CountryListItem;
  index: number;
  isHovered: boolean;
  isHighlighted: boolean;
  highlightLabel?: string | null;
  onEdit: (country: CountryListItem) => void;
  onDelete: (country: CountryListItem) => void;
  onRestore: (country: CountryListItem) => void;
  onView: (country: CountryListItem) => void;
  onHover: (id: string | number | null) => void;
  permissions: CountryActionPermissions;
}

export interface CountryActionPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
}

export interface CountryCardViewHeaderProps {
  searchTerm: string;
  sortBy: CountrySortColumn;
  sortOrder: "ASC" | "DESC";
  filterBy: CountryStatus;
  currencyCode: string;
  hasStatesFilter: "all" | "with" | "without";
  processedCountriesLength: number;
  page: number;
  onSearchChange: (value: string) => void;
  onSortChange: (column: CountrySortColumn, direction: "ASC" | "DESC") => void;
  onFilterByChange: (value: CountryStatus) => void;
  onCurrencyCodeChange: (value: string) => void;
  onHasStatesFilterChange: (value: "all" | "with" | "without") => void;
  onClearSearch: () => void;
  onReset: () => void;
}

export interface CountryCardViewPaginationProps {
  page: number;
  rowsPerPage: number;
  totalItems: number;
  itemsPerPageOptions: number[];
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: SelectChangeEvent<number>) => void;
}

export interface CountriesCardViewProps {
  countries: CountryListItem[];
  loading: boolean;
  onEdit: (country: CountryListItem) => void;
  onDelete: (country: CountryListItem) => void;
  onRestore: (country: CountryListItem) => void;
  onView: (country: CountryListItem) => void;
  onAdd: () => void;
  onRefresh: () => void;
  permissions: CountryActionPermissions & { canCreate: boolean };
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
  page: number;
  pageSize: number;
  totalCount: number;
  hasActiveCriteria: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onClearCriteria: () => void;
}

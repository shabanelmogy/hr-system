import type {
  CountryListItem,
  CountrySearchField,
  CountrySearchOperator,
  CountrySortColumn,
  CountryStatus,
} from "../../types/Country";

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
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}

export interface CountryActionPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
}

export interface CountryCardViewHeaderProps {
  searchTerm: string;
  searchField: CountrySearchField;
  searchOperator: CountrySearchOperator;
  sortBy: CountrySortColumn;
  sortOrder: "ASC" | "DESC";
  filterBy: CountryStatus;
  processedCountriesLength: number;
  page: number;
  onSearchChange: (value: string) => void;
  onSearchFieldChange: (value: CountrySearchField) => void;
  onSearchOperatorChange: (value: CountrySearchOperator) => void;
  onSortChange: (column: CountrySortColumn, direction: "ASC" | "DESC") => void;
  onFilterByChange: (value: CountryStatus) => void;
  onClearSearch: () => void;
  onReset: () => void;
  selectedCount: number;
  canBulkArchive: boolean;
  isBulkArchiving: boolean;
  onBulkArchive: () => void;
}

export interface CountryCardViewPaginationProps {
  page: number;
  rowsPerPage: number;
  totalItems: number;
  itemsPerPageOptions: number[];
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
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
  selectedCountryIds: number[];
  onSelectedCountryIdsChange: (ids: number[]) => void;
}

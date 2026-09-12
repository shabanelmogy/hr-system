import type {
  DistrictListItem,
  DistrictSearchField,
  DistrictSearchOperator,
  DistrictSortColumn,
  DistrictStatus,
} from "../../types/District";
import type { DistrictPermissionSet } from "../../utils/districtPermissions";

export interface DistrictCardProps {
  state: DistrictListItem;
  index: number;
  isHovered: boolean;
  isHighlighted: boolean;
  highlightLabel?: string | null;
  onEdit: (state: DistrictListItem) => void;
  onDelete: (state: DistrictListItem) => void;
  onRestore: (state: DistrictListItem) => void;
  onView: (state: DistrictListItem) => void;
  onHover: (id: string | number | null) => void;
  permissions: DistrictPermissionSet;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}

export interface DistrictCardViewHeaderProps {
  searchTerm: string;
  searchField: DistrictSearchField;
  searchOperator: DistrictSearchOperator;
  sortBy: DistrictSortColumn;
  sortOrder: "ASC" | "DESC";
  filterBy: DistrictStatus;
  processedDistrictsLength: number;
  page: number;
  onSearchChange: (value: string) => void;
  onSearchFieldChange: (value: DistrictSearchField) => void;
  onSearchOperatorChange: (value: DistrictSearchOperator) => void;
  onSortChange: (column: DistrictSortColumn, direction: "ASC" | "DESC") => void;
  onFilterByChange: (value: DistrictStatus) => void;
  onClearSearch: () => void;
  onReset: () => void;
  selectedCount: number;
  canBulkArchive: boolean;
  isBulkArchiving: boolean;
  onBulkArchive: () => void;
}

export interface DistrictCardViewPaginationProps {
  page: number;
  rowsPerPage: number;
  totalItems: number;
  itemsPerPageOptions: number[];
  pinned?: boolean;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

export interface DistrictsCardViewProps {
  districts: DistrictListItem[];
  loading: boolean;
  onEdit: (state: DistrictListItem) => void;
  onDelete: (state: DistrictListItem) => void;
  onRestore: (state: DistrictListItem) => void;
  onView: (state: DistrictListItem) => void;
  onAdd: () => void;
  onRefresh: () => void;
  permissions: DistrictPermissionSet;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
  page: number;
  pageSize: number;
  totalCount: number;
  searchValue: string;
  hasActiveCriteria: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onClearCriteria: () => void;
  selectedDistrictIds: number[];
  onSelectedDistrictIdsChange: (ids: number[]) => void;
}

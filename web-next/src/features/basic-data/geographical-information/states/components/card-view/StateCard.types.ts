import type {
  StateListItem,
  StateSearchField,
  StateSearchOperator,
  StateSortColumn,
  StateStatus,
} from "../../types/State";
import type { StatePermissionSet } from "../../utils/statePermissions";

export interface StateCardProps {
  state: StateListItem;
  index: number;
  isHovered: boolean;
  isHighlighted: boolean;
  highlightLabel?: string | null;
  onEdit: (state: StateListItem) => void;
  onDelete: (state: StateListItem) => void;
  onRestore: (state: StateListItem) => void;
  onView: (state: StateListItem) => void;
  onHover: (id: string | number | null) => void;
  permissions: StatePermissionSet;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}

export interface StateCardViewHeaderProps {
  searchTerm: string;
  searchField: StateSearchField;
  searchOperator: StateSearchOperator;
  sortBy: StateSortColumn;
  sortOrder: "ASC" | "DESC";
  filterBy: StateStatus;
  processedStatesLength: number;
  page: number;
  onSearchChange: (value: string) => void;
  onSearchFieldChange: (value: StateSearchField) => void;
  onSearchOperatorChange: (value: StateSearchOperator) => void;
  onSortChange: (column: StateSortColumn, direction: "ASC" | "DESC") => void;
  onFilterByChange: (value: StateStatus) => void;
  onClearSearch: () => void;
  onReset: () => void;
  selectedCount: number;
  canBulkArchive: boolean;
  isBulkArchiving: boolean;
  onBulkArchive: () => void;
}

export interface StateCardViewPaginationProps {
  page: number;
  rowsPerPage: number;
  totalItems: number;
  itemsPerPageOptions: number[];
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

export interface StatesCardViewProps {
  states: StateListItem[];
  loading: boolean;
  onEdit: (state: StateListItem) => void;
  onDelete: (state: StateListItem) => void;
  onRestore: (state: StateListItem) => void;
  onView: (state: StateListItem) => void;
  onAdd: () => void;
  onRefresh: () => void;
  permissions: StatePermissionSet;
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
  selectedStateIds: number[];
  onSelectedStateIdsChange: (ids: number[]) => void;
}

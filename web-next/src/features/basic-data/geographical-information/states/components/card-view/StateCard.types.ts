import { SelectChangeEvent } from "@mui/material";
import type { State } from "../../types/State";

export interface StateCardProps {
  state: State;
  index: number;
  isHovered: boolean;
  isHighlighted: boolean;
  highlightLabel?: string | null;
  onEdit: (state: State) => void;
  onDelete: (state: State) => void;
  onView: (state: State) => void;
  onHover: (id: string | number | null) => void;
}

export interface CardViewHeaderProps {
  searchTerm: string;
  sortBy: string;
  sortOrder: string;
  filterBy: string;
  processedStatesLength: number;
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

export interface StatesCardViewProps {
  states: State[];
  loading: boolean;
  onEdit: (state: State) => void;
  onDelete: (state: State) => void;
  onView: (state: State) => void;
  onAdd: () => void;
  onRefresh: () => void;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

import { SelectChangeEvent } from "@mui/material";
import type { District } from "../../types/District";

export interface DistrictCardProps {
  district: District;
  index: number;
  isHovered: boolean;
  isHighlighted: boolean;
  highlightLabel?: string | null;
  onEdit: (district: District) => void;
  onDelete: (district: District) => void;
  onView: (district: District) => void;
  onHover: (id: string | number | null) => void;
}

export interface CardViewHeaderProps {
  searchTerm: string;
  sortBy: string;
  sortOrder: string;
  filterBy: string;
  processedDistrictsLength: number;
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

export interface DistrictsCardViewProps {
  districts: District[];
  loading: boolean;
  onEdit: (district: District) => void;
  onDelete: (district: District) => void;
  onView: (district: District) => void;
  onAdd: () => void;
  onRefresh: () => void;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}

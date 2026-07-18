import { Grid } from "@mui/material";
import { FilterSelect } from "./header-controls/FilterSelect";
import { ResetButton } from "./header-controls/ResetButton";
import { SearchBar } from "./header-controls/SearchBar";
import { SortBySelect } from "./header-controls/SortBySelect";
import { SortOrderToggle } from "./header-controls/SortOrderToggle";
import type { FilterOption, SortOption } from "./header-controls/types";

export interface CardViewToolbarProps {
  searchTerm: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  sortBy: string;
  sortByOptions: SortOption[];
  onSortByChange: (value: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
  filterBy: string;
  filterOptions: FilterOption[];
  onFilterByChange: (value: string) => void;
  onReset: () => void;
}

const CardViewToolbar = ({
  searchTerm,
  searchPlaceholder,
  onSearchChange,
  onClearSearch,
  sortBy,
  sortByOptions,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  filterBy,
  filterOptions,
  onFilterByChange,
  onReset,
}: CardViewToolbarProps) => (
  <Grid container spacing={2} sx={{ alignItems: "center" }}>
    <Grid size={{ xs: 12, md: 4 }} sx={{ mb: 1 }}>
      <SearchBar
        searchTerm={searchTerm}
        placeholder={searchPlaceholder}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
      />
    </Grid>

    <Grid size={{ xs: 6, md: 2 }}>
      <SortBySelect sortBy={sortBy} options={sortByOptions} onChange={onSortByChange} />
    </Grid>

    <Grid size={{ xs: 6, md: 2 }}>
      <SortOrderToggle sortOrder={sortOrder} onChange={onSortOrderChange} />
    </Grid>

    <Grid size={{ xs: 12, md: 2 }}>
      <FilterSelect filterBy={filterBy} options={filterOptions} onChange={onFilterByChange} />
    </Grid>

    <Grid size={{ xs: 12, md: 2 }}>
      <ResetButton onReset={onReset} />
    </Grid>
  </Grid>
);

export default CardViewToolbar;

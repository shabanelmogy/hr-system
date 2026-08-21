import { Grid } from "@mui/material";
import { FilterSelect } from "./header-controls/FilterSelect";
import { CardViewOptionsButton } from "./header-controls/CardViewOptionsButton";
import { ResetButton } from "./header-controls/ResetButton";
import { SearchBar } from "./header-controls/SearchBar";
import { SortBySelect } from "./header-controls/SortBySelect";
import { SortOrderToggle } from "./header-controls/SortOrderToggle";
import type { FilterOption, SortOption } from "./header-controls/types";
import type { ReactNode } from "react";

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
  beforeSearchControls?: ReactNode;
  additionalControls?: ReactNode;
  optionsContent?: (closeMenu: () => void) => ReactNode;
  optionsLabel?: string;
  showFilter?: boolean;
  singleRow?: boolean;
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
  beforeSearchControls,
  additionalControls,
  optionsContent,
  optionsLabel,
  showFilter = true,
  singleRow = false,
}: CardViewToolbarProps) => (
  <Grid
    container
    spacing={singleRow ? 1 : 2}
    sx={{
      alignItems: "center",
      flexWrap: "wrap",
    }}
  >
    {beforeSearchControls}

    <Grid
      size={singleRow ? { xs: 12, sm: 6, lg: "grow" } : { xs: 12, md: 4 }}
      sx={{
        mb: singleRow ? 0 : 1,
        minWidth: singleRow ? { lg: 220 } : undefined,
      }}
    >
      <SearchBar
        searchTerm={searchTerm}
        placeholder={searchPlaceholder}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
        margin="none"
      />
    </Grid>

    <Grid size={singleRow ? { xs: 6, sm: 3, lg: 2 } : { xs: 6, md: 2 }}>
      <SortBySelect sortBy={sortBy} options={sortByOptions} onChange={onSortByChange} />
    </Grid>

    <Grid size={singleRow ? { xs: 6, sm: 3, lg: 1.25 } : { xs: 6, md: 2 }}>
      <SortOrderToggle sortOrder={sortOrder} onChange={onSortOrderChange} />
    </Grid>

    {showFilter && (
      <Grid size={singleRow ? { xs: 6, sm: 3, lg: 1.75 } : { xs: 12, md: 2 }}>
        <FilterSelect filterBy={filterBy} options={filterOptions} onChange={onFilterByChange} />
      </Grid>
    )}

    {additionalControls}

    <Grid
      size={singleRow ? { xs: 6, sm: 3, lg: "auto" } : { xs: 12, md: 2 }}
      sx={{ minWidth: singleRow ? { lg: 110 } : undefined }}
    >
      <ResetButton onReset={onReset} height={40} />
    </Grid>

    {optionsContent && optionsLabel && (
      <Grid size={singleRow ? { xs: 6, sm: 3, lg: "auto" } : { xs: 12, md: 2 }}>
        <CardViewOptionsButton label={optionsLabel}>{optionsContent}</CardViewOptionsButton>
      </Grid>
    )}
  </Grid>
);

export default CardViewToolbar;

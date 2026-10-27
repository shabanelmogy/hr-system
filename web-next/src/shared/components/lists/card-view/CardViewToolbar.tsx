import { Grid } from "@mui/material";
import { FilterSelect } from "./header-controls/FilterSelect";
import { CardViewOptionsButton } from "./header-controls/CardViewOptionsButton";
import { ResetButton } from "./header-controls/ResetButton";
import { SearchBar } from "./header-controls/SearchBar";
import { SortBySelect } from "./header-controls/SortBySelect";
import { SortOrderToggle } from "./header-controls/SortOrderToggle";
import type { FilterOption, SortOption } from "./header-controls/types";
import type { ReactNode } from "react";

interface ToolbarControls {
  searchTerm: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onReset: () => void;
  beforeSearchControls?: ReactNode;
  additionalControls?: ReactNode;
  optionsContent?: (closeMenu: () => void) => ReactNode;
  optionsLabel?: string;
  /** Additional criteria row; the feature supplies shared fields inside Grid items. */
  filterControls?: ReactNode;
  singleRow?: boolean;
}

type SortControls = {
  showSort?: true;
  sortBy: string;
  sortByOptions: SortOption[];
  onSortByChange: (value: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
} | {
  /** For server lists whose API has a fixed order; never render inert sorting. */
  showSort: false;
};

type FilterControls = {
  showFilter?: true;
  filterBy: string;
  filterOptions: FilterOption[];
  onFilterByChange: (value: string) => void;
} | {
  showFilter: false;
  // Existing consumers can still supply controlled filter values while hiding this control.
  filterBy?: string;
  filterOptions?: FilterOption[];
  onFilterByChange?: (value: string) => void;
};

export type CardViewToolbarProps = ToolbarControls & SortControls & FilterControls;

const CardViewToolbar = (props: CardViewToolbarProps) => {
  const {
    searchTerm,
    searchPlaceholder,
    onSearchChange,
    onClearSearch,
    onReset,
    beforeSearchControls,
    additionalControls,
    optionsContent,
    optionsLabel,
    filterControls,
    singleRow = false,
  } = props;
  return (
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

      {props.showSort !== false && <>
        <Grid size={singleRow ? { xs: 6, sm: 3, lg: 2 } : { xs: 6, md: 2 }}>
          <SortBySelect sortBy={props.sortBy} options={props.sortByOptions} onChange={props.onSortByChange} />
        </Grid>
        <Grid size={singleRow ? { xs: 6, sm: 3, lg: 1.25 } : { xs: 6, md: 2 }}>
          <SortOrderToggle sortOrder={props.sortOrder} onChange={props.onSortOrderChange} />
        </Grid>
      </>}

      {props.showFilter !== false && (
        <Grid size={singleRow ? { xs: 6, sm: 3, lg: 1.75 } : { xs: 12, md: 2 }}>
          <FilterSelect filterBy={props.filterBy} options={props.filterOptions} onChange={props.onFilterByChange} />
        </Grid>
      )}

      {additionalControls}

      <Grid
        size={singleRow ? { xs: props.showSort === false ? 12 : 6, sm: 3, lg: "auto" } : { xs: 12, md: 2 }}
        sx={{ minWidth: singleRow ? { lg: 110 } : undefined }}
      >
        <ResetButton onReset={onReset} height={40} />
      </Grid>

      {optionsContent && optionsLabel && (
        <Grid size={singleRow ? { xs: 6, sm: 3, lg: "auto" } : { xs: 12, md: 2 }}>
          <CardViewOptionsButton label={optionsLabel}>{optionsContent}</CardViewOptionsButton>
        </Grid>
      )}
      {filterControls && <Grid size={12}>
        <Grid container spacing={1.5} sx={{ alignItems: "flex-start" }}>{filterControls}</Grid>
      </Grid>}
    </Grid>
  );
};

export default CardViewToolbar;

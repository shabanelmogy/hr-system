import { Paper, alpha, useTheme, Grid } from "@mui/material";
import { TitleSection } from "./TitleSection";
import { SearchBar } from "./SearchBar";
import { SortBySelect } from "./SortBySelect";
import { SortOrderToggle } from "./SortOrderToggle";
import { FilterSelect } from "./FilterSelect";
import { QuickActions } from "./QuickActions";

export interface SortOption {
  value: string;
  label: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface UnifiedCardViewHeaderProps {
  // Visual
  title: string;
  subtitle?: string;
  mainChipLabel: string; // e.g. `${processedItemsLength} Countries`

  // Paging
  page: number; // zero-based

  // Search
  searchTerm: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;

  // Sort / Filter
  sortBy: string;
  sortByOptions: SortOption[];
  onSortByChange: (value: string) => void;

  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;

  filterBy: string;
  filterOptions: FilterOption[];
  onFilterByChange: (value: string) => void;

  // Actions
  onReset: () => void;
}

const UnifiedCardViewHeader = ({
  title,
  subtitle,
  mainChipLabel,
  page,
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
}: UnifiedCardViewHeaderProps) => {
  const theme = useTheme();

  // Since SearchBar is controlled via `searchTerm`, we don't need to imperatively clear the input here
  const clearSearchField = () => {};

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        borderRadius: 3,
      }}
    >
      {/* Title Section */}
      <TitleSection title={title} subtitle={subtitle} mainChipLabel={mainChipLabel} page={page} />

      {/* Search and Filter Controls */}
      <Grid container spacing={2} sx={{ alignItems: "center" }}>
        {/* Search Bar */}
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
          <QuickActions
            searchTerm={searchTerm}
            onClearSearch={onClearSearch}
            onReset={onReset}
            clearSearchField={clearSearchField}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UnifiedCardViewHeader;
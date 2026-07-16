import { Paper, alpha, useTheme, Grid } from "@mui/material";
import { FilterSelect } from "./header-controls/FilterSelect";
import { ResetButton } from "./header-controls/ResetButton";
import { SearchBar } from "./header-controls/SearchBar";
import { SortBySelect } from "./header-controls/SortBySelect";
import { SortOrderToggle } from "./header-controls/SortOrderToggle";
import { TitleSection } from "./header-controls/TitleSection";
import type { FilterOption, SortOption } from "./header-controls/types";

export interface CardViewHeaderProps {
  title: string;
  subtitle?: string;
  mainChipLabel: string;
  page: number;
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

const CardViewHeader = ({
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
}: CardViewHeaderProps) => {
  const theme = useTheme();

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
          <ResetButton onReset={onReset} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CardViewHeader;

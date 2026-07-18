import { Paper, alpha, useTheme } from "@mui/material";
import CardViewToolbar from "./CardViewToolbar";
import type { CardViewToolbarProps } from "./CardViewToolbar";
import { TitleSection } from "./header-controls/TitleSection";

export interface CardViewHeaderProps extends CardViewToolbarProps {
  title: string;
  subtitle?: string;
  mainChipLabel: string;
  page: number;
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
      <TitleSection title={title} subtitle={subtitle} mainChipLabel={mainChipLabel} page={page} />
      <CardViewToolbar
        searchTerm={searchTerm}
        searchPlaceholder={searchPlaceholder}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
        sortBy={sortBy}
        sortByOptions={sortByOptions}
        onSortByChange={onSortByChange}
        sortOrder={sortOrder}
        onSortOrderChange={onSortOrderChange}
        filterBy={filterBy}
        filterOptions={filterOptions}
        onFilterByChange={onFilterByChange}
        onReset={onReset}
      />
    </Paper>
  );
};

export default CardViewHeader;

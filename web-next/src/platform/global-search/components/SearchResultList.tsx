import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import type { GlobalSearchResult } from "../types";

interface SearchResultListProps {
  results: readonly GlobalSearchResult[];
  selectedIndex: number;
  listboxId: string;
  resultLabel: string;
  onSelect: (result: GlobalSearchResult) => void;
  onHighlight: (index: number) => void;
}

export function SearchResultList({
  results,
  selectedIndex,
  listboxId,
  resultLabel,
  onSelect,
  onHighlight,
}: SearchResultListProps) {
  const theme = useTheme();

  return (
    <List
      id={listboxId}
      role="listbox"
      aria-label={resultLabel}
      disablePadding
      sx={{ py: 0.5 }}
    >
      {results.map((result, index) => (
        <ListItemButton
          key={result.id}
          id={`${listboxId}-option-${index}`}
          role="option"
          aria-selected={selectedIndex === index}
          selected={selectedIndex === index}
          onClick={() => onSelect(result)}
          onMouseEnter={() => onHighlight(index)}
          sx={{
            minHeight: 54,
            mx: 0.75,
            my: 0.25,
            borderRadius: 1,
          }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: "primary.main" }}>
            {result.icon ?? <SearchRoundedIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText
            primary={result.title}
            secondary={
              result.breadcrumbs.length > 0
                ? [...result.breadcrumbs, result.title].join(" / ")
                : result.category
            }
            slotProps={{
              primary: { noWrap: true, sx: { fontWeight: 600 } },
              secondary: { noWrap: true },
            }}
          />
          <ChevronRightRoundedIcon
            color="action"
            sx={{
              flexShrink: 0,
              transform: theme.direction === "rtl" ? "scaleX(-1)" : undefined,
            }}
          />
        </ListItemButton>
      ))}
    </List>
  );
}

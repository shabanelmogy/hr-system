import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import type { GlobalSearchHistoryItem } from "../types";

interface SearchHistoryProps {
  items: readonly GlobalSearchHistoryItem[];
  title: string;
  clearLabel: string;
  removeLabel: (title: string) => string;
  onSelect: (item: GlobalSearchHistoryItem) => void;
  onRemove: (item: GlobalSearchHistoryItem) => void;
  onClear: () => void;
}

export function SearchHistory({
  items,
  title,
  clearLabel,
  removeLabel,
  onSelect,
  onRemove,
  onClear,
}: SearchHistoryProps) {
  if (items.length === 0) return null;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          pt: 1.5,
        }}
      >
        <Typography variant="subtitle2">{title}</Typography>
        <Button size="small" color="inherit" onClick={onClear}>
          {clearLabel}
        </Button>
      </Box>
      <List disablePadding sx={{ py: 0.5 }}>
        {items.map((item) => (
          <ListItem
            key={`${item.path}-${item.term}`}
            disablePadding
            secondaryAction={
              <Tooltip title={removeLabel(item.title)}>
                <IconButton
                  edge="end"
                  size="small"
                  aria-label={removeLabel(item.title)}
                  onClick={() => onRemove(item)}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          >
            <ListItemButton
              onClick={() => onSelect(item)}
              sx={{ mx: 0.75, borderRadius: 1, pe: 7 }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>
                <HistoryRoundedIcon fontSize="small" color="action" />
              </ListItemIcon>
              <ListItemText
                primary={item.term}
                secondary={item.title}
                slotProps={{
                  primary: { noWrap: true },
                  secondary: { noWrap: true },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}


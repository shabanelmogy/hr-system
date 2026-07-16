import { IconButton, alpha, useTheme } from "@mui/material";
import { Clear, Search } from "@mui/icons-material";
import MyTextField from "@/shared/components/forms/MyTextField";

export interface SearchBarProps {
  searchTerm: string;
  placeholder: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, placeholder, onSearchChange, onClearSearch }) => {
  const theme = useTheme();

  return (
    <MyTextField
      fieldName="search"
      labelKey={null}
      placeholder={placeholder}
      value={searchTerm}
      register={() => ({
        onChange: (event: unknown) => {
          if (event && typeof event === "object" && "target" in event) {
            const target = (event as { target?: { value?: unknown } }).target;
            onSearchChange(String(target?.value ?? ""));
          }
        },
      })}
      startIcon={<Search color="action" />}
      size="small"
      showClearButton={false}
      endAdornment={
        <IconButton
          aria-label="clear search"
          onClick={onClearSearch}
          disabled={!searchTerm}
          edge="end"
          size="small"
        >
          <Clear fontSize="small" />
        </IconButton>
      }
      showCounter={false}
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          "&:hover": {
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
          },
        },
      }}
    />
  );
};

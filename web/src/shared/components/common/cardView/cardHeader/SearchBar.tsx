import React, { useRef } from "react";
import { IconButton, alpha, useTheme } from "@mui/material";
import { Clear, Search } from "@mui/icons-material";
import { MyTextField } from "@/shared/components";

export interface SearchBarProps {
  searchTerm: string;
  placeholder: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, placeholder, onSearchChange, onClearSearch }) => {
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const clearSearchField = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  return (
    <MyTextField
      fieldName="search"
      labelKey={null as any}
      placeholder={placeholder}
      value={searchTerm}
      register={() => ({
        onChange: (e: any) => onSearchChange(e.target.value),
      })}
      inputRef={inputRef}
      startIcon={<Search color="action" />}
      size="small"
      showClearButton={false}
      endAdornment={
        <IconButton
          aria-label="clear search"
          onClick={() => {
            clearSearchField();
            onClearSearch();
          }}
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

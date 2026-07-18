import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from "@mui/material";
import type { KeyboardEvent, Ref } from "react";

interface SearchFieldProps {
  value: string;
  placeholder: string;
  clearLabel: string;
  isSearching: boolean;
  listboxId: string;
  activeOptionId?: string;
  inputRef?: Ref<HTMLInputElement>;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export function SearchField({
  value,
  placeholder,
  clearLabel,
  isSearching,
  listboxId,
  activeOptionId,
  inputRef,
  autoFocus = false,
  onChange,
  onClear,
  onKeyDown,
}: SearchFieldProps) {
  return (
    <TextField
      fullWidth
      value={value}
      inputRef={inputRef}
      autoFocus={autoFocus}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isSearching && <CircularProgress size={18} thickness={5} />}
              {value && (
                <Tooltip title={clearLabel}>
                  <IconButton
                    size="small"
                    onClick={onClear}
                    aria-label={clearLabel}
                    edge="end"
                  >
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </InputAdornment>
          ),
        },
        htmlInput: {
          role: "combobox",
          "aria-label": placeholder,
          "aria-autocomplete": "list",
          "aria-controls": listboxId,
          "aria-expanded": value.length > 0,
          "aria-activedescendant": activeOptionId,
          autoComplete: "off",
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 1,
        },
      }}
    />
  );
}


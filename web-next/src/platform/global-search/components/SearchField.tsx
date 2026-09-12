import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { CircularProgress } from "@mui/material";
import { MyTextField } from "@/shared/components/forms";
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
    <MyTextField
      counter={false}
      clearButtonAriaLabel={clearLabel}
      endAdornment={isSearching ? <CircularProgress size={18} thickness={5} /> : null}
      fieldName="globalSearch"
      labelKey={null}
      maxValue={200}
      value={value}
      inputRef={inputRef}
      autoFocus={autoFocus}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      onClear={onClear}
      onKeyDown={onKeyDown}
      showClearButton
      startIcon={<SearchRoundedIcon color="action" />}
      slotProps={{
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


import {
  InputAdornment,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import { useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import ClearFieldButton from "./internals/ClearFieldButton";

interface TextFieldWithClearProps
  extends Omit<TextFieldProps, "value" | "onChange" | "label" | "inputRef"> {
  searchText: string;
  handleSearch: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  loading?: boolean;
  handleClearSearch: () => void;
  label?: string;
}

const TextFieldWithClear = ({
  searchText,
  handleSearch,
  loading = false,
  handleClearSearch,
  label = "search",
  ...props
}: TextFieldWithClearProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const onClearClick = () => {
    handleClearSearch();
    inputRef.current?.focus();
  };

  return (
    <TextField
      {...props}
      label={t(label)}
      variant="outlined"
      fullWidth
      value={searchText}
      onChange={handleSearch}
      disabled={loading}
      sx={{ width: "100%", ...props.sx }}
      autoComplete="off"
      inputRef={inputRef}
      onFocus={(event) => {
        setFocused(true);
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        props.onBlur?.(event);
      }}
      slotProps={{
        inputLabel: { shrink: Boolean(searchText) || focused },
        input: {
          endAdornment: searchText ? (
            <InputAdornment position="end">
              <ClearFieldButton
                ariaLabel="clear search"
                onClick={onClearClick}
                disabled={loading}
                edge="end"
              />
            </InputAdornment>
          ) : null,
        },
      }}
    />
  );
};

export default TextFieldWithClear;

import ClearIcon from "@mui/icons-material/Clear";
import {
  IconButton,
  InputAdornment,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import { useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

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
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      slotProps={{
        inputLabel: { shrink: Boolean(searchText) || focused },
        input: {
          endAdornment: searchText ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="clear search"
                onClick={onClearClick}
                disabled={loading}
                edge="end"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
    />
  );
};

export default TextFieldWithClear;

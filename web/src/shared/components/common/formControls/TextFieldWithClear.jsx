import { useState, useRef } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

const TextFieldWithClear = ({
  searchText,
  handleSearch,
  loading = false,
  handleClearSearch,
  label = "search",
  ...props
}) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  // Handle label position when text is cleared
  const onClearClick = () => {
    handleClearSearch();

    // Keep focus on the input element after clearing
    // This ensures proper handling of the floating label
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <TextField
      label={t(label)}
      variant="outlined"
      fullWidth
      value={searchText}
      onChange={handleSearch}
      disabled={loading}
      sx={{ width: "100%" }}
      autoComplete="off"
      inputRef={inputRef}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      // This ensures label behaves correctly
      slotProps={{
        inputLabel: {
          shrink: Boolean(searchText) || focused,
        },
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
        }
      }}
      {...props}
    />
  );
};

TextFieldWithClear.propTypes = {
  searchText: PropTypes.string,
  handleSearch: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  handleClearSearch: PropTypes.func.isRequired,
  label: PropTypes.string,
};

export default TextFieldWithClear;

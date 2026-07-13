/* eslint-disable react/prop-types */
import { FormControl, TextField, Box, Autocomplete, Chip } from "@mui/material";
import { useTheme } from "@mui/material";

const MySelectMultiple = ({
  dataSource = [],
  selectedItem, // For single select
  selectedItems = [], // For multi select
  handleSelectionChange,
  loading = false,
  label,
  displayValue,
  displayMember,
  all = true,
  showClearButton = false,
  isMulti = false, // Flag to enable multi-select
  limitTags = 3, // Limit displayed tags before showing "+X"
  placeholder = "",
}) => {
  const theme = useTheme();
  const isRTL = theme.direction === "rtl";

  // All option (only for single select)
  const allOption =
    all && !isMulti
      ? { [displayValue]: 0, [displayMember]: isRTL ? "الكل" : "All" }
      : null;

  // Determine the selected value(s)
  const selectedValue = isMulti
    ? dataSource.filter((item) =>
        selectedItems?.includes(item[displayValue])
      ) || []
    : selectedItem === 0 && all
    ? allOption
    : dataSource.find((item) => item[displayValue] === selectedItem) || null;

  // Handle selection change
  const handleChange = (event, newValue) => {
    if (isMulti) {
      // For multi-select: return array of selected values
      const values = newValue?.map((item) => item[displayValue]) || [];
      handleSelectionChange({ target: { value: values } });
    } else {
      // For single-select: return selected value or default
      if (!newValue) {
        handleSelectionChange({ target: { value: all ? 0 : "" } });
      } else {
        handleSelectionChange({ target: { value: newValue[displayValue] } });
      }
    }
  };

  return (
    <Box>
      <FormControl sx={{ width: "100%" }}>
        <Autocomplete
          multiple={isMulti}
          options={all && !isMulti ? [allOption, ...dataSource] : dataSource}
          getOptionLabel={(option) => option?.[displayMember] || ""}
          value={selectedValue}
          onChange={handleChange}
          disabled={loading}
          disableClearable={!showClearButton}
          limitTags={limitTags}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip
                key={option[displayValue]}
                label={option[displayMember]}
                {...getTagProps({ index })}
                size="small"
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={placeholder}
              InputProps={{
                ...params.InputProps,
                autoComplete: "new-password", // Disable browser autocomplete
              }}
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option?.[displayValue] === value?.[displayValue]
          }
        />
      </FormControl>
    </Box>
  );
};

export default MySelectMultiple;

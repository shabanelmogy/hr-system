/* eslint-disable react/prop-types */
import { FormControl, TextField, Box, Autocomplete } from "@mui/material";
import { useTheme } from "@mui/material";

const MySelect = ({
  dataSource,
  selectedItem,
  handleSelectionChange,
  loading,
  label,
  displayValue,
  displayMember,
  all = true,
  showClearButton = false, // Default to true since Autocomplete handles this well
}) => {
  const theme = useTheme();
  const isRTL = theme.direction === "rtl";

  // Find the selected option object from dataSource
  const selectedOption =
    dataSource.find((item) => item[displayValue] === selectedItem) || null;

  // All option
  const allOption = all
    ? { [displayValue]: 0, [displayMember]: isRTL ? "الكل" : "All" }
    : null;

  // Handle selection change
  const handleChange = (event, newValue) => {
    if (!newValue) {
      // If clearing the selection
      handleSelectionChange({ target: { value: all ? 0 : "" } });
    } else {
      // Normal selection
      handleSelectionChange({ target: { value: newValue[displayValue] } });
    }
  };

  return (
    <Box>
      <FormControl sx={{ width: "100%" }}>
        <Autocomplete
          options={all ? [allOption, ...dataSource] : dataSource}
          getOptionLabel={(option) => option?.[displayMember] || ""}
          value={selectedItem === 0 && all ? allOption : selectedOption}
          onChange={handleChange}
          disabled={loading}
          disableClearable={!showClearButton}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              slotProps={{
                ...params.slotProps,
                htmlInput: {
                  ...params.inputProps, // Fallback for v6
                  ...(params.slotProps?.htmlInput || {}),
                  autoComplete: "new-password", // Disable browser autocomplete
                },
              }}
            />
          )}
          isOptionEqualToValue={(option, value) => {
            return option?.[displayValue] === value?.[displayValue];
          }}
        />
      </FormControl>
    </Box>
  );
};

export default MySelect;

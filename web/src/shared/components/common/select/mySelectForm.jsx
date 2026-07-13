// @ts-nocheck
/* eslint-disable react/prop-types */
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  TextField,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Close } from "@mui/icons-material";

/**
 * A reusable, form-integrated Autocomplete component using Material-UI.
 * It supports both single and multiple selections with enhanced chip styling.
 */
const MySelectForm = ({
  // Main props
  control,
  name,
  label,
  dataSource = [],
  valueMember,
  displayMember,
  colorMember, // New prop for chip color

  // Behavior props
  multiple = false,
  loading = false,
  disabled = false,
  placeholder = "",
  showClearButton = false,
  limitTags = 3,
  sx = {},
  isViewMode = false, // New prop for view mode
  filterSelectedOptions = true,

  // Chip styling props
  defaultChipColor = "primary",
  chipVariant = "outlined",
  chipSize = "small",
  showDeleteIcon = true,

  // Error handling (same pattern as MyTextField)
  errors = {},
  actualFieldName, // Alternative to name for error lookup

  // Event handlers
  onChange: customOnChange = null,

  // Loading and empty state props
  loadingText,
  noOptionsText,
}) => {
  const { t } = useTranslation();

  // ==========================================
  // COMPATIBILITY LAYER (same as MyTextField)
  // ==========================================
  const errorFieldName = actualFieldName || name;

  // Validate essential props
  if (!control || !name || !valueMember || !displayMember) {
    console.error(
      "MySelectForm Error: The 'control', 'name', 'valueMember', and 'displayMember' props are required."
    );
    return null;
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange: fieldOnChange, value, onBlur },
      }) => {
        // Determines the currently selected value(s) from the dataSource.
        const getSelectedValue = () => {
          if (multiple) {
            // For multi-select, 'value' is an array of IDs. Find the corresponding objects.
            return (
              dataSource.filter((item) => value?.includes(item[valueMember])) || []
            );
          }
          // For single-select, 'value' is a single ID. Find the corresponding object.
          return (
            dataSource.find((item) => item[valueMember] === value) || null
          );
        };

        // Get chip color for an option
        const getChipColor = (option) => {
          if (colorMember && option[colorMember]) {
            return option[colorMember];
          }
          return defaultChipColor;
        };

        return (
          <FormControl sx={{ width: "100%", ...sx }}>
            <Autocomplete
              multiple={multiple}
              options={dataSource}
              loading={loading}
              getOptionLabel={(option) => option?.[displayMember] || ""}
              value={getSelectedValue()}
              onChange={(event, newValue) => {
                // Format the new value to be just the ID(s) for the form state.
                const formattedValue = multiple
                  ? newValue?.map((item) => item[valueMember]) || []
                  : newValue?.[valueMember] || null;

                // Update the form state.
                fieldOnChange(formattedValue);
                if (customOnChange) {
                  customOnChange(event, newValue);
                }
              }}
              onBlur={onBlur}
              disabled={loading || disabled || isViewMode}
              disableClearable={!showClearButton}
              limitTags={limitTags}
              filterSelectedOptions={filterSelectedOptions}
              isOptionEqualToValue={(option, val) =>
                option?.[valueMember] === val?.[valueMember]
              }
              renderTags={(tagValue, getTagProps) =>
                multiple
                  ? tagValue.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option[valueMember] || index}
                        label={option[displayMember]}
                        color={getChipColor(option)}
                        variant={chipVariant}
                        size={chipSize}
                        deleteIcon={
                          !isViewMode && showDeleteIcon ? <Close /> : undefined
                        }
                        onDelete={
                          !isViewMode && showDeleteIcon
                            ? getTagProps({ index }).onDelete
                            : undefined
                        }
                        sx={{
                          margin: 0.25,
                          "& .MuiChip-deleteIcon": {
                            fontSize: 16,
                          },
                        }}
                      />
                    ))
                  : undefined
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={label}
                  placeholder={
                    loading
                      ? loadingText || t("loading") || "Loading..."
                      : placeholder || t("search") || "Search..."
                  }
                  error={!!errors[errorFieldName]}
                  helperText={errors[errorFieldName]?.message}
                  autoComplete="off"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Chip
                    label={option[displayMember]}
                    size="small"
                    color={getChipColor(option)}
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                </Box>
              )}
              noOptionsText={
                loading
                  ? loadingText || t("loading") || "Loading..."
                  : noOptionsText || t("noOptionsFound") || "No options found"
              }
              loadingText={loadingText || t("loading") || "Loading..."}
            />
          </FormControl>
        );
      }}
    />
  );
};

export default MySelectForm;
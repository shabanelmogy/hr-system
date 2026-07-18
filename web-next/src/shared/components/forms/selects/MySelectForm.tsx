import { Close } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  TextField,
  type ChipProps,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode, SyntheticEvent } from "react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { getFormFieldError } from "../text-fields/formFieldError";

type OptionKey<TOption extends object> = Extract<keyof TOption, string>;

interface MySelectFormProps<
  TFormValues extends FieldValues,
  TOption extends object,
> {
  control: Control<TFormValues>;
  name: Path<TFormValues>;
  label: ReactNode;
  dataSource?: readonly TOption[];
  valueMember: OptionKey<TOption>;
  displayMember: OptionKey<TOption>;
  colorMember?: OptionKey<TOption>;
  multiple?: boolean;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  showClearButton?: boolean;
  limitTags?: number;
  sx?: SxProps<Theme>;
  isViewMode?: boolean;
  filterSelectedOptions?: boolean;
  defaultChipColor?: ChipProps["color"];
  chipVariant?: ChipProps["variant"];
  chipSize?: ChipProps["size"];
  showDeleteIcon?: boolean;
  errors?: FieldErrors<TFormValues>;
  actualFieldName?: Path<TFormValues>;
  onChange?: (
    event: SyntheticEvent,
    value: TOption | readonly TOption[] | null,
  ) => void;
  loadingText?: string;
  noOptionsText?: string;
}

const chipColors: ReadonlySet<NonNullable<ChipProps["color"]>> = new Set([
  "default",
  "primary",
  "secondary",
  "error",
  "info",
  "success",
  "warning",
]);

const MySelectForm = <
  TFormValues extends FieldValues,
  TOption extends object,
>({
  control,
  name,
  label,
  dataSource = [],
  valueMember,
  displayMember,
  colorMember,
  multiple = false,
  loading = false,
  disabled = false,
  required = false,
  placeholder = "",
  showClearButton = false,
  limitTags = 3,
  sx = {},
  isViewMode = false,
  filterSelectedOptions = true,
  defaultChipColor = "primary",
  chipVariant = "outlined",
  chipSize = "small",
  showDeleteIcon = true,
  errors = {},
  actualFieldName,
  onChange: customOnChange,
  loadingText,
  noOptionsText,
}: MySelectFormProps<TFormValues, TOption>) => {
  const { t } = useTranslation();
  const errorFieldName = actualFieldName ?? name;
  const suppliedFieldError = getFormFieldError(errors, errorFieldName);

  const getChipColor = (option: TOption): ChipProps["color"] => {
    if (!colorMember) return defaultChipColor;
    const color = option[colorMember];
    return typeof color === "string" &&
      chipColors.has(color as NonNullable<ChipProps["color"]>)
      ? (color as ChipProps["color"])
      : defaultChipColor;
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange: fieldOnChange, value, onBlur },
        fieldState,
      }) => {
        const fieldError = suppliedFieldError ?? fieldState.error;
        const selectedValue = multiple
          ? dataSource.filter(
              (item) =>
                Array.isArray(value) && value.includes(item[valueMember]),
            )
          : dataSource.find((item) => item[valueMember] === value) ?? null;

        return (
          <FormControl fullWidth sx={sx}>
            <Autocomplete<TOption, boolean, boolean, false>
              multiple={multiple}
              options={[...dataSource]}
              loading={loading}
              getOptionLabel={(option) => String(option[displayMember] ?? "")}
              value={selectedValue}
              onChange={(event, newValue) => {
                const formattedValue = Array.isArray(newValue)
                  ? newValue.map((item) => item[valueMember])
                  : newValue?.[valueMember] ?? undefined;

                fieldOnChange(formattedValue);
                customOnChange?.(event, newValue);
              }}
              onBlur={onBlur}
              disabled={loading || disabled || isViewMode}
              disableClearable={!showClearButton}
              limitTags={limitTags}
              filterSelectedOptions={filterSelectedOptions}
              isOptionEqualToValue={(option, selected) =>
                option[valueMember] === selected[valueMember]
              }
              renderValue={(selectedOptions, getItemProps) =>
                multiple
                  ? (selectedOptions as readonly TOption[]).map((option, index) => {
                      const itemProps = getItemProps({ index });
                      return (
                        <Chip
                          {...itemProps}
                          key={String(option[valueMember] ?? index)}
                          label={String(option[displayMember] ?? "")}
                          color={getChipColor(option)}
                          variant={chipVariant}
                          size={chipSize}
                          deleteIcon={
                            !isViewMode && showDeleteIcon ? <Close /> : undefined
                          }
                          onDelete={
                            !isViewMode && showDeleteIcon
                              ? itemProps.onDelete
                              : undefined
                          }
                          sx={{ margin: 0.25, "& .MuiChip-deleteIcon": { fontSize: 16 } }}
                        />
                      );
                    })
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
                  error={Boolean(fieldError)}
                  helperText={fieldError?.message}
                  autoComplete="off"
                  slotProps={{
                    ...params.slotProps,
                    htmlInput: {
                      ...params.slotProps.htmlInput,
                      "aria-required": required || undefined,
                      "aria-invalid": Boolean(fieldError),
                      "aria-describedby": fieldError
                        ? `${name}-error`
                        : undefined,
                    },
                    formHelperText: { id: `${name}-error` },
                    input: {
                      ...params.slotProps.input,
                      endAdornment: (
                        <>
                          {loading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.slotProps.input.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Chip
                    label={String(option[displayMember] ?? "")}
                    size="small"
                    color={getChipColor(option)}
                    variant="outlined"
                    sx={{ marginInlineEnd: 1 }}
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

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
import { useTheme } from "@mui/material/styles";
import { useMemo, type ReactNode, type SyntheticEvent } from "react";
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

interface SelectionEvent {
  target: { value: unknown };
}

interface BaseSelectProps<TOption extends object> {
  dataSource?: readonly TOption[];
  label: ReactNode;
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
  all?: boolean;
  sx?: SxProps<Theme>;
  isViewMode?: boolean;
  filterSelectedOptions?: boolean;
  defaultChipColor?: ChipProps["color"];
  chipVariant?: ChipProps["variant"];
  chipSize?: ChipProps["size"];
  showDeleteIcon?: boolean;
  loadingText?: string;
  noOptionsText?: string;
}

interface ControlledSelectProps<TOption extends object>
  extends BaseSelectProps<TOption> {
  control?: never;
  name?: never;
  selectedItem?: unknown;
  selectedItems?: readonly unknown[];
  handleSelectionChange: (event: SelectionEvent) => void;
  errors?: never;
  actualFieldName?: never;
  onChange?: never;
}

interface FormSelectProps<
  TFormValues extends FieldValues,
  TOption extends object,
> extends BaseSelectProps<TOption> {
  control: Control<TFormValues>;
  name: Path<TFormValues>;
  selectedItem?: never;
  selectedItems?: never;
  handleSelectionChange?: never;
  errors?: FieldErrors<TFormValues>;
  actualFieldName?: Path<TFormValues>;
  onChange?: (
    event: SyntheticEvent,
    value: TOption | readonly TOption[] | null,
  ) => void;
}

export type MySelectProps<
  TOption extends object,
  TFormValues extends FieldValues = FieldValues,
> =
  | ControlledSelectProps<TOption>
  | FormSelectProps<TFormValues, TOption>;

interface NormalizedOption<TOption extends object> {
  source: TOption | null;
  value: unknown;
  label: string;
}

interface SelectionCommit<TOption extends object> {
  formattedValue: unknown;
  selected: TOption | readonly TOption[] | null;
  event: SyntheticEvent;
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

const EMPTY_SELECTED_ITEMS: readonly unknown[] = [];

const MySelect = <
  TOption extends object,
  TFormValues extends FieldValues = FieldValues,
>(props: MySelectProps<TOption, TFormValues>) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const formMode = isFormSelect(props);
  const {
    dataSource = [],
    label,
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
    loadingText,
    noOptionsText,
  } = props;
  const includeAll = !multiple && (props.all ?? !formMode);

  const options = useMemo<NormalizedOption<TOption>[]>(
    () =>
      dataSource.map((item) => ({
        source: item,
        value: item[valueMember],
        label: String(item[displayMember] ?? ""),
      })),
    [dataSource, displayMember, valueMember],
  );

  const availableOptions = useMemo(() => {
    if (!includeAll) return options;
    return [
      {
        source: null,
        value: 0,
        label: theme.direction === "rtl" ? "\u0627\u0644\u0643\u0644" : "All",
      },
      ...options,
    ];
  }, [includeAll, options, theme.direction]);

  const getChipColor = (option: NormalizedOption<TOption>): ChipProps["color"] => {
    if (!colorMember || !option.source) return defaultChipColor;
    const color = option.source[colorMember];
    return typeof color === "string" &&
      chipColors.has(color as NonNullable<ChipProps["color"]>)
      ? (color as ChipProps["color"])
      : defaultChipColor;
  };

  const renderSelect = (
    currentValue: unknown,
    commit: (selection: SelectionCommit<TOption>) => void,
    fieldError?: { message?: ReactNode },
    onBlur?: () => void,
    fieldName = "select",
  ) => {
    const selectedItems = multiple && Array.isArray(currentValue)
      ? currentValue
      : EMPTY_SELECTED_ITEMS;
    const selectedValue = multiple
      ? options.filter((option) => selectedItems.includes(option.value))
      : availableOptions.find((option) =>
          Object.is(option.value, currentValue),
        ) ?? null;

    const select = (
      <FormControl fullWidth sx={formMode ? sx : undefined}>
        <Autocomplete<NormalizedOption<TOption>, boolean, boolean, false>
          multiple={multiple}
          options={availableOptions}
          loading={formMode ? loading : undefined}
          getOptionLabel={(option) => option.label}
          value={selectedValue}
          onChange={(event, newValue) => {
            const formattedValue = Array.isArray(newValue)
              ? newValue.map((option) => option.value)
              : newValue?.value ?? (includeAll ? 0 : formMode ? undefined : "");
            const selected = Array.isArray(newValue)
              ? newValue
                  .map((option) => option.source)
                  .filter((option): option is TOption => option != null)
              : newValue?.source ?? null;
            commit({ event, formattedValue, selected });
          }}
          onBlur={onBlur}
          disabled={loading || disabled || isViewMode}
          disableClearable={!showClearButton}
          limitTags={multiple ? limitTags : undefined}
          filterSelectedOptions={formMode ? filterSelectedOptions : undefined}
          isOptionEqualToValue={(option, selected) =>
            Object.is(option.value, selected.value)
          }
          renderValue={
            multiple
              ? (selectedOptions, getItemProps) =>
                  (selectedOptions as readonly NormalizedOption<TOption>[]).map(
                    (option, index) => {
                      const itemProps = getItemProps({ index });
                      return (
                        <Chip
                          {...itemProps}
                          key={String(option.value ?? index)}
                          label={option.label}
                          size={formMode ? chipSize : "small"}
                          color={formMode ? getChipColor(option) : undefined}
                          variant={formMode ? chipVariant : undefined}
                          deleteIcon={
                            formMode && !isViewMode && showDeleteIcon
                              ? <Close />
                              : undefined
                          }
                          onDelete={
                            !formMode || (!isViewMode && showDeleteIcon)
                              ? itemProps.onDelete
                              : undefined
                          }
                          sx={formMode
                            ? {
                                margin: 0.25,
                                "& .MuiChip-deleteIcon": { fontSize: 16 },
                              }
                            : undefined}
                        />
                      );
                    },
                  )
              : undefined
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={formMode
                ? loading
                  ? loadingText || t("loading") || "Loading..."
                  : placeholder || t("search") || "Search..."
                : multiple
                  ? placeholder
                  : undefined}
              error={formMode ? Boolean(fieldError) : undefined}
              helperText={formMode ? fieldError?.message : undefined}
              autoComplete={formMode ? "off" : undefined}
              slotProps={formMode
                ? {
                    ...params.slotProps,
                    htmlInput: {
                      ...params.slotProps.htmlInput,
                      "aria-required": required || undefined,
                      "aria-invalid": Boolean(fieldError),
                      "aria-describedby": fieldError
                        ? `${fieldName}-error`
                        : undefined,
                    },
                    formHelperText: { id: `${fieldName}-error` },
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
                  }
                : {
                    ...params.slotProps,
                    htmlInput: {
                      ...params.slotProps.htmlInput,
                      autoComplete: "new-password",
                    },
                  }}
            />
          )}
          renderOption={formMode
            ? (optionProps, option) => (
                <Box component="li" {...optionProps}>
                  <Chip
                    label={option.label}
                    size="small"
                    color={getChipColor(option)}
                    variant="outlined"
                    sx={{ marginInlineEnd: 1 }}
                  />
                </Box>
              )
            : undefined}
          noOptionsText={formMode
            ? loading
              ? loadingText || t("loading") || "Loading..."
              : noOptionsText || t("noOptionsFound") || "No options found"
            : undefined}
          loadingText={formMode
            ? loadingText || t("loading") || "Loading..."
            : undefined}
        />
      </FormControl>
    );

    return formMode ? select : <Box>{select}</Box>;
  };

  if (formMode) {
    const errorFieldName = props.actualFieldName ?? props.name;
    const suppliedFieldError = getFormFieldError(
      props.errors ?? {},
      errorFieldName,
    );

    return (
      <Controller
        name={props.name}
        control={props.control}
        render={({ field, fieldState }) =>
          renderSelect(
            field.value,
            ({ event, formattedValue, selected }) => {
              field.onChange(formattedValue);
              props.onChange?.(event, selected);
            },
            suppliedFieldError ?? fieldState.error,
            field.onBlur,
            props.name,
          )
        }
      />
    );
  }

  const controlledValue = multiple
    ? props.selectedItems ?? EMPTY_SELECTED_ITEMS
    : props.selectedItem;

  return renderSelect(controlledValue, ({ formattedValue }) => {
    props.handleSelectionChange({ target: { value: formattedValue } });
  });
};

function isFormSelect<
  TOption extends object,
  TFormValues extends FieldValues,
>(
  props: MySelectProps<TOption, TFormValues>,
): props is FormSelectProps<TFormValues, TOption> {
  return props.control !== undefined && props.name !== undefined;
}

export default MySelect;

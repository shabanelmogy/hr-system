import {
  Autocomplete,
  Box,
  Chip,
  FormControl,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMemo, type ReactNode } from "react";

type OptionKey<TOption extends object> = Extract<keyof TOption, string>;

interface SelectionEvent {
  target: { value: unknown };
}

interface BaseSelectProps<TOption extends object> {
  dataSource: readonly TOption[];
  handleSelectionChange: (event: SelectionEvent) => void;
  loading?: boolean;
  label: ReactNode;
  displayValue: OptionKey<TOption>;
  displayMember: OptionKey<TOption>;
  showClearButton?: boolean;
  placeholder?: string;
  limitTags?: number;
}

interface SingleSelectProps<TOption extends object>
  extends BaseSelectProps<TOption> {
  multiple?: false;
  selectedItem: unknown;
  selectedItems?: never;
  all?: boolean;
}

interface MultipleSelectProps<TOption extends object>
  extends BaseSelectProps<TOption> {
  multiple: true;
  selectedItem?: never;
  selectedItems: readonly unknown[];
  all?: never;
}

export type MySelectProps<TOption extends object> =
  | SingleSelectProps<TOption>
  | MultipleSelectProps<TOption>;

interface NormalizedOption {
  value: unknown;
  label: string;
}

const EMPTY_SELECTED_ITEMS: readonly unknown[] = [];

const MySelect = <TOption extends object>(props: MySelectProps<TOption>) => {
  const theme = useTheme();
  const {
    dataSource,
    handleSelectionChange,
    loading = false,
    label,
    displayValue,
    displayMember,
    showClearButton = false,
    placeholder = "",
    limitTags = 3,
  } = props;
  const multiple = props.multiple === true;
  const includeAll = !multiple && (props.all ?? true);
  const selectedItems = props.multiple
    ? props.selectedItems
    : EMPTY_SELECTED_ITEMS;
  const selectedItem = props.multiple ? undefined : props.selectedItem;

  const options = useMemo<NormalizedOption[]>(
    () =>
      dataSource.map((item) => ({
        value: item[displayValue],
        label: String(item[displayMember] ?? ""),
      })),
    [dataSource, displayMember, displayValue],
  );

  const availableOptions = useMemo(() => {
    if (!includeAll) return options;
    return [
      {
        value: 0,
        label: theme.direction === "rtl" ? "\u0627\u0644\u0643\u0644" : "All",
      },
      ...options,
    ];
  }, [includeAll, options, theme.direction]);

  const selectedValue = useMemo(() => {
    if (multiple) {
      return options.filter((option) =>
        selectedItems.includes(option.value),
      );
    }
    return (
      availableOptions.find((option) =>
        Object.is(option.value, selectedItem),
      ) ?? null
    );
  }, [availableOptions, multiple, options, selectedItem, selectedItems]);

  return (
    <Box>
      <FormControl fullWidth>
        <Autocomplete<NormalizedOption, boolean, boolean, false>
          multiple={multiple}
          options={availableOptions}
          getOptionLabel={(option) => option.label}
          value={selectedValue}
          onChange={(_, newValue) => {
            const value = multiple
              ? Array.isArray(newValue)
                ? newValue.map((option) => option.value)
                : []
              : !Array.isArray(newValue)
                ? newValue?.value ?? (includeAll ? 0 : "")
                : includeAll
                  ? 0
                  : "";
            handleSelectionChange({ target: { value } });
          }}
          disabled={loading}
          disableClearable={!showClearButton}
          limitTags={multiple ? limitTags : undefined}
          renderValue={
            multiple
              ? (selectedOptions, getItemProps) =>
                  (selectedOptions as readonly NormalizedOption[]).map(
                    (option, index) => (
                      <Chip
                        key={String(option.value ?? index)}
                        label={option.label}
                        {...getItemProps({ index })}
                        size="small"
                      />
                    ),
                  )
              : undefined
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={multiple ? placeholder : undefined}
              slotProps={{
                ...params.slotProps,
                htmlInput: {
                  ...params.slotProps.htmlInput,
                  autoComplete: "new-password",
                },
              }}
            />
          )}
          isOptionEqualToValue={(option, value) =>
            Object.is(option.value, value.value)
          }
        />
      </FormControl>
    </Box>
  );
};

export default MySelect;

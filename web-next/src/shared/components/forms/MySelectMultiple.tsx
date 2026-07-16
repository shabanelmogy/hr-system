import { Autocomplete, Box, Chip, FormControl, TextField } from "@mui/material";
import type { ReactNode } from "react";
import { useTheme } from "@mui/material/styles";

type OptionKey<TOption extends object> = Extract<keyof TOption, string>;

interface SelectionEvent {
  target: { value: unknown };
}

interface MySelectMultipleProps<TOption extends object> {
  dataSource?: readonly TOption[];
  selectedItem?: unknown;
  selectedItems?: readonly unknown[];
  handleSelectionChange: (event: SelectionEvent) => void;
  loading?: boolean;
  label: ReactNode;
  displayValue: OptionKey<TOption>;
  displayMember: OptionKey<TOption>;
  all?: boolean;
  showClearButton?: boolean;
  isMulti?: boolean;
  limitTags?: number;
  placeholder?: string;
}

interface NormalizedOption<TOption extends object> {
  source: TOption | null;
  value: unknown;
  label: string;
}

const MySelectMultiple = <TOption extends object>({
  dataSource = [],
  selectedItem,
  selectedItems = [],
  handleSelectionChange,
  loading = false,
  label,
  displayValue,
  displayMember,
  all = true,
  showClearButton = false,
  isMulti = false,
  limitTags = 3,
  placeholder = "",
}: MySelectMultipleProps<TOption>) => {
  const theme = useTheme();
  const options: NormalizedOption<TOption>[] = dataSource.map((item) => ({
    source: item,
    value: item[displayValue],
    label: String(item[displayMember] ?? ""),
  }));
  const allOption: NormalizedOption<TOption> = {
    source: null,
    value: 0,
    label: theme.direction === "rtl" ? "\u0627\u0644\u0643\u0644" : "All",
  };
  const availableOptions = all && !isMulti ? [allOption, ...options] : options;
  const selectedValue = isMulti
    ? options.filter((option) => selectedItems.includes(option.value))
    : availableOptions.find((option) => Object.is(option.value, selectedItem)) ??
      null;

  return (
    <Box>
      <FormControl fullWidth>
        <Autocomplete<NormalizedOption<TOption>, boolean, boolean, false>
          multiple={isMulti}
          options={availableOptions}
          getOptionLabel={(option) => option.label}
          value={selectedValue}
          onChange={(_, newValue) => {
            const value = Array.isArray(newValue)
              ? newValue.map((option) => option.value)
              : newValue?.value ?? (all ? 0 : "");
            handleSelectionChange({ target: { value } });
          }}
          disabled={loading}
          disableClearable={!showClearButton}
          limitTags={limitTags}
          renderValue={(tagValue, getItemProps) =>
            isMulti
              ? (tagValue as readonly NormalizedOption<TOption>[]).map(
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
              placeholder={placeholder}
              slotProps={{
                ...params.slotProps,
                input: {
                  ...params.slotProps.input,
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

export default MySelectMultiple;

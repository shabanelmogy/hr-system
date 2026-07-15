import { Autocomplete, Box, FormControl, TextField } from "@mui/material";
import type { ReactNode } from "react";
import { useTheme } from "@mui/material/styles";

type OptionKey<TOption extends object> = Extract<keyof TOption, string>;

interface SelectionEvent {
  target: { value: unknown };
}

interface MySelectProps<TOption extends object> {
  dataSource: readonly TOption[];
  selectedItem: unknown;
  handleSelectionChange: (event: SelectionEvent) => void;
  loading?: boolean;
  label: ReactNode;
  displayValue: OptionKey<TOption>;
  displayMember: OptionKey<TOption>;
  all?: boolean;
  showClearButton?: boolean;
}

interface NormalizedOption<TOption extends object> {
  source: TOption | null;
  value: unknown;
  label: string;
}

const MySelect = <TOption extends object>({
  dataSource,
  selectedItem,
  handleSelectionChange,
  loading = false,
  label,
  displayValue,
  displayMember,
  all = true,
  showClearButton = false,
}: MySelectProps<TOption>) => {
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
  const availableOptions = all ? [allOption, ...options] : options;
  const selectedOption =
    availableOptions.find((option) => Object.is(option.value, selectedItem)) ??
    null;

  return (
    <Box>
      <FormControl fullWidth>
        <Autocomplete
          options={availableOptions}
          getOptionLabel={(option) => option.label}
          value={selectedOption}
          onChange={(_, newValue) => {
            handleSelectionChange({
              target: { value: newValue?.value ?? (all ? 0 : "") },
            });
          }}
          disabled={loading}
          disableClearable={!showClearButton}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
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

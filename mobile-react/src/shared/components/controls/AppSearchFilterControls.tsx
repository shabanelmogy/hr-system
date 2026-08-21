import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/src/core/theme';
import { AppSelectField, type AppSelectOption } from './AppSelectField';

interface AppSearchFilterControlsProps<Field extends string | number, Operator extends string | number> {
  field: Field;
  fieldLabel: string;
  fieldOptions: readonly AppSelectOption<Field>[];
  onFieldChange: (field: Field) => void;
  onOperatorChange: (operator: Operator) => void;
  operator: Operator;
  operatorLabel: string;
  operatorOptions: readonly AppSelectOption<Operator>[];
}

/** Shared Column and Condition selectors for feature-owned search filter modals. */
export function AppSearchFilterControls<Field extends string | number, Operator extends string | number>({
  field,
  fieldLabel,
  fieldOptions,
  onFieldChange,
  onOperatorChange,
  operator,
  operatorLabel,
  operatorOptions,
}: AppSearchFilterControlsProps<Field, Operator>) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.controls, { gap: theme.spacing.md }]}>
      <AppSelectField
        allowWhenReadOnly
        label={fieldLabel}
        leadingIcon="list-outline"
        onChange={onFieldChange}
        options={fieldOptions}
        value={field}
      />
      <AppSelectField
        allowWhenReadOnly
        label={operatorLabel}
        leadingIcon="funnel-outline"
        onChange={onOperatorChange}
        options={operatorOptions}
        value={operator}
      />
    </View>
  );
}

const styles = StyleSheet.create({ controls: { width: '100%' } });

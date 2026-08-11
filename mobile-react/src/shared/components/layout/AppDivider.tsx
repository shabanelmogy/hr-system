import { View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/src/core/theme';

export function AppDivider({ style, ...props }: ViewProps) {
  const { theme } = useAppTheme();

  return (
    <View
      {...props}
      accessibilityElementsHidden
      style={[{ height: 1, backgroundColor: theme.colors.border }, style]}
    />
  );
}

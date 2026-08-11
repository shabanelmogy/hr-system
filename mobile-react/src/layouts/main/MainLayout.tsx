import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';

export function MainLayout({ children }: PropsWithChildren) {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, direction },
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

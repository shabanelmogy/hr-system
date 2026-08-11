import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LocalizationProvider, useLocalization } from '@/src/core/localization';
import { queryClient } from '@/src/core/query/query-client';
import { AppThemeProvider } from '@/src/core/theme';

function DirectionRoot({ children }: PropsWithChildren) {
  const { direction } = useLocalization();

  return (
    <View style={[styles.root, { direction }]}>
      {children}
    </View>
  );
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider>
            <AppThemeProvider>
              <DirectionRoot>{children}</DirectionRoot>
            </AppThemeProvider>
          </LocalizationProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

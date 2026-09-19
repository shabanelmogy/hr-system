import { QueryClientProvider } from '@tanstack/react-query';
import { LocaleDirContext } from 'expo-router/react-navigation';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LocalizationProvider, useLocalization } from '@/src/core/localization';
import { OfflineFoundationProvider } from '@/src/core/offline';
import { OnboardingProvider } from '@/src/core/onboarding';
import { MockDataPreferencesProvider, OfflineReadPreferencesProvider } from '@/src/core/preferences';
import { queryClient } from '@/src/core/query/query-client';
import { QueryLifecycleCoordinator } from '@/src/core/query/QueryLifecycleCoordinator';
import { AppThemeProvider, useAppTheme } from '@/src/core/theme';

function DirectionRoot({ children }: PropsWithChildren) {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <LocaleDirContext.Provider value={direction}>
      <View
        style={[
          styles.root,
          {
            backgroundColor: theme.colors.background,
            direction,
          },
        ]}>
        {children}
      </View>
    </LocaleDirContext.Provider>
  );
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider preserveEdgeToEdge>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <QueryLifecycleCoordinator>
            <OfflineFoundationProvider>
              <LocalizationProvider>
                <OfflineReadPreferencesProvider>
                  <MockDataPreferencesProvider>
                    <AppThemeProvider>
                      <OnboardingProvider>
                        <DirectionRoot>
                          {children}
                        </DirectionRoot>
                      </OnboardingProvider>
                    </AppThemeProvider>
                  </MockDataPreferencesProvider>
                </OfflineReadPreferencesProvider>
              </LocalizationProvider>
            </OfflineFoundationProvider>
            </QueryLifecycleCoordinator>
          </QueryClientProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

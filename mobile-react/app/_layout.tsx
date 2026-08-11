import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import 'react-native-reanimated';

import { AppProviders } from '@/src/core/providers/AppProviders';
import { useAppTheme } from '@/src/core/theme';
import { AuthProvider, useAuth } from '@/src/features/auth/context/AuthProvider';
import { AppScreen, AppStateView } from '@/src/shared/components';

export const unstable_settings = {
  initialRouteName: '(main)',
};

export default function RootLayout() {
  return (
    <AppProviders>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </AppProviders>
  );
}

function RootNavigator() {
  const { navigationTheme, resolvedMode } = useAppTheme();
  const { status, retry } = useAuth();
  const { t } = useTranslation();

  const content =
    status === 'loading' ? (
      <AppScreen contentContainerStyle={{ flex: 1 }} scroll={false}>
        <AppStateView state="loading" />
      </AppScreen>
    ) : status === 'unavailable' ? (
      <AppScreen contentContainerStyle={{ flex: 1 }} scroll={false}>
        <AppStateView
          message={t('states.errorMessage')}
          onRetry={() => void retry()}
          state="error"
          title={t('auth.serviceUnavailable')}
        />
      </AppScreen>
    ) : (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={status === 'authenticated'}>
          <Stack.Screen name="(main)" />
        </Stack.Protected>
        <Stack.Protected guard={status === 'unauthenticated'}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    );

  return (
    <ThemeProvider value={navigationTheme}>
      {content}
      <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

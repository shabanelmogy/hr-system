import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import 'react-native-reanimated';

import { AppProviders } from '@/src/core/providers/AppProviders';
import { useOnboarding } from '@/src/core/onboarding';
import { useAppTheme } from '@/src/core/theme';
import { AuthProvider, useAuth } from '@/src/features/auth';
import { RealtimeProvider } from '@/src/features/realtime';
import { AppScreen, AppStateView } from '@/src/shared/components';

export const unstable_settings = {
  initialRouteName: 'onboarding',
};

export default function RootLayout() {
  return (
    <AppProviders>
      <AuthProvider>
        <RealtimeProvider>
          <RootNavigator />
        </RealtimeProvider>
      </AuthProvider>
    </AppProviders>
  );
}

function RootNavigator() {
  const { navigationTheme, resolvedMode } = useAppTheme();
  const { completed: onboardingCompleted, loading: onboardingLoading } = useOnboarding();
  const { status, retry } = useAuth();
  const { t } = useTranslation();

  const statusBarUsesPrimaryBackground =
    onboardingCompleted && (status === 'unauthenticated' || status === 'authenticated');
  const statusBarStyle = statusBarUsesPrimaryBackground
    ? resolvedMode === 'dark'
      ? 'dark'
      : 'light'
    : resolvedMode === 'dark'
      ? 'light'
      : 'dark';

  const content =
    onboardingLoading || (onboardingCompleted && status === 'loading') ? (
      <AppScreen contentContainerStyle={{ flex: 1 }} scroll={false}>
        <AppStateView state="loading" />
      </AppScreen>
    ) : onboardingCompleted && status === 'unavailable' ? (
      <AppScreen contentContainerStyle={{ flex: 1 }} scroll={false}>
        <AppStateView
          message={t('feedback.unknownError')}
          onRetry={() => void retry()}
          state="error"
          title={t('auth.serviceUnavailable')}
        />
      </AppScreen>
    ) : (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!onboardingCompleted}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={onboardingCompleted && status === 'unauthenticated'}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={onboardingCompleted && status === 'authenticated'}>
          <Stack.Screen name="(main)" />
        </Stack.Protected>
      </Stack>
    );

  return (
    <ThemeProvider value={navigationTheme}>
      {content}
      <StatusBar animated style={statusBarStyle} />
    </ThemeProvider>
  );
}

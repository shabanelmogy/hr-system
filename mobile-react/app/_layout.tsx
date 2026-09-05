import { ThemeProvider } from 'expo-router/react-navigation';
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
  const { navigationTheme, theme } = useAppTheme();
  const { completed: onboardingCompleted, loading: onboardingLoading } = useOnboarding();
  const { status, retry } = useAuth();
  const { t } = useTranslation();

  const statusBarStyle = theme.isDark ? 'light' : 'dark';

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
      <Stack
        screenOptions={{
          headerShown: false,
          statusBarHidden: false,
          statusBarStyle,
        }}>
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
      <StatusBar animated hidden={false} style={statusBarStyle} />
    </ThemeProvider>
  );
}

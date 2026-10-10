import { ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import 'react-native-reanimated';

import '@/src/shell';

import { AppProviders } from '@/src/core/providers/AppProviders';
import { BootstrapErrorBoundary } from '@/src/core/providers/BootstrapErrorBoundary';
import { configureObserve, ObserveRoot } from '@/src/core/observability/expoObserve';
import { SENSITIVE_ROUTE_PARAMS } from '@/src/core/observability/telemetry-redaction';
import { useOnboarding } from '@/src/core/onboarding';
import { appFontAssets, setAppFontsAvailable, useAppTheme } from '@/src/core/theme';
import { AuthProvider, useAuth } from '@/src/platform/auth';
import { RealtimeProvider } from '@/src/platform/realtime';
import { AppScreen, AppStateView } from '@/src/shared/components';
import { AppErrorBoundary } from '@/src/shared/components/feedback/AppErrorBoundary';
import { AppFeedbackHost } from '@/src/shared/components/feedback/transient';

const observeDispatchingEnabled =
  Constants.expoConfig?.extra?.eas?.observe?.dispatchingEnabled === true;

configureObserve({
  dispatchingEnabled: observeDispatchingEnabled,
  dispatchInDebug: false,
  integrations: {
    'expo-router': {
      filteredParams: [...SENSITIVE_ROUTE_PARAMS],
    },
  },
});

export const unstable_settings = {
  initialRouteName: 'onboarding',
};

export default function RootLayout() {
  // IBM Plex Sans Arabic (the shared token font). Wait for it so text does not re-flow;
  // if loading fails the app continues with the system font.
  const [fontsLoaded, fontError] = useFonts(appFontAssets);
  if (!fontsLoaded && !fontError) return null;
  setAppFontsAvailable(fontsLoaded && !fontError);

  return (
    <ObserveRoot>
      <BootstrapErrorBoundary>
        <AppProviders>
          <AppErrorBoundary>
            <AuthProvider>
              <RealtimeProvider>
                <RootNavigator />
              </RealtimeProvider>
            </AuthProvider>
            <AppFeedbackHost />
          </AppErrorBoundary>
        </AppProviders>
      </BootstrapErrorBoundary>
    </ObserveRoot>
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

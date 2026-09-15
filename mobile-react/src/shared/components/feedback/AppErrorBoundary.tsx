import type { PropsWithChildren } from 'react';
import { useCallback } from 'react';
import { ObserveErrorBoundary } from 'expo-observe';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { AppScreen } from '@/src/shared/components/layout/AppScreen';
import { AppStateView } from '@/src/shared/components/feedback/AppStateView';

export function AppErrorBoundary({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const renderFallback = useCallback((reset: () => void) => (
    <AppScreen contentContainerStyle={{ flex: 1, backgroundColor: theme.colors.background }} scroll={false}>
      <AppStateView
        message={t('feedback.unhandledErrorMessage')}
        onRetry={reset}
        state="error"
        title={t('feedback.errorTitle')}
      />
    </AppScreen>
  ), [t, theme.colors.background]);

  return (
    <ObserveErrorBoundary fallback={({ resetError }) => renderFallback(resetError)}>
      {children}
    </ObserveErrorBoundary>
  );
}

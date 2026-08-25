import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { AppButton } from '@/src/shared/components/controls/AppButton';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppText } from '@/src/shared/components/typography/AppText';

type AppState = 'loading' | 'empty' | 'error';

interface AppStateViewProps {
  state: AppState;
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const stateIcon: Record<Exclude<AppState, 'loading'>, AppIconName> = {
  empty: 'folder-open-outline',
  error: 'alert-circle-outline',
};

export function AppStateView({ state, title, message, onRetry }: AppStateViewProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  if (state === 'loading') {
    return (
      <View accessibilityLabel={t('feedback.loading')} accessibilityRole="progressbar" style={styles.container}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <AppText color="muted">{message ?? t('feedback.loading')}</AppText>
      </View>
    );
  }

  const fallbackTitle = state === 'error' ? t('feedback.errorTitle') : t('feedback.emptyTitle');
  const fallbackMessage = state === 'error' ? t('feedback.unknownError') : t('feedback.emptyMessage');

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <AppIcon color={state === 'error' ? theme.colors.danger : theme.colors.textMuted} name={stateIcon[state]} size={36} />
      <AppText align="center" variant="titleSmall">
        {title ?? fallbackTitle}
      </AppText>
      <AppText align="center" color="muted">
        {message ?? fallbackMessage}
      </AppText>
      {state === 'error' && onRetry ? (
        <AppButton icon="refresh-outline" onPress={onRetry} variant="outline">
          {t('common.retry')}
        </AppButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
});

import { Pressable, StyleSheet, View } from 'react-native';
import Toast, { type ToastConfig, type ToastConfigParams } from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { getAppTheme, useAppTheme } from '@/src/core/theme';
import { AppIconButton } from '@/src/shared/components/controls/AppIconButton';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppText } from '@/src/shared/components/typography/AppText';

type ToastKind = 'success' | 'info' | 'warning' | 'loading';

const toastConfig: ToastConfig = {
  success: (props) => <AppToast kind="success" {...props} />,
  info: (props) => <AppToast kind="info" {...props} />,
  warning: (props) => <AppToast kind="warning" {...props} />,
  loading: (props) => <AppToast kind="loading" {...props} />,
};

const icons: Record<ToastKind, AppIconName> = {
  success: 'checkmark-circle-outline',
  info: 'information-circle-outline',
  warning: 'warning-outline',
  loading: 'hourglass-outline',
};

export function AppToastHost() {
  return <Toast config={toastConfig} position="top" topOffset={54} />;
}

function AppToast({
  kind,
  text1,
  text2,
  hide,
  onPress,
}: ToastConfigParams<unknown> & { kind: ToastKind }) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { palette, theme } = useAppTheme();
  const toastTheme = getAppTheme(palette, theme.isDark ? 'light' : 'dark');
  const accent = getAccent(kind, toastTheme.colors);

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        styles.toast,
        {
          direction,
          backgroundColor: toastTheme.colors.surface,
          borderColor: toastTheme.colors.border,
          borderStartColor: accent,
          borderRadius: theme.radius.md,
          shadowColor: theme.isDark ? '#172026' : '#000000',
        },
      ]}>
      <AppIcon color={accent} name={icons[kind]} size={24} />
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        disabled={!onPress}
        onPress={onPress}
        style={styles.content}>
        <AppText style={{ color: toastTheme.colors.text }} variant="label">
          {text1 || t(`feedback.${kind}`)}
        </AppText>
        {text2 ? (
          <AppText style={{ color: toastTheme.colors.textMuted }} variant="bodySmall">
            {text2}
          </AppText>
        ) : null}
      </Pressable>
      <AppIconButton
        color={toastTheme.colors.textMuted}
        icon="close-outline"
        label={t('feedback.close')}
        onPress={() => hide()}
        size={20}
        style={styles.closeButton}
      />
    </View>
  );
}

function getAccent(
  kind: ToastKind,
  colors: { success: string; secondary: string; warning: string; primary: string },
): string {
  if (kind === 'success') return colors.success;
  if (kind === 'warning') return colors.warning;
  if (kind === 'loading') return colors.primary;
  return colors.secondary;
}

const styles = StyleSheet.create({
  toast: {
    width: '92%',
    maxWidth: 520,
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderStartWidth: 4,
    paddingVertical: 11,
    paddingStart: 13,
    paddingEnd: 7,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 7,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

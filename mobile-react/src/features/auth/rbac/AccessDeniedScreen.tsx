import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { asHref, ROUTES } from '@/src/core/constants/routes';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppIcon, AppScreen, AppText } from '@/src/shared/components';

export function AccessDeniedScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <AppScreen
      contentContainerStyle={styles.content}
      edges={['left', 'right', 'bottom']}
      scroll={false}>
      <View
        style={[
          styles.icon,
          {
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: theme.radius.full,
          },
        ]}>
        <AppIcon color={theme.colors.danger} name="lock-closed-outline" size={34} />
      </View>
      <AppText align="center" variant="title">
        {t('authorization.forbiddenTitle')}
      </AppText>
      <AppText align="center" color="muted">
        {t('authorization.forbiddenMessage')}
      </AppText>
      <AppButton icon="home-outline" onPress={() => router.replace(asHref(ROUTES.home))}>
        {t('authorization.backHome')}
      </AppButton>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  icon: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});

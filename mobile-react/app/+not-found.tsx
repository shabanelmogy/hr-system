import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { asHref, ROUTES } from '@/src/core/constants/routes';
import { AppButton, AppScreen, AppText } from '@/src/shared/components';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <AppScreen contentContainerStyle={styles.content} scroll={false}>
      <AppText align="center" variant="display">
        404
      </AppText>
      <AppText align="center" color="muted">
        {t('states.emptyMessage')}
      </AppText>
      <AppButton icon="home-outline" onPress={() => router.replace(asHref(ROUTES.home))}>
        {t('navigation.dashboard')}
      </AppButton>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
});

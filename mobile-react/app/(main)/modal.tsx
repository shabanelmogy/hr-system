import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton, AppCard, AppScreen, AppText } from '@/src/shared/components';

export default function ModalScreen() {
  const { t } = useTranslation();

  return (
    <AppScreen contentContainerStyle={styles.content} scroll={false}>
      <AppCard style={styles.card}>
        <AppText align="center" variant="title">
          {t('modal.title')}
        </AppText>
        <AppText align="center" color="muted">
          {t('modal.description')}
        </AppText>
        <AppButton
          fullWidth
          icon="close-outline"
          onPress={() => router.back()}
          variant="outline">
          {t('modal.close')}
        </AppButton>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    gap: 18,
  },
});

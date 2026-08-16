import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { platformToolsApi } from '@/src/features/platform-tools/api/platform-tools-api';
import {
  AppAlert,
  AppButton,
  AppCard,
  AppIcon,
  AppPageHeader,
  AppScreen,
  AppText,
  showToast,
} from '@/src/shared/components';
import { useAppTheme } from '@/src/core/theme';

export function ApiEndpointsScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [opening, setOpening] = useState(false);

  const openSwagger = async () => {
    setOpening(true);
    try {
      await WebBrowser.openBrowserAsync(platformToolsApi.getSwaggerUrl(), {
        showTitle: true,
        toolbarColor: theme.colors.surface,
      });
    } catch (error) {
      showToast.error(error, t('platformTools.apiEndpoints.openFailed'));
    } finally {
      setOpening(false);
    }
  };

  return (
    <AppScreen edges={['left', 'right', 'bottom']}>
      <AppPageHeader
        subtitle={t('platformTools.apiEndpointsDescription')}
        title={t('navigation.apiEndpoints')}
      />
      <AppCard style={styles.card} variant="filled">
        <AppIcon color={theme.colors.primary} name="code-slash-outline" size={42} />
        <AppText align="center" variant="titleSmall">
          {t('platformTools.apiEndpoints.swaggerTitle')}
        </AppText>
        <AppText align="center" color="muted" variant="bodySmall">
          {t('platformTools.apiEndpoints.swaggerDescription')}
        </AppText>
        <AppButton
          icon="open-outline"
          loading={opening}
          onPress={() => void openSwagger()}>
          {t('platformTools.apiEndpoints.open')}
        </AppButton>
      </AppCard>
      <AppAlert severity="info">{t('platformTools.apiEndpoints.environmentNote')}</AppAlert>
    </AppScreen>
  );
}

const styles = StyleSheet.create({ card: { alignItems: 'center', gap: 14, marginBottom: 16 } });

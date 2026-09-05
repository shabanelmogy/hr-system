import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';

import { operationsApi } from '@/src/features/platform-tools/operations/api';
import {
  AppAlert,
  AppButton,
  AppCard,
  AppIcon,
  AppModal,
  AppPageHeader,
  AppScreen,
  AppStateView,
  AppText,
} from '@/src/shared/components';
import { useAppTheme } from '@/src/core/theme';

export function ApiEndpointsScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const swaggerUrl = operationsApi.getSwaggerUrl();
  const webViewRef = useRef<WebView>(null);
  const [swaggerVisible, setSwaggerVisible] = useState(false);
  const [swaggerLoading, setSwaggerLoading] = useState(false);
  const [swaggerError, setSwaggerError] = useState(false);

  const openSwagger = () => {
    setSwaggerError(false);
    setSwaggerLoading(true);
    setSwaggerVisible(true);
  };

  const retrySwagger = () => {
    setSwaggerError(false);
    setSwaggerLoading(true);
    webViewRef.current?.reload();
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
          onPress={openSwagger}>
          {t('platformTools.apiEndpoints.open')}
        </AppButton>
      </AppCard>
      <AppAlert severity="info">{t('platformTools.apiEndpoints.environmentNote')}</AppAlert>
      <AppModal
        contentContainerStyle={styles.webViewContent}
        icon="code-slash-outline"
        onClose={() => setSwaggerVisible(false)}
        scrollable={false}
        title={t('platformTools.apiEndpoints.swaggerTitle')}
        variant="fullScreen"
        visible={swaggerVisible}>
        <View style={styles.webViewContainer}>
          <WebView
            ref={webViewRef}
            allowsBackForwardNavigationGestures
            javaScriptEnabled
            onError={() => {
              setSwaggerLoading(false);
              setSwaggerError(true);
            }}
            onLoadEnd={() => setSwaggerLoading(false)}
            onLoadStart={() => {
              setSwaggerError(false);
              setSwaggerLoading(true);
            }}
            source={{ uri: swaggerUrl }}
            style={styles.webView}
          />
          {swaggerLoading && !swaggerError ? (
            <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.background }]}>
              <ActivityIndicator color={theme.colors.primary} size="large" />
              <AppText color="muted">{t('feedback.loading')}</AppText>
            </View>
          ) : null}
          {swaggerError ? (
            <View style={[styles.errorOverlay, { backgroundColor: theme.colors.background }]}>
              <AppStateView
                message={t('platformTools.apiEndpoints.webViewError')}
                onRetry={retrySwagger}
                state="error"
              />
            </View>
          ) : null}
        </View>
      </AppModal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: 14, marginBottom: 16 },
  webViewContent: { flex: 1, padding: 0 },
  webViewContainer: { flex: 1, position: 'relative' },
  webView: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});

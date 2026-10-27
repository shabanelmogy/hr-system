import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAppTheme } from '@/src/core/theme';
import { AppStateView } from '../feedback/AppStateView';
import { isolatedPreviewHtml, isSafePreviewNavigation } from './safe-html-preview';

export interface AppHtmlPreviewProps { html: string; title: string; }
export function AppHtmlPreview({ html, title }: AppHtmlPreviewProps) {
  const [failed, setFailed] = useState(false); const { theme } = useAppTheme();
  return <View style={[styles.container, { borderColor: theme.colors.border }]}>
    {failed ? <AppStateView state="error" onRetry={() => setFailed(false)} /> : <WebView accessibilityLabel={title}
      source={{ html: isolatedPreviewHtml(html), baseUrl: 'about:blank' }} originWhitelist={['*']}
      javaScriptEnabled={false} domStorageEnabled={false} allowFileAccess={false} sharedCookiesEnabled={false} nestedScrollEnabled
      thirdPartyCookiesEnabled={false} setSupportMultipleWindows={false} incognito
      onShouldStartLoadWithRequest={request => isSafePreviewNavigation(request.url)}
      onError={() => setFailed(true)} style={styles.content} />}
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, minHeight: 320, borderWidth: StyleSheet.hairlineWidth }, content: { flex: 1 } });

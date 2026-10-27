import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/src/core/theme';
import type { AppHtmlPreviewProps } from './AppHtmlPreview';
import { isolatedPreviewHtml } from './safe-html-preview';

export function AppHtmlPreview({ html, title }: AppHtmlPreviewProps) {
  const { theme } = useAppTheme();
  return <View style={[styles.container, { borderColor: theme.colors.border }]}>
    <iframe title={title} srcDoc={isolatedPreviewHtml(html)} sandbox="" referrerPolicy="no-referrer" tabIndex={-1} inert
      style={{ width: '100%', height: '100%', border: 0, minHeight: 320, pointerEvents: 'none' }} />
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, minHeight: 320, borderWidth: StyleSheet.hairlineWidth } });

import { useCallback, useMemo, useState, type PropsWithChildren, type ReactNode } from 'react';
import {
  Platform,
  type ScrollViewProps,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppScreenFooterContext, type AppScreenFooterHost } from './AppScreenFooterContext';

interface RegisteredFooter {
  content: ReactNode;
  owner: symbol;
}

export interface AppScreenProps {
  scroll?: boolean;
  edges?: Edge[];
  padded?: boolean;
  keyboardAware?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: ScrollViewProps['refreshControl'];
  header?: ReactNode;
  footer?: ReactNode;
}

export function AppScreen({
  children,
  scroll = true,
  edges = ['top', 'right', 'bottom', 'left'],
  padded = true,
  keyboardAware = true,
  style,
  contentContainerStyle,
  refreshControl,
  header,
  footer,
}: PropsWithChildren<AppScreenProps>) {
  const { theme } = useAppTheme();
  const { direction } = useLocalization();
  const [registeredFooter, setRegisteredFooter] = useState<RegisteredFooter | null>(null);

  const registerFooter = useCallback((owner: symbol, footerContent: ReactNode) => {
    setRegisteredFooter({ content: footerContent, owner });
  }, []);
  const unregisterFooter = useCallback((owner: symbol) => {
    setRegisteredFooter((current) => current?.owner === owner ? null : current);
  }, []);
  const footerHost = useMemo<AppScreenFooterHost>(
    () => ({ registerFooter, unregisterFooter }),
    [registerFooter, unregisterFooter],
  );
  const footerContent = footer ?? registeredFooter?.content;

  const contentStyle: StyleProp<ViewStyle> = [
    styles.content,
    { direction },
    padded ? { padding: theme.spacing.lg } : {},
    contentContainerStyle,
  ];

  const content = scroll ? (
    <KeyboardAwareScrollView
      bottomOffset={theme.spacing.xxl}
      contentContainerStyle={contentStyle}
      enabled={keyboardAware}
      extraKeyboardSpace={theme.spacing.lg}
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      style={styles.scrollArea}>
      {children}
    </KeyboardAwareScrollView>
  ) : (
    <View style={contentStyle}>{children}</View>
  );

  return (
    <AppScreenFooterContext.Provider value={footerHost}>
      <SafeAreaView
        edges={edges}
        style={[styles.safeArea, { backgroundColor: theme.colors.background }, style]}>
        {header}
        {keyboardAware && !scroll ? (
          <KeyboardAvoidingView
            behavior="padding"
            style={styles.safeArea}>
            {content}
          </KeyboardAvoidingView>
        ) : (
          content
        )}
        {footerContent ? (
          <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
            <View
              style={[
                styles.footerContent,
                padded ? { paddingHorizontal: theme.spacing.lg } : {},
              ]}>
              {footerContent}
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </AppScreenFooterContext.Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  footer: {
    flexShrink: 0,
    width: '100%',
  },
  footerContent: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingTop: 4,
    paddingBottom: 4,
  },
});

import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';

export interface AppScreenProps {
  scroll?: boolean;
  edges?: Edge[];
  padded?: boolean;
  keyboardAware?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  refreshControl?: ScrollViewProps['refreshControl'];
  header?: ReactNode;
}

export function AppScreen({
  children,
  scroll = true,
  edges = ['top', 'right', 'bottom', 'left'],
  padded = true,
  keyboardAware = false,
  style,
  contentContainerStyle,
  refreshControl,
  header,
}: PropsWithChildren<AppScreenProps>) {
  const { theme } = useAppTheme();
  const { direction } = useLocalization();

  const contentStyle: ViewStyle[] = [
    styles.content,
    { direction },
    padded ? { padding: theme.spacing.lg } : {},
    contentContainerStyle ?? {},
  ];

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={contentStyle}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={contentStyle}>{children}</View>
  );

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }, style]}>
      {header}
      {keyboardAware ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.safeArea}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
});

import type { PropsWithChildren, ReactNode } from 'react';
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

export interface AppScreenProps {
  scroll?: boolean;
  edges?: Edge[];
  padded?: boolean;
  keyboardAware?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: ScrollViewProps['refreshControl'];
  header?: ReactNode;
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
}: PropsWithChildren<AppScreenProps>) {
  const { theme } = useAppTheme();
  const { direction } = useLocalization();

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
      showsVerticalScrollIndicator={false}>
      {children}
    </KeyboardAwareScrollView>
  ) : (
    <View style={contentStyle}>{children}</View>
  );

  return (
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

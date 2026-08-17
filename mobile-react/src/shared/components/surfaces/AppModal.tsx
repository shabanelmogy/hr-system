import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  type ModalProps,
  Platform,
  ScrollView,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIconButton } from '@/src/shared/components/controls/AppIconButton';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppScreen } from '@/src/shared/components/layout/AppScreen';
import { AppText } from '@/src/shared/components/typography/AppText';

export interface AppModalProps extends PropsWithChildren {
  visible: boolean;
  title: string;
  subtitle?: string;
  icon?: AppIconName;
  iconColor?: string;
  onClose?: () => void;
  closeDisabled?: boolean;
  closeLabel?: string;
  showCloseButton?: boolean;
  variant?: 'dialog' | 'fullScreen';
  animationType?: ModalProps['animationType'];
  footer?: ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  sheetStyle?: StyleProp<ViewStyle>;
}

export function AppModal({
  children,
  visible,
  title,
  subtitle,
  icon,
  iconColor,
  onClose,
  closeDisabled = false,
  closeLabel = 'Close',
  showCloseButton = true,
  variant = 'dialog',
  animationType = variant === 'fullScreen' ? 'slide' : 'fade',
  footer,
  scrollable = true,
  contentContainerStyle,
  sheetStyle,
}: AppModalProps) {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const header = (
    <View
      style={[
        styles.header,
        variant === 'fullScreen' && styles.fullScreenHeader,
        {
          direction,
          backgroundColor: variant === 'fullScreen' ? theme.colors.surface : 'transparent',
          borderBottomColor: theme.colors.border,
        },
      ]}>
      {icon ? (
        <View
          style={[
            styles.headerIcon,
            { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.md },
          ]}>
          <AppIcon color={iconColor ?? theme.colors.primary} name={icon} size={25} />
        </View>
      ) : null}
      <View style={styles.heading}>
        <AppText variant="titleSmall">{title}</AppText>
        {subtitle ? (
          <AppText color="muted" variant="bodySmall">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {showCloseButton && onClose ? (
        <AppIconButton
          disabled={closeDisabled}
          icon="close-outline"
          label={closeLabel}
          onPress={onClose}
          size={26}
        />
      ) : null}
    </View>
  );

  if (variant === 'fullScreen') {
    return (
      <Modal
        animationType={animationType}
        onRequestClose={closeDisabled ? undefined : onClose}
        presentationStyle="fullScreen"
        visible={visible}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.fullScreenRoot, { backgroundColor: theme.colors.background }]}>
          <AppScreen
            contentContainerStyle={[styles.fullScreenContent, contentContainerStyle]}
            edges={footer ? ['top', 'right', 'left'] : undefined}
            header={header}
            keyboardAware={false}
            scroll={scrollable}>
            {children}
          </AppScreen>
          {footer ? (
            <SafeAreaView
              edges={['right', 'bottom', 'left']}
              style={[
                styles.fullScreenFooter,
                {
                  backgroundColor: theme.colors.surface,
                  borderTopColor: theme.colors.border,
                },
              ]}>
              <View style={styles.fullScreenFooterContent}>{footer}</View>
            </SafeAreaView>
          ) : null}
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  return (
    <Modal
      animationType={animationType}
      onRequestClose={closeDisabled ? undefined : onClose}
      transparent
      visible={visible}>
      <SafeAreaView style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
            },
            sheetStyle,
          ]}>
          {header}
          {scrollable ? (
            <ScrollView
              contentContainerStyle={[styles.dialogContent, contentContainerStyle]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.dialogViewport}>
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.dialogViewport, styles.dialogContent, contentContainerStyle]}>
              {children}
            </View>
          )}
          {footer}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '82%',
    alignSelf: 'center',
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
    gap: 16,
  },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenHeader: {
    minHeight: 76,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  heading: {
    flex: 1,
    gap: 4,
  },
  dialogViewport: {
    minHeight: 0,
    flexShrink: 1,
  },
  dialogContent: {
    gap: 16,
  },
  fullScreenContent: {
    paddingBottom: 24,
  },
  fullScreenRoot: {
    flex: 1,
  },
  fullScreenFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  fullScreenFooterContent: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
});

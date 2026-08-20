import { useState, type PropsWithChildren } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { AppButton } from '@/src/shared/components/controls/AppButton';
import { AppIconButton } from '@/src/shared/components/controls/AppIconButton';
import { type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppModal } from '@/src/shared/components/surfaces/AppModal';
import { AppText } from '@/src/shared/components/typography/AppText';

export interface AppFilterFormButtonProps extends PropsWithChildren {
  activeCount: number;
  applyLabel?: string;
  buttonLabel: string;
  buttonSize?: number;
  clearDisabled?: boolean;
  clearLabel?: string;
  description?: string;
  disabled?: boolean;
  display?: 'button' | 'icon';
  icon?: AppIconName;
  modalTitle: string;
  onApply: () => void;
  onClear: () => void;
  onOpen?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Reusable filter trigger for custom form controls that do not fit option-only filters. */
export function AppFilterFormButton({
  activeCount,
  applyLabel,
  buttonLabel,
  buttonSize = 50,
  children,
  clearDisabled = false,
  clearLabel,
  description,
  disabled = false,
  display = 'icon',
  icon = 'filter-outline',
  modalTitle,
  onApply,
  onClear,
  onOpen,
  style,
}: AppFilterFormButtonProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [open, setOpen] = useState(false);

  const footer = (
    <View style={styles.footer}>
      <AppButton
        disabled={clearDisabled}
        icon="close-circle-outline"
        onPress={onClear}
        style={styles.footerButton}
        variant="outline">
        {clearLabel ?? t('common.clear')}
      </AppButton>
      <AppButton
        icon="checkmark-outline"
        onPress={() => {
          onApply();
          setOpen(false);
        }}
        style={styles.footerButton}>
        {applyLabel ?? t('common.confirm')}
      </AppButton>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        display === 'button'
          ? styles.fullWidthContainer
          : { width: buttonSize + 2, height: buttonSize + 2 },
        style,
      ]}>
      {display === 'button' ? (
        <AppButton
          disabled={disabled}
          fullWidth
          icon={icon}
          onPress={() => {
            onOpen?.();
            setOpen(true);
          }}
          style={{ borderColor: activeCount > 0 ? theme.colors.primary : theme.colors.border }}
          variant="outline">
          {buttonLabel}
        </AppButton>
      ) : (
        <AppIconButton
          color={activeCount > 0 ? theme.colors.primary : theme.colors.text}
          disabled={disabled}
          icon={icon}
          label={buttonLabel}
          onPress={() => {
            onOpen?.();
            setOpen(true);
          }}
          size={24}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surface,
              borderColor: activeCount > 0 ? theme.colors.primary : theme.colors.border,
              width: buttonSize,
              height: buttonSize,
            },
          ]}
        />
      )}
      {activeCount > 0 ? (
        <View pointerEvents="none" style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
          <AppText style={{ color: theme.colors.onPrimary }} variant="caption" weight="800">
            {activeCount}
          </AppText>
        </View>
      ) : null}
      <AppModal
        closeLabel={t('common.close')}
        footer={footer}
        icon={icon}
        onClose={() => setOpen(false)}
        subtitle={description}
        title={modalTitle}
        visible={open}>
        <View style={styles.content}>{children}</View>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  fullWidthContainer: { width: '100%' },
  button: { borderWidth: 1 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 21,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    paddingHorizontal: 5,
  },
  content: { gap: 10 },
  footer: { flexDirection: 'row', gap: 10 },
  footerButton: { flex: 1 },
});

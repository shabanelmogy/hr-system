import { type PropsWithChildren, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppButton } from '@/src/shared/components/controls/AppButton';
import { showErrorDialog } from '@/src/shared/components/feedback/transient/errorDialogStore';
import type { AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppModal } from '@/src/shared/components/surfaces/AppModal';
import { AppText } from '@/src/shared/components/typography/AppText';

export type ConfirmationDialogTone = 'default' | 'warning' | 'danger';

export interface ConfirmationDialogProps extends PropsWithChildren {
  visible: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  cancelLabel?: string;
  confirmLabel?: string;
  icon?: AppIconName;
  loading?: boolean;
  tone?: ConfirmationDialogTone;
}

export function ConfirmationDialog({
  children,
  visible,
  title,
  description,
  onCancel,
  onConfirm,
  cancelLabel,
  confirmLabel,
  icon,
  loading = false,
  tone = 'default',
}: ConfirmationDialogProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const [submitting, setSubmitting] = useState(false);
  const busy = loading || submitting;
  const accent = tone === 'danger'
    ? theme.colors.danger
    : tone === 'warning'
      ? theme.colors.warning
      : theme.colors.primary;
  const confirmVariant = tone === 'danger'
    ? 'danger'
    : tone === 'warning'
      ? 'warning'
      : 'primary';

  const confirm = async () => {
    if (busy) return;

    setSubmitting(true);
    try {
      await onConfirm();
    } catch (error) {
      showErrorDialog(error, t('confirmation.failedTitle'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppModal
      closeDisabled={busy}
      closeLabel={t('common.cancel')}
      footer={
        <View style={[styles.actions, { direction, borderTopColor: theme.colors.border }]}>
          <AppButton disabled={busy} onPress={onCancel} variant="outline">
            {cancelLabel ?? t('common.cancel')}
          </AppButton>
          <AppButton
            icon={tone === 'danger' ? 'trash-outline' : 'checkmark-outline'}
            loading={busy}
            onPress={() => void confirm()}
            variant={confirmVariant}>
            {confirmLabel ?? t('common.confirm')}
          </AppButton>
        </View>
      }
      icon={icon ?? getDefaultIcon(tone)}
      iconColor={accent}
      onClose={onCancel}
      subtitle={description}
      title={title}
      visible={visible}>
      <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.content}>
        {children ?? (
          <AppText color="muted" variant="bodySmall">
            {t('confirmation.reviewAction')}
          </AppText>
        )}
      </View>
    </AppModal>
  );
}

function getDefaultIcon(tone: ConfirmationDialogTone): AppIconName {
  if (tone === 'danger') return 'warning-outline';
  if (tone === 'warning') return 'alert-circle-outline';
  return 'help-circle-outline';
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
});

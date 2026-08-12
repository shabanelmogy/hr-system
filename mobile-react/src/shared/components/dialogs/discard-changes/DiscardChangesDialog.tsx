import { useTranslation } from 'react-i18next';

import { ConfirmationDialog } from '@/src/shared/components/dialogs/confirmation/ConfirmationDialog';

export interface DiscardChangesDialogProps {
  visible: boolean;
  onCancel: () => void;
  onDiscard: () => void | Promise<void>;
  loading?: boolean;
}

export function DiscardChangesDialog({
  visible,
  onCancel,
  onDiscard,
  loading = false,
}: DiscardChangesDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmationDialog
      cancelLabel={t('common.cancel')}
      confirmLabel={t('discardChanges.confirm')}
      description={t('discardChanges.description')}
      loading={loading}
      onCancel={onCancel}
      onConfirm={onDiscard}
      title={t('discardChanges.title')}
      tone="warning"
      visible={visible}
    />
  );
}

import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { AppButton } from '@/src/shared/components/controls/AppButton';

export interface AppFormStepActionsProps {
  activeStep: number;
  stepCount: number;
  onBack: () => void;
  onNext: () => void | Promise<void>;
  onSubmit: () => void | Promise<void>;
  backLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  submitting?: boolean;
}

export function AppFormStepActions({
  activeStep,
  stepCount,
  onBack,
  onNext,
  onSubmit,
  backLabel,
  nextLabel,
  submitLabel,
  backDisabled = false,
  nextDisabled = false,
  submitting = false,
}: AppFormStepActionsProps) {
  const { t } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const isFirst = activeStep <= 0;
  const isLast = activeStep >= Math.max(stepCount - 1, 0);

  return (
    <View style={[styles.actions, { direction }]}>
      <AppButton
        disabled={isFirst || backDisabled || submitting}
        icon={isRTL ? 'chevron-forward-outline' : 'chevron-back-outline'}
        onPress={onBack}
        style={styles.action}
        variant="outline">
        {backLabel ?? t('common.previous')}
      </AppButton>
      <AppButton
        disabled={nextDisabled || submitting}
        icon={isLast ? 'checkmark-outline' : isRTL ? 'chevron-back-outline' : 'chevron-forward-outline'}
        loading={submitting}
        onPress={() => void (isLast ? onSubmit() : onNext())}
        style={styles.action}>
        {isLast ? submitLabel ?? t('common.save') : nextLabel ?? t('common.next')}
      </AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  action: {
    flex: 1,
    maxWidth: 240,
  },
});

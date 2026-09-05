import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppIcon, AppText, showToast } from '@/src/shared/components';
import { useCreateJobOffer, useIssueJobOffer } from '../queries/use-recruitment';
import { EmploymentType, WorkArrangement } from '../types';

interface JobOfferModalProps {
  visible: boolean;
  applicationId: number | null;
  positionId?: number;
  branchId?: number;
  departmentId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export function JobOfferModal({
  visible,
  applicationId,
  positionId = 1,
  branchId = 1,
  departmentId = 1,
  onClose,
  onSuccess,
}: JobOfferModalProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const createOfferMutation = useCreateJobOffer();
  const issueOfferMutation = useIssueJobOffer();

  const [salary, setSalary] = useState('25000');
  const [currency, setCurrency] = useState('EGP');

  const handleCreateOffer = async () => {
    if (!applicationId) return;

    try {
      const numSalary = parseFloat(salary) || 20000;
      const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      const offer = await createOfferMutation.mutateAsync({
        employmentApplicationId: applicationId,
        positionId,
        branchId,
        departmentId,
        baseSalary: numSalary,
        currencyCode: currency,
        payFrequency: 0, // Monthly
        employmentType: EmploymentType.FullTime,
        workArrangement: WorkArrangement.Hybrid,
        proposedStartDate: twoWeeksLater.toISOString().split('T')[0],
        termsAndConditions: 'Standard 3-month probation period.',
      });

      // Auto issue offer
      await issueOfferMutation.mutateAsync(offer.id);

      showToast.success(t('recruitment.offers.offerCreatedSuccess', 'تم إصدار عرض العمل بنجاح'));
      onSuccess?.();
      onClose();
    } catch (error) {
      showToast.error(error, t('common.error', 'حدث خطأ أثناء إصدار العرض'));
    }
  };

  const isPending = createOfferMutation.isPending || issueOfferMutation.isPending;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <AppIcon name="mail-outline" size={22} color={theme.colors.primary} />
              <AppText variant="titleSmall" weight="800">
                {t('recruitment.offers.createTitle', 'إصدار عرض عمل رسمي / Job Offer')}
              </AppText>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <AppIcon name="close" size={20} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <AppText variant="label" weight="700" style={{ color: theme.colors.text }}>
              {t('recruitment.offers.offeredSalary', 'الراتب الأساسي المعروض / Base Salary')}
            </AppText>
            <View style={styles.salaryRow}>
              <TextInput
                value={salary}
                onChangeText={setSalary}
                keyboardType="numeric"
                placeholder="25000"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.input,
                  {
                    flex: 1,
                    backgroundColor: theme.colors.surfaceMuted,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
              />
              <TextInput
                value={currency}
                onChangeText={setCurrency}
                placeholder="EGP"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.input,
                  {
                    width: 80,
                    textAlign: 'center',
                    backgroundColor: theme.colors.surfaceMuted,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                    fontWeight: '700',
                  },
                ]}
              />
            </View>
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <AppButton variant="outline" onPress={onClose}>
              {t('common.cancel', 'إلغاء / Cancel')}
            </AppButton>
            <AppButton
              variant="primary"
              loading={isPending}
              onPress={handleCreateOffer}
              icon="send-outline"
            >
              {t('recruitment.actions.makeOffer', 'إصدار العرض / Issue Offer')}
            </AppButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    gap: 8,
  },
  salaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
});

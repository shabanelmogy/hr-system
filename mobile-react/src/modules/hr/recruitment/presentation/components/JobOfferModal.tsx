import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useCurrencyLookup } from '@/src/modules/accounting';
import {
  AppDateTimeField,
  AppForm,
  AppFormSection,
  AppSelectField,
  AppTextField,
  showToast,
} from '@/src/shared/components';
import { useCreateJobOffer, useSubmitJobOffer } from '../queries/use-recruitment';
import { EmploymentType, PayFrequency, WorkArrangement } from '../../domain/models/recruitment';

interface JobOfferModalProps {
  visible: boolean;
  applicationId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

type OfferErrors = Partial<Record<string, string>>;

function defaultStartDate(): string {
  const value = new Date();
  value.setDate(value.getDate() + 14);
  return value.toISOString().split('T')[0];
}

export function JobOfferModal({ visible, applicationId, onClose, onSuccess }: JobOfferModalProps) {
  const { t } = useTranslation();
  const createOfferMutation = useCreateJobOffer();
  const submitOfferMutation = useSubmitJobOffer();
  const currencies = useCurrencyLookup(visible);
  const [initialStartDate, setInitialStartDate] = useState(defaultStartDate);
  const [salary, setSalary] = useState('25000');
  const [currency, setCurrency] = useState('');
  const [proposedStartDate, setProposedStartDate] = useState(initialStartDate);
  const [errors, setErrors] = useState<OfferErrors>({});
  const [focusErrorRequestId, setFocusErrorRequestId] = useState(0);
  const currencyOptions = useMemo(() => (currencies.data ?? []).map((item) => ({
    value: item.currencyCode,
    label: `${item.currencyCode} — ${item.nameEn} (${item.nameAr})`,
    icon: 'cash-outline' as const,
  })), [currencies.data]);

  const reset = () => {
    const nextStartDate = defaultStartDate();
    setSalary('25000');
    setCurrency('');
    setInitialStartDate(nextStartDate);
    setProposedStartDate(nextStartDate);
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreateOffer = async () => {
    if (!applicationId) return;

    const normalizedCurrency = currency.trim().toUpperCase();
    const numericSalary = Number(salary);
    const nextErrors: OfferErrors = {};
    if (!Number.isFinite(numericSalary) || numericSalary <= 0) {
      nextErrors.salary = t('recruitment.offers.salaryValidation');
    }
    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      nextErrors.currency = t('recruitment.offers.currencyValidation');
    }
    if (!proposedStartDate) {
      nextErrors.proposedStartDate = t('recruitment.offers.startDateValidation');
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFocusErrorRequestId((current) => current + 1);
      return;
    }

    try {
      const offer = await createOfferMutation.mutateAsync({
        employmentApplicationId: applicationId,
        baseSalary: numericSalary,
        currencyCode: normalizedCurrency,
        payFrequency: PayFrequency.Monthly,
        employmentType: EmploymentType.FullTime,
        workArrangement: WorkArrangement.Hybrid,
        proposedStartDate,
        termsAndConditions: 'Standard 3-month probation period.',
      });
      await submitOfferMutation.mutateAsync(offer.id);
      showToast.success(t('recruitment.offers.offerCreatedSuccess'));
      onSuccess?.();
      handleClose();
    } catch (error) {
      showToast.error(error, t('common.error'));
    }
  };

  const isPending = createOfferMutation.isPending || submitOfferMutation.isPending;

  return (
    <AppForm
      visible={visible}
      presentation="dialog"
      title={t('recruitment.offers.createTitle')}
      subtitle={t('recruitment.offers.createSubtitle')}
      icon="mail-outline"
      errors={errors}
      focusErrorRequestId={focusErrorRequestId}
      onClearFieldError={(name) => setErrors((current) => ({ ...current, [name]: undefined }))}
      onCancel={handleClose}
      onSubmit={handleCreateOffer}
      submitLabel={t('recruitment.offers.submitForApproval')}
      submitting={isPending}
      isDirty={
        salary !== '25000' || currency !== '' || proposedStartDate !== initialStartDate
      }
      contentContainerStyle={styles.content}
    >
      <AppFormSection title={t('recruitment.offers.compensationSection')} icon="cash-outline">
        <View style={styles.salaryRow}>
          <AppTextField
            name="salary"
            label={t('recruitment.offers.offeredSalary')}
            value={salary}
            onChangeText={setSalary}
            numeric
            minValue={0.01}
            required
            style={styles.salaryInput}
          />
          <AppSelectField
            name="currency"
            label={t('recruitment.offers.currency')}
            value={currency}
            onChange={setCurrency}
            options={currencyOptions}
            disabled={currencies.isLoading}
            optionsLoading={currencies.isLoading}
            optionsError={currencies.error ? t('common.error') : undefined}
            onRetryOptions={() => { void currencies.refetch(); }}
            leadingIcon="cash-outline"
            searchable
            required
            style={styles.currencyInput}
          />
        </View>
        <AppDateTimeField
          name="proposedStartDate"
          label={t('recruitment.offers.startDate')}
          value={proposedStartDate}
          onChangeValue={setProposedStartDate}
          mode="date"
          minimumDate={new Date()}
          required
        />
      </AppFormSection>
    </AppForm>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16 },
  salaryRow: { flexDirection: 'row', gap: 12 },
  salaryInput: { flex: 1 },
  currencyInput: { width: 112 },
});

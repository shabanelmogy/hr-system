import { useEffect, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppCard, AppDateTimeField, AppForm, AppFormSection, AppSelectField, AppStateView, AppStatusBadge, AppText, AppTextField } from '@/src/shared/components';
import type { FiscalYearDetail, FiscalYearRequest } from '../types/fiscal-year';
import { createFiscalYearSchema } from '../validation/fiscal-year-schema';
import { useAppTheme } from '@/src/core/theme';
import { buildFiscalPeriodPreview, endOfFiscalYear } from '../utils/fiscal-period-preview';

interface Props { item: FiscalYearDetail | null; mode: 'create' | 'edit' | 'view'; loading: boolean; detailLoading?: boolean; detailError?: string | null; onRetryDetail?: () => void; onClose: () => void; onSave: (request: FiscalYearRequest) => Promise<void> }

export function FiscalYearForm({ item, mode, loading, detailLoading = false, detailError = null, onRetryDetail, onClose, onSave }: Props) {
  const { t } = useTranslation(); const { theme } = useAppTheme(); const schema = useMemo(() => createFiscalYearSchema(t), [t]); type Values = z.infer<typeof schema>;
  const defaults = useMemo<Values>(() => ({ code: item?.code ?? '', nameAr: item?.nameAr ?? '', nameEn: item?.nameEn ?? '', startDate: item?.startDate ?? '', endDate: item?.endDate ?? '', periodFrequency: item?.periodFrequency ?? 1 }), [item]);
  const form = useZodForm<Values>(schema, { defaultValues: defaults }); const readOnly = mode === 'view'; const disabled = readOnly || loading || detailLoading || Boolean(detailError);
  const start = useWatch({ control: form.control, name: 'startDate' });
  const code = useWatch({ control: form.control, name: 'code' });
  const periodFrequency = useWatch({ control: form.control, name: 'periodFrequency' });
  useEffect(() => { if (!readOnly && start) form.setValue('endDate', endOfFiscalYear(start), { shouldDirty: true, shouldValidate: form.formState.isSubmitted }); }, [form, readOnly, start]);
  const displayedPeriods = useMemo(
    () => readOnly ? item?.periods ?? [] : buildFiscalPeriodPreview(code, start, periodFrequency ?? 1),
    [code, item?.periods, periodFrequency, readOnly, start],
  );
  const mock = () => { const year = new Date().getFullYear() + 1; const options = { shouldDirty: true, shouldValidate: true }; form.setValue('code', `FY-${year}`, options); form.setValue('nameAr', `السنة المالية ${year}`, options); form.setValue('nameEn', `Fiscal Year ${year}`, options); form.setValue('startDate', `${year}-01-01`, options); form.setValue('endDate', `${year}-12-31`, options); form.setValue('periodFrequency', 1, options); };
  return <AppForm visible presentation="fullScreen" title={t(`fiscalYears.form.${mode}Title`)} subtitle={t('fiscalYears.form.subtitle')} icon={mode === 'create' ? 'add-circle-outline' : readOnly ? 'eye-outline' : 'create-outline'} errors={toFormErrorMap(form.formState.errors)} isDirty={form.formState.isDirty} submitting={loading || form.formState.isSubmitting} submitDisabled={detailLoading || Boolean(detailError)} onCancel={onClose} onClearFieldError={name => form.clearErrors(name as keyof Values)} onSubmit={readOnly ? undefined : form.handleSubmit(values => onSave({ ...values, periodFrequency: values.periodFrequency ?? 1 }))} submitLabel={t(mode === 'edit' ? 'common.update' : 'common.create')} mockDataAction={__DEV__ && !readOnly ? { onGenerate: mock, disabled } : undefined} contentContainerStyle={styles.content}>
    {detailLoading ? <AppStateView state="loading" /> : null}
    {detailError ? <AppStateView state="error" message={detailError} onRetry={onRetryDetail} /> : null}
    <AppFormSection title={t('fiscalYears.form.identity')} icon="calendar-outline">
      <Controller control={form.control} name="code" render={({ field }) => <AppTextField name={field.name} label={t('fiscalYears.fields.code')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} editable={!disabled} autoCapitalize="characters" maxLength={20} required />} />
      <Controller control={form.control} name="nameAr" render={({ field }) => <AppTextField name={field.name} label={t('fiscalYears.fields.nameAr')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} editable={!disabled} maxLength={100} required />} />
      <Controller control={form.control} name="nameEn" render={({ field }) => <AppTextField name={field.name} label={t('fiscalYears.fields.nameEn')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} editable={!disabled} maxLength={100} required />} />
    </AppFormSection>
    <AppFormSection title={t('fiscalYears.form.calendar')} icon="time-outline">
      <Controller control={form.control} name="startDate" render={({ field }) => <AppDateTimeField name={field.name} label={t('fiscalYears.fields.startDate')} value={field.value} onChangeValue={field.onChange} disabled={disabled} required />} />
      <Controller control={form.control} name="endDate" render={({ field }) => <AppDateTimeField name={field.name} label={t('fiscalYears.fields.endDate')} value={field.value} onChangeValue={field.onChange} disabled helperText={t('fiscalYears.form.endDateHelper')} required />} />
      <Controller control={form.control} name="periodFrequency" render={({ field }) => <AppSelectField name={field.name} label={t('fiscalYears.fields.frequency')} value={field.value ?? 1} onChange={field.onChange} disabled={disabled} required options={[{ value: 1, label: t('fiscalYears.frequency.monthly'), icon: 'calendar-number-outline' }, { value: 2, label: t('fiscalYears.frequency.quarterly'), icon: 'calendar-outline' }]} />} />
      <AppText color="muted" variant="caption">{t('fiscalYears.form.periodsHelper')}</AppText>
    </AppFormSection>
    {displayedPeriods.length ? <AppFormSection title={t('fiscalYears.periods.title')} icon="list-outline"><View style={styles.periods}>{displayedPeriods.map(period => <AppCard key={period.sequence} padding="sm" variant="outlined"><View style={styles.periodHeader}><AppStatusBadge color={theme.colors.primary} label={period.code} /><AppText color="muted" variant="caption">{period.startDate} — {period.endDate}</AppText></View><AppText variant="bodySmall">{'nameEn' in period && 'nameAr' in period ? `${String(period.nameEn)} / ${String(period.nameAr)}` : t('fiscalYears.periods.item', { sequence: period.sequence })}</AppText></AppCard>)}</View></AppFormSection> : null}
  </AppForm>;
}
const styles = StyleSheet.create({ content: { paddingBottom: 24 }, periods: { gap: 8 }, periodHeader: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'center' } });

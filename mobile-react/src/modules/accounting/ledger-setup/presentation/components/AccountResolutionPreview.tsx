import { useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import {
  AppAlert,
  AppDataCard,
  AppDateTimeField,
  AppForm,
  AppSelectField,
  AppText,
  AppTextField,
} from '@/src/shared/components';
import type { LedgerSetupRecord } from '../../domain/models/ledger-setup';
import { useResolveAccountPreview } from '../queries/use-ledger-setup';

const previewSchema = z.object({
  bookId: z.number().int().positive(),
  purposeCode: z.string().trim().min(1),
  onDate: z.string().trim().min(1),
  contextReferenceId: z.string().trim().optional(),
});
type PreviewValues = z.infer<typeof previewSchema>;

function label(item: LedgerSetupRecord): string {
  return [item.code, item.nameEn ?? item.nameAr].filter(Boolean).join(' · ') || String(item.id ?? '');
}

export function AccountResolutionPreview({ books }: { books: LedgerSetupRecord[] }) {
  const { t } = useTranslation();
  const mutation = useResolveAccountPreview();
  const [error, setError] = useState<string | null>(null);
  const defaults = useMemo<PreviewValues>(() => ({ bookId: Number(books[0]?.id ?? 0), purposeCode: '', onDate: new Date().toISOString().slice(0, 10), contextReferenceId: '' }), [books]);
  const form = useZodForm<PreviewValues>(previewSchema, { defaultValues: defaults });
  const options = books.flatMap((item) => typeof item.id === 'number' ? [{ value: item.id, label: label(item), icon: 'book-outline' as const }] : []);

  const submit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      await mutation.mutateAsync({ ...values, contextReferenceId: values.contextReferenceId || null });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('ledgerSetup.messages.previewFailed'));
    }
  });

  return (
    <AppDataCard padding="md">
      <AppText variant="titleSmall" weight="800">{t('ledgerSetup.preview.title')}</AppText>
      <AppText color="muted" variant="bodySmall">{t('ledgerSetup.preview.description')}</AppText>
      <AppForm errors={toFormErrorMap(form.formState.errors)} onClearFieldError={(name) => form.clearErrors(name as keyof PreviewValues)} onSubmit={submit} submitting={mutation.isPending} submitLabel={t('ledgerSetup.preview.resolve')} style={styles.form}>
        <Controller control={form.control} name="bookId" render={({ field }) => <AppSelectField name={field.name} label={t('ledgerSetup.fields.bookId')} value={field.value} options={options} onChange={field.onChange} required />} />
        <Controller control={form.control} name="purposeCode" render={({ field }) => <AppTextField name={field.name} label={t('ledgerSetup.fields.purposeCode')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} required />} />
        <Controller control={form.control} name="onDate" render={({ field }) => <AppDateTimeField name={field.name} label={t('ledgerSetup.fields.onDate')} value={field.value} onChangeValue={field.onChange} required />} />
        <Controller control={form.control} name="contextReferenceId" render={({ field }) => <AppTextField name={field.name} label={t('ledgerSetup.fields.contextReferenceId')} value={field.value ?? ''} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} />} />
      </AppForm>
      {error ? <AppAlert severity="error">{error}</AppAlert> : null}
      {mutation.data ? (
        <View style={styles.result}>
          <AppText weight="700">{t(`ledgerSetup.preview.status.${mutation.data.status}`)}</AppText>
          <AppText color="muted">{mutation.data.accountId ? t('ledgerSetup.preview.account', { id: mutation.data.accountId }) : t('ledgerSetup.preview.noAccount')}</AppText>
          <AppText color="muted" variant="caption">{t('ledgerSetup.preview.candidates', { count: mutation.data.candidates.length })}</AppText>
        </View>
      ) : null}
    </AppDataCard>
  );
}

const styles = StyleSheet.create({ form: { gap: 12, marginTop: 12 }, result: { gap: 4, marginTop: 12 } });

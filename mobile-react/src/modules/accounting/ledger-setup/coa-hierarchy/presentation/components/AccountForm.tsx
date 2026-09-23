import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { applyApiFieldErrors, toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppButton, AppForm, AppFormSection, AppSelectField, AppStateView, AppSwitchField, AppTextField, type AppSelectOption } from '@/src/shared/components';
import type { CurrencyLookup } from '@/src/modules/accounting/currencies';
import { applyInitialAccountCodeProposal } from '../../application/account-code-proposal-policy';
import type { Account, AccountHierarchyLevel, AccountLookup, AccountRequest } from '../../domain/models/coa-hierarchy';
import { createAccountFormSchema } from '../validation/coa-hierarchy-schema';

interface Props {
  item: Account | null;
  mode: 'create' | 'edit' | 'view';
  proposal?: string;
  proposalLoading?: boolean;
  proposalError?: string | null;
  onRetryProposal?: () => void;
  detailLoading?: boolean;
  detailError?: string | null;
  onRetryDetail?: () => void;
  hierarchyLevels: readonly AccountHierarchyLevel[];
  accounts: readonly AccountLookup[];
  currencies: readonly CurrencyLookup[];
  lookupsLoading?: boolean;
  lookupsError?: string | null;
  onRetryLookups?: () => void;
  loading: boolean;
  initialParentId?: number | null;
  canManage: boolean;
  onClose: () => void;
  onSave: (request: AccountRequest) => Promise<void>;
  onEdit?: () => void;
  onLifecycle?: () => void;
}

export function AccountForm({ item, mode, proposal, proposalLoading = false, proposalError = null, onRetryProposal, detailLoading = false, detailError = null, onRetryDetail, hierarchyLevels, accounts, currencies, lookupsLoading = false, lookupsError = null, onRetryLookups, loading, initialParentId = null, canManage, onClose, onSave, onEdit, onLifecycle }: Props) {
  const { t } = useTranslation();
  const schema = useMemo(() => createAccountFormSchema(t), [t]);
  type Values = z.infer<typeof schema>;
  const defaults = useMemo<Values>(() => ({
    code: item?.code ?? '', nameAr: item?.nameAr ?? '', nameEn: item?.nameEn ?? '',
    accountHierarchyLevelId: item?.accountHierarchyLevelId ?? 0,
    parentAccountId: item?.parentAccountId ?? initialParentId ?? 0,
    allowPosting: item?.allowPosting ?? false,
    manualPostingPolicy: item?.manualPostingPolicy ?? 1,
    currencyPolicy: item?.currencyPolicy ?? 1,
    specificCurrencyId: item?.specificCurrencyId ?? 0,
  }), [initialParentId, item]);
  const form = useZodForm<Values>(schema, { defaultValues: defaults });
  const [serverError, setServerError] = useState<string | null>(null);
  const currencyPolicy = useWatch({ control: form.control, name: 'currencyPolicy' });
  const proposalApplied = useRef(false);
  const readOnly = mode === 'view';
  const disabled = readOnly || loading || detailLoading || lookupsLoading || Boolean(detailError);

  useEffect(() => {
    if (mode !== 'create') return;
    const current = form.getValues('code');
    const next = applyInitialAccountCodeProposal(current, proposal, proposalApplied.current);
    proposalApplied.current = next.proposalApplied;
    if (next.code !== current) form.setValue('code', next.code, { shouldDirty: false, shouldValidate: false });
  }, [form, mode, proposal]);

  const parentOptions = useMemo<AppSelectOption<number>[]>(() => [
    { value: 0, label: t('coaHierarchy.accounts.noParent'), icon: 'remove-circle-outline' },
    ...accounts.filter(account => account.id !== item?.id && !account.allowPosting).map(account => ({ value: account.id, label: `${account.code} · ${account.nameEn}`, icon: 'git-branch-outline' as const })),
  ], [accounts, item?.id, t]);
  const levelOptions = useMemo<AppSelectOption<number>[]>(() => hierarchyLevels.filter(level => !level.isDeleted).map(level => ({ value: level.id, label: `${level.levelNumber} · ${level.nameEn}`, icon: 'layers-outline' })), [hierarchyLevels]);
  const currencyOptions = useMemo<AppSelectOption<number>[]>(() => currencies.map(currency => ({ value: currency.id, label: `${currency.currencyCode} · ${currency.nameEn}`, icon: 'cash-outline' })), [currencies]);

  const submit = form.handleSubmit(async values => {
    setServerError(null);
    try {
      await onSave({
        code: values.code,
        nameAr: values.nameAr,
        nameEn: values.nameEn,
        accountHierarchyLevelId: values.accountHierarchyLevelId,
        parentAccountId: values.parentAccountId > 0 ? values.parentAccountId : null,
        allowPosting: values.allowPosting,
        manualPostingPolicy: values.manualPostingPolicy,
        currencyPolicy: values.currencyPolicy,
        specificCurrencyId: values.currencyPolicy === 3 && values.specificCurrencyId > 0 ? values.specificCurrencyId : null,
      });
    } catch (error) {
      if (!applyApiFieldErrors(form, error)) setServerError(error instanceof Error ? error.message : t('coaHierarchy.messages.saveFailed'));
    }
  });

  return <AppForm visible presentation="fullScreen" title={t(`coaHierarchy.accounts.form.${mode}Title`)} subtitle={t('coaHierarchy.accounts.form.subtitle')} icon={mode === 'create' ? 'add-circle-outline' : readOnly ? 'eye-outline' : 'create-outline'} errors={toFormErrorMap(form.formState.errors)} isDirty={form.formState.isDirty} submitting={loading || form.formState.isSubmitting} submitDisabled={detailLoading || lookupsLoading || Boolean(detailError) || Boolean(lookupsError) || (mode === 'create' && (proposalLoading || Boolean(proposalError)))} onCancel={onClose} onClearFieldError={name => form.clearErrors(name as keyof Values)} onSubmit={readOnly ? undefined : submit} submitLabel={t(mode === 'edit' ? 'common.update' : 'common.create')} serverError={serverError} contentContainerStyle={styles.content}>
    {detailLoading ? <AppStateView state="loading" /> : null}
    {detailError ? <AppStateView state="error" message={detailError} onRetry={onRetryDetail} /> : null}
    {mode === 'create' && proposalLoading ? <AppStateView state="loading" /> : null}
    {mode === 'create' && proposalError ? <AppStateView state="error" message={proposalError} onRetry={onRetryProposal} /> : null}
    {lookupsError ? <AppStateView state="error" message={lookupsError} onRetry={onRetryLookups} /> : null}
    <AppFormSection title={t('coaHierarchy.accounts.form.identity')} icon="git-branch-outline">
      {readOnly && item && canManage ? <View style={styles.actions}>{onEdit ? <AppButton variant="outline" onPress={onEdit} icon="create-outline">{t('common.edit')}</AppButton> : null}{onLifecycle ? <AppButton variant="outline" onPress={onLifecycle} icon={item.isDeleted ? 'refresh-outline' : 'archive-outline'}>{t(item.isDeleted ? 'common.restore' : 'common.archive')}</AppButton> : null}</View> : null}
      <Controller control={form.control} name="code" render={({ field }) => <AppTextField name={field.name} label={t('coaHierarchy.fields.code')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} editable={!disabled} autoCapitalize="characters" maxLength={50} required />} />
      <Controller control={form.control} name="nameEn" render={({ field }) => <AppTextField name={field.name} label={t('coaHierarchy.fields.nameEn')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} editable={!disabled} maxLength={200} required />} />
      <Controller control={form.control} name="nameAr" render={({ field }) => <AppTextField name={field.name} label={t('coaHierarchy.fields.nameAr')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} editable={!disabled} maxLength={200} required />} />
      <Controller control={form.control} name="accountHierarchyLevelId" render={({ field }) => <AppSelectField name={field.name} label={t('coaHierarchy.fields.hierarchyLevel')} value={field.value} onChange={value => field.onChange(Number(value))} options={levelOptions} disabled={disabled} required searchable={levelOptions.length > 12} />} />
      <Controller control={form.control} name="parentAccountId" render={({ field }) => <AppSelectField name={field.name} label={t('coaHierarchy.fields.parentAccount')} value={field.value} onChange={value => field.onChange(Number(value))} options={parentOptions} disabled={disabled} searchable={parentOptions.length > 12} />} />
    </AppFormSection>
    <AppFormSection title={t('coaHierarchy.accounts.form.posting')} icon="document-text-outline">
      <Controller control={form.control} name="allowPosting" render={({ field, fieldState }) => <AppSwitchField name={field.name} label={t('coaHierarchy.fields.allowPosting')} value={field.value} onValueChange={field.onChange} disabled={disabled} error={fieldState.error?.message} />} />
      <Controller control={form.control} name="manualPostingPolicy" render={({ field }) => <AppSelectField name={field.name} label={t('coaHierarchy.fields.manualPostingPolicy')} value={field.value} onChange={value => field.onChange(Number(value))} disabled={disabled} required options={([1, 2, 3] as const).map(value => ({ value, label: t(`coaHierarchy.manualPosting.${value}`), icon: 'document-text-outline' }))} />} />
      <Controller control={form.control} name="currencyPolicy" render={({ field }) => <AppSelectField name={field.name} label={t('coaHierarchy.fields.currencyPolicy')} value={field.value} onChange={value => field.onChange(Number(value))} disabled={disabled} required options={([1, 2, 3] as const).map(value => ({ value, label: t(`coaHierarchy.currencyPolicy.${value}`), icon: 'cash-outline' }))} />} />
      {currencyPolicy === 3 ? <Controller control={form.control} name="specificCurrencyId" render={({ field }) => <AppSelectField name={field.name} label={t('coaHierarchy.fields.specificCurrency')} value={field.value} onChange={value => field.onChange(Number(value))} options={currencyOptions} disabled={disabled} required searchable={currencyOptions.length > 12} />} /> : null}
    </AppFormSection>
  </AppForm>;
}

const styles = StyleSheet.create({ content: { paddingBottom: 24 }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } });

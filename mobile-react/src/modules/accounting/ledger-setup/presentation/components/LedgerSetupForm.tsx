import { useMemo, useRef, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { applyApiFieldErrors, toFormErrorMap, useZodForm } from '@/src/core/validation';
import {
  AppDateTimeField,
  AppButton,
  AppForm,
  AppFormSection,
  AppSelectField,
  type AppIconName,
  AppTextField,
  type AppSelectOption,
} from '@/src/shared/components';
import type {
  LedgerSetupEntityDefinition,
  LedgerSetupField,
  LedgerSetupFormValues,
  LedgerSetupRecord,
} from '../../domain/models/ledger-setup';
import { createLedgerSetupSchema } from '../validation/ledger-setup-schema';

interface LedgerSetupFormProps {
  definition: LedgerSetupEntityDefinition;
  item: LedgerSetupRecord | null;
  lookups: Record<string, LedgerSetupRecord[]>;
  mode: 'create' | 'edit' | 'view';
  loading: boolean;
  onClose: () => void;
  onSave: (request: LedgerSetupFormValues) => Promise<void>;
  onArchive?: () => void;
}

function recordLabel(item: LedgerSetupRecord): string {
  const code = item.code ?? item.currencyCode ?? item.levelNumber;
  const name = item.nameEn ?? item.nameAr;
  return [code, name].filter((value) => value !== null && value !== undefined && value !== '').join(' · ') || String(item.id ?? '');
}

function fieldOptions(field: LedgerSetupField, lookups: Record<string, LedgerSetupRecord[]>, translate: (key: string) => string): AppSelectOption<string | number>[] {
  if (field.options) return field.options.map((option) => ({ value: option.value, label: translate(option.labelKey), icon: 'ellipse-outline' as AppIconName }));
  if (!field.optionSource) return [];
  return (lookups[field.optionSource] ?? []).flatMap((item) => typeof item.id === 'number'
    ? [{ value: item.id, label: recordLabel(item), icon: 'ellipse-outline' as const }]
    : []);
}

function LedgerSetupSelectField({ name, label, value, options, onChange, disabled, required }: {
  name: string;
  label: string;
  value: string | number;
  options: AppSelectOption<string | number>[];
  onChange: (value: string | number) => void;
  disabled: boolean;
  required?: boolean;
}) {
  const [search, setSearch] = useState('');
  return <AppSelectField name={name} label={label} value={value} options={options.filter((option) => option.label.toLocaleLowerCase().includes(search.toLocaleLowerCase()))} onChange={(selected) => { onChange(selected); setSearch(''); }} disabled={disabled} required={required} searchable={options.length > 12} searchValue={search} onSearchChange={setSearch} />;
}

function defaultValues(definition: LedgerSetupEntityDefinition, item: LedgerSetupRecord | null): LedgerSetupFormValues {
  return Object.fromEntries(definition.fields.map((field) => {
    const value = item?.[field.name];
    if (field.type === 'boolean') return [field.name, typeof value === 'boolean' ? value : false];
    return [field.name, typeof value === 'string' || typeof value === 'number' ? value : ''];
  }));
}

function mockValue(field: LedgerSetupField, sequence: number, lookups: Record<string, LedgerSetupRecord[]>): LedgerSetupFormValues[string] {
  if (field.optionSource) return (lookups[field.optionSource]?.[0]?.id as number | undefined) ?? '';
  if (field.options?.length) return field.options[0].value;
  if (field.type === 'boolean') return true;
  if (field.type === 'number') return field.name === 'rate' ? 1 : sequence;
  if (field.type === 'date') return new Date().toISOString().slice(0, 10);
  if (field.name === 'code' || field.name.endsWith('Code')) return `DEMO-${sequence}`;
  if (field.name === 'nameAr') return `بيانات تجريبية ${sequence}`;
  if (field.name === 'nameEn') return `Demo ${sequence}`;
  return `DEMO-${sequence}`;
}

export function LedgerSetupForm({ definition, item, lookups, mode, loading, onClose, onSave, onArchive }: LedgerSetupFormProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createLedgerSetupSchema(definition.fields, t('ledgerSetup.validation.required')), [definition.fields, t]);
  const defaults = useMemo(() => defaultValues(definition, item), [definition, item]);
  const form = useZodForm<LedgerSetupFormValues>(schema, { defaultValues: defaults });
  const currencyPolicy = useWatch({ control: form.control, name: 'currencyPolicy' });
  const [serverError, setServerError] = useState<string | null>(null);
  const mockSequence = useRef(1);
  const readOnly = mode === 'view';

  const submit = form.handleSubmit(async (values) => {
    setServerError(null);
    try {
      await onSave({ ...values, ...(definition.entity === 'accounts' && values.currencyPolicy !== 3 ? { specificCurrencyId: null } : {}), rowVersion: item?.rowVersion });
    } catch (error) {
      if (!applyApiFieldErrors(form, error)) setServerError(error instanceof Error ? error.message : t('ledgerSetup.messages.saveFailed'));
    }
  });

  const generateMock = () => {
    const sequence = mockSequence.current++;
    for (const field of definition.fields) {
      if (field.name === 'specificCurrencyId') continue;
      form.setValue(field.name, mockValue(field, sequence, lookups), { shouldDirty: true, shouldValidate: true });
    }
  };

  return (
    <AppForm
      visible
      presentation="fullScreen"
      title={t(mode === 'create' ? 'ledgerSetup.form.createTitle' : mode === 'edit' ? 'ledgerSetup.form.editTitle' : 'ledgerSetup.form.viewTitle', { entity: t(definition.titleKey) })}
      subtitle={t('ledgerSetup.form.subtitle')}
      icon={definition.icon as AppIconName}
      errors={toFormErrorMap(form.formState.errors)}
      isDirty={form.formState.isDirty}
      submitting={loading || form.formState.isSubmitting}
      onCancel={onClose}
      onClearFieldError={(name) => form.clearErrors(name)}
      onSubmit={readOnly ? undefined : submit}
      submitLabel={t(mode === 'edit' ? 'common.update' : 'common.create')}
      serverError={serverError}
      mockDataAction={__DEV__ && !readOnly ? { onGenerate: generateMock, disabled: loading } : undefined}
      contentContainerStyle={styles.content}>
      <AppFormSection title={t(definition.titleKey)} icon={definition.icon as AppIconName}>
        {readOnly && onArchive ? <AppButton variant="outline" onPress={onArchive}>{t(item?.isDeleted ? 'common.restore' : 'common.archive')}</AppButton> : null}
        {definition.fields.filter((field) => field.name !== 'specificCurrencyId' || definition.entity !== 'accounts' || Number(currencyPolicy) === 3).map((field) => (
          <Controller
            control={form.control}
            key={field.name}
            name={field.name}
            render={({ field: control }) => {
              if (field.type === 'select' || field.type === 'boolean') {
                const options = fieldOptions(field, lookups, t).filter((option) => field.name !== 'parentAccountId' || option.value !== item?.id);
                const selectedValue = field.type === 'boolean' ? (control.value ? 1 : 0) : typeof control.value === 'number' || typeof control.value === 'string' ? control.value : '';
                return <LedgerSetupSelectField name={control.name} label={t(field.labelKey)} value={selectedValue} options={options} onChange={(value) => control.onChange(field.type === 'boolean' ? Number(value) === 1 : value)} disabled={readOnly || loading} required={field.required || (field.name === 'specificCurrencyId' && Number(currencyPolicy) === 3)} />;
              }
              if (field.type === 'date') {
                return <AppDateTimeField name={control.name} label={t(field.labelKey)} value={typeof control.value === 'string' ? control.value : ''} onChangeValue={control.onChange} disabled={readOnly || loading} required={field.required} />;
              }
              return <AppTextField name={control.name} label={t(field.labelKey)} value={control.value == null ? '' : String(control.value)} onChangeText={control.onChange} onBlur={control.onBlur} ref={control.ref} editable={!readOnly && !loading} required={field.required} numeric={field.type === 'number' && field.name !== 'rate'} keyboardType={field.name === 'rate' ? 'decimal-pad' : undefined} />;
            }}
          />
        ))}
      </AppFormSection>
    </AppForm>
  );
}

const styles = StyleSheet.create({ content: { paddingBottom: 24 } });

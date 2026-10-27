import { useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/src/core/api';
import { useZodForm } from '@/src/core/validation';
import { appRoles, permissions, useAuth, useAuthorization } from '@/src/platform/auth';
import { AppButton, AppForm, AppFormSection, AppPageHeader, AppScreen, AppStateView, AppText, AppTextField, showToast } from '@/src/shared/components';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';

import { useErrorLogSettings, useSaveErrorLogSettings } from '../queries/use-error-logs';
import { retentionSchema, type RetentionValues } from '../validation/retention-schema';

export function ErrorLogSettingsScreen() {
  const { t } = useTranslation();
  const { isServerAuthenticated, isSwitchingCompany } = useAuth();
  const onlineAuthority = isServerAuthenticated && !isSwitchingCompany;
  const { allowed: canView } = useAuthorization({ allowedRoles: [appRoles.superAdmin], requiredPermissions: [permissions.ViewErrorLogSettings] });
  const { allowed: canEdit } = useAuthorization({ allowedRoles: [appRoles.superAdmin], requiredPermissions: [permissions.EditErrorLogSettings] });
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const query = useErrorLogSettings(canView && onlineAuthority);
  const mutation = useSaveErrorLogSettings();
  const [revision, setRevision] = useState<number | null>(null);
  const [conflict, setConflict] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const schema = useMemo(() => retentionSchema(t('errorLogSettings.required'), t('errorLogSettings.range')), [t]);
  const form = useZodForm<RetentionValues>(schema, { defaultValues: { retentionDays: '' } });
  const save = form.handleSubmit(async (values) => {
    if (!canEdit || !onlineAuthority || revision === null || mutation.isPending) return;
    if (isReadOnly) { notifyBlockedAction(); return; }
    setServerError(null);
    try {
      const saved = await mutation.mutateAsync({ retentionDays: Number(values.retentionDays), expectedRevision: revision });
      setRevision(saved.revision);
      setConflict(false);
      form.reset({ retentionDays: String(saved.retentionDays) });
      setEditing(false);
      showToast.success(t('errorLogSettings.saved'));
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setConflict(true);
        setServerError(t('errorLogSettings.conflict'));
        return;
      }
      if (error instanceof ApiError && error.problem?.errors) {
        const fieldError = Object.entries(error.problem.errors).find(([key]) => key.toLowerCase() === 'retentiondays');
        if (fieldError?.[1].length) { form.setError('retentionDays', { type: 'server', message: fieldError[1].join(' ') }); return; }
      }
      setServerError(error instanceof Error ? error.message : t('errorLogSettings.saveFailed'));
    }
  });
  const reloadRevision = async () => {
    const result = await query.refetch();
    if (result.data) { setRevision(result.data.revision); setConflict(false); setServerError(null); }
  };
  if (!canView || !onlineAuthority) return <AppScreen><AppStateView state="error" message={t('errorLogs.forbidden')} /></AppScreen>;
  if (query.isLoading) return <AppScreen><AppStateView state="loading" /></AppScreen>;
  if (query.error || !query.data) return <AppScreen><AppStateView state="error" message={t('errorLogSettings.loadFailed')} onRetry={() => void query.refetch()} /></AppScreen>;
  return <AppScreen edges={['left', 'right', 'bottom']}>
    <AppPageHeader title={t('errorLogSettings.title')} subtitle={t('errorLogSettings.description')} />
    <AppText>{t('errorLogSettings.retentionDays')}: {query.data.retentionDays}</AppText>
    <AppText>{t('errorLogSettings.queueDepth', { count: query.data.queueDepth })}</AppText>
    <AppText>{t('errorLogSettings.droppedCount', { count: query.data.droppedCount })}</AppText>
    <AppText>{t('errorLogSettings.failedWrites', { count: query.data.failedWrites })}</AppText>
    {canEdit ? <AppButton onPress={() => { setServerError(null); setConflict(false); setRevision(query.data.revision); form.reset({ retentionDays: String(query.data.retentionDays) }); setEditing(true); }}>{t('common.edit')}</AppButton> : null}
    <AppForm title={t('errorLogSettings.title')} presentation="dialog" visible={editing} onCancel={() => { setEditing(false); form.reset({ retentionDays: String(query.data.retentionDays) }); }} icon="settings-outline" errors={form.formState.errors.retentionDays ? { retentionDays: form.formState.errors.retentionDays.message } : {}} isDirty={form.formState.isDirty} submitting={mutation.isPending} onSubmit={canEdit ? save : undefined} submitLabel={t('common.save')} serverError={serverError} onClearFieldError={(name) => form.clearErrors(name as keyof RetentionValues)} mockDataAction={{ onGenerate: () => form.setValue('retentionDays', '30', { shouldDirty: true }), disabled: !canEdit || isReadOnly }}>
      <AppFormSection title={t('errorLogSettings.retentionDays')} icon="time-outline">
        <Controller control={form.control} name="retentionDays" render={({ field }) => <AppTextField name={field.name} label={t('errorLogSettings.retentionDays')} helperText={t('errorLogSettings.range')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} keyboardType="number-pad" numeric required editable={canEdit && !isReadOnly} />} />
        <AppText variant="bodySmall">{t('errorLogSettings.queueDepth', { count: query.data.queueDepth })}</AppText>
        <AppText variant="bodySmall">{t('errorLogSettings.droppedCount', { count: query.data.droppedCount })}</AppText>
        <AppText variant="bodySmall">{t('errorLogSettings.failedWrites', { count: query.data.failedWrites })}</AppText>
        {conflict ? <AppButton variant="outline" onPress={() => void reloadRevision()}>{t('errorLogSettings.reloadRevision')}</AppButton> : null}
      </AppFormSection>
    </AppForm>
  </AppScreen>;
}

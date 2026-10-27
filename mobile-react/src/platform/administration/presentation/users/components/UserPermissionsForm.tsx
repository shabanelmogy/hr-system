import { useEffect, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/src/core/api';
import { useZodForm, toFormErrorMap } from '@/src/core/validation';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import { AppButton, AppForm, AppFormSection, AppStateView, AppText, AppTextField, AppSelectField, AppSegmentedControl, DiscardChangesDialog, useDiscardChanges, showToast } from '@/src/shared/components';
import type { UserCompanyPermissions } from '../../../domain/models/administration';
import { groupRoleClaims, summarizePermissionBusinessModules, getPermissionScreenLabel, type PermissionGroup } from '../../roles/permissions/permission-groups';
import { PermissionBusinessModuleRail } from '../../roles/permissions/components/PermissionBusinessModuleRail';
import { PermissionModuleCard } from '../../roles/permissions/components/PermissionModuleCard';
import { userPermissionsSchema } from '../../validation/user-permissions-validation';

interface Props {
  canEdit: boolean; loading: boolean; error: unknown; onClose: () => void;
  onReload: () => Promise<UserCompanyPermissions | undefined>;
  onSave: (permissions: string[], revision: number) => Promise<void>;
  value: UserCompanyPermissions | undefined; visible: boolean;
}
type Values = { permissions: string[] };

export function UserPermissionsForm({ canEdit, error, loading, onClose, onReload, onSave, value, visible }: Props) {
  const { t } = useTranslation();
  const { isReadOnly } = useAppReadOnly();
  const baseline = useRef<UserCompanyPermissions | null>(null);
  const [search, setSearch] = useState('');
  const [requestedModule, setRequestedModule] = useState('');
  const [screen, setScreen] = useState('');
  const [onlySelected, setOnlySelected] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string>();
  const [focusErrorRequestId, setFocusErrorRequestId] = useState(0);
  const form = useZodForm<Values>(userPermissionsSchema, { defaultValues: { permissions: [] } });
  const { control, handleSubmit, reset, setValue, setError, formState: { isDirty, errors, isSubmitting } } = form;
  const selected = useWatch({ control, name: 'permissions' }) ?? [];
  const selectionFilter = onlySelected ? 'selected' : 'all';
  const busy = loading || isSubmitting;
  const editable = canEdit && !isReadOnly && !busy;
  useEffect(() => {
    if (!value || baseline.current) return;
    baseline.current = value;
    reset({ permissions: value.permissions.filter((row) => row.isDirect).map((row) => row.permission) });
  }, [reset, value]);
  const rows = value?.permissions ?? [];
  const claims = rows.map((row) => ({ displayValue: row.permission, moduleCode: row.moduleCode || 'platform', isSelected: selected.includes(row.permission) }));
  const groups = groupRoleClaims(claims);
  const modules = summarizePermissionBusinessModules(groups);
  const activeModule = modules.find((item) => item.code === requestedModule)?.code ?? modules[0]?.code ?? '';
  const moduleGroups = groups.filter((group) => group.moduleCode === activeModule);
  const visibleGroups = moduleGroups.filter((group) => (!screen || screen === group.screen)
    && (!onlySelected || group.claims.some(({ claim }) => claim.isSelected))
    && (!search || [getPermissionScreenLabel(group.screen, t), ...group.claims.map(({ claim }) => claim.displayValue)].join(' ').toLocaleLowerCase().includes(search.toLocaleLowerCase())));
  const choose = (next: string[]) => {
    if (!editable) return;
    setValue('permissions', [...new Set(next)], { shouldDirty: true, shouldValidate: true });
  };
  const toggle = (index: number) => {
    const row = rows[index];
    if (!row || (!row.canGrant && !row.isDirect)) return;
    choose(selected.includes(row.permission) ? selected.filter((key) => key !== row.permission) : [...selected, row.permission]);
  };
  const setGroup = (group: PermissionGroup, checked: boolean) => {
    const keys = group.claims.filter(({ index }) => rows[index].canGrant || rows[index].isDirect).map(({ claim }) => claim.displayValue);
    choose(checked ? [...selected, ...keys] : selected.filter((key) => !keys.includes(key)));
  };
  const reload = async () => {
    try {
      const latest = await onReload();
      if (!latest) return;
      baseline.current = latest;
      reset({ permissions: latest.permissions.filter((row) => row.isDirect).map((row) => row.permission) });
      setSaveError(undefined);
    } catch (cause) { showToast.error(cause, t('userPermissions.loadFailed')); }
  };
  const discard = useDiscardChanges({ active: visible, busy, isDirty, onDiscard: () => { void reload(); } });
  const submit = () => handleSubmit(async ({ permissions }) => {
    if (!canEdit || isReadOnly || loading || !baseline.current) return;
    setSaveError(undefined);
    try {
      await onSave(permissions, baseline.current.revision);
      showToast.success(t('userPermissions.saved'));
      onClose();
    } catch (cause) {
      setSaveError(t('userPermissions.saveFailed'));
      if (cause instanceof ApiError && cause.problem?.errors) {
        for (const [field, messages] of Object.entries(cause.problem.errors)) {
          if (field.toLowerCase().endsWith('permissions')) setError('permissions', { type: 'server', message: messages.join(' ') });
        }
      }
      setFocusErrorRequestId((current) => current + 1);
    }
  }, () => setFocusErrorRequestId((current) => current + 1))();

  return <>
    <AppForm cancelLabel={t('common.close')} errors={toFormErrorMap(errors)} focusErrorRequestId={focusErrorRequestId}
      icon="key-outline" isDirty={isDirty} onCancel={onClose} onSubmit={canEdit && !isReadOnly ? submit : undefined}
      presentation="fullScreen" serverError={saveError} submitDisabled={!value} submitLabel={t('common.save')}
      submitting={busy} subtitle={value ? t('userPermissions.subtitle', { company: value.companyName }) : undefined}
      title={t('userPermissions.title')} visible={visible}
      mockDataAction={{ disabled: !editable || !value, onGenerate: () => choose(rows.filter((row) => row.canGrant).slice(0, 3).map((row) => row.permission)) }}>
      {!value ? <AppStateView message={error ? t('userPermissions.loadFailed') : undefined} onRetry={error ? () => { void reload(); } : undefined} state={error ? 'error' : 'loading'} /> : (
        <AppFormSection description={t('userPermissions.description')} title={value.userName}>
          <PermissionBusinessModuleRail horizontal modules={modules} onSelect={(code) => { setRequestedModule(code); setScreen(''); }} selectedModule={activeModule} />
          <AppTextField label={t('roleManagement.searchPermissions')} onChangeText={setSearch} value={search} />
          <AppSelectField label={t('roleManagement.allScreens')} onChange={(choice) => setScreen(String(choice))} options={[
            { value: '', label: t('roleManagement.allScreens'), icon: 'apps-outline' },
            ...moduleGroups.map((group) => ({ value: group.screen, label: getPermissionScreenLabel(group.screen, t), icon: 'folder-open-outline' as const })),
          ]} value={screen} />
          <AppSegmentedControl label={t('roleManagement.allPermissions')} onChange={(choice) => setOnlySelected(choice === 'selected')} options={[
            { value: 'all', label: t('roleManagement.allPermissions') },
            { value: 'selected', label: t('roleManagement.selectedOnly') },
          ]} value={selectionFilter} />
          {errors.permissions?.message ? <AppText color="danger">{errors.permissions.message}</AppText> : null}
          <View style={styles.groups}>
            {visibleGroups.length ? visibleGroups.map((group) => <PermissionModuleCard key={group.screen}
              disabled={!editable} expanded={expanded === group.screen} group={group}
              isClaimDisabled={(index) => !rows[index].canGrant && !rows[index].isDirect}
              onSetModule={setGroup} onToggle={toggle} onToggleExpanded={() => setExpanded(expanded === group.screen ? null : group.screen)}
              renderClaimDetails={(index) => <AppText color="muted" variant="caption">
                {rows[index].inheritedFrom.map((role) => t('userPermissions.inherited', { role })).join(' · ')}
                {selected.includes(rows[index].permission) ? ' · ' + t('userPermissions.direct') : ''}
                {selected.includes(rows[index].permission) || rows[index].inheritedFrom.length ? ' · ' + t('userPermissions.effective') : ''}
              </AppText>} />) : <AppStateView state="empty" message={t('roleManagement.noPermissionMatches')} />}
          </View>
          <AppText color="muted" variant="caption">{t('userPermissions.selectionCount', { count: selected.length })}</AppText>
          <AppButton disabled={busy} icon="refresh-outline" onPress={discard.requestClose} variant="outline">{t('userPermissions.reload')}</AppButton>
        </AppFormSection>
      )}
    </AppForm>
    <DiscardChangesDialog loading={busy} onCancel={discard.keepEditing} onDiscard={discard.discard} visible={discard.dialogVisible} />
  </>;
}
const styles = StyleSheet.create({ groups: { gap: 12 } });

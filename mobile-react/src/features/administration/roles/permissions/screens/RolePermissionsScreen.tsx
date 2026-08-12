import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/src/core/api';
import { asHref, ROUTES } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { permissions, useAuthorization } from '@/src/features/auth';
import {
  AppButton,
  AppCard,
  AppForm,
  AppIconButton,
  AppScreen,
  AppSegmentedControl,
  AppSelectField,
  AppStateView,
  AppText,
  AppTextField,
  DiscardChangesDialog,
  showToast,
  useDiscardChanges,
} from '@/src/shared/components';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import {
  useRoleClaims,
  useUpdateRoleClaims,
} from '../../../hooks/useAdministration';
import type { RolePermissionsFormValues } from '../../../types/administration';
import { rolePermissionsSchema } from '../../../validation/role-validation';
import { PermissionModuleCard } from '../components/PermissionModuleCard';
import {
  getPermissionActionLabel,
  getPermissionModuleLabel,
  groupRoleClaims,
  type PermissionGroup,
} from '../permission-groups';

const editRolePermissions = [permissions.EditRoles] as const;

interface RolePermissionsScreenProps {
  roleId: string;
}

export function RolePermissionsScreen({ roleId }: RolePermissionsScreenProps) {
  const { t, i18n } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const { isReadOnly } = useAppReadOnly();
  const { allowed: canEdit } = useAuthorization({
    requiredPermissions: editRolePermissions,
  });
  const roleQuery = useRoleClaims(roleId);
  const updateMutation = useUpdateRoleClaims();
  const initializedRoleId = useRef<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectionFilter, setSelectionFilter] = useState<'all' | 'selected'>('all');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkTools, setShowBulkTools] = useState(false);
  const form = useZodForm<RolePermissionsFormValues>(rolePermissionsSchema, {
    defaultValues: { id: roleId, name: '', roleClaims: [] },
  });
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = form;
  const watchedClaims = useWatch({ control, name: 'roleClaims' });
  const claims = useMemo(() => watchedClaims ?? [], [watchedClaims]);
  const roleName = useWatch({ control, name: 'name' }) ?? '';
  const busy = isSubmitting || updateMutation.isPending;
  const editingDisabled = !canEdit || isReadOnly || busy;

  useEffect(() => {
    if (!roleQuery.data || initializedRoleId.current === roleQuery.data.id) return;
    initializedRoleId.current = roleQuery.data.id;
    reset({
      id: roleQuery.data.id,
      name: roleQuery.data.name,
      roleClaims: roleQuery.data.roleClaims.map((claim) => ({ ...claim })),
    });
  }, [reset, roleQuery.data]);

  const groups = useMemo(() => groupRoleClaims(claims), [claims]);
  const moduleOptions = useMemo(() => [
    { value: '', label: t('roleManagement.allModules'), icon: 'apps-outline' as const },
    ...groups.map((group) => ({
      value: group.module,
      label: getPermissionModuleLabel(group.module, t),
      icon: 'folder-open-outline' as const,
    })),
  ], [groups, t]);
  const actionOptions = useMemo(() => [
    { value: '', label: t('roleManagement.choosePermissionAction'), icon: 'key-outline' as const },
    ...[...new Set(groups.flatMap((group) => group.claims.map(({ action }) => action)))]
      .sort((left, right) => left.localeCompare(right))
      .map((action) => ({
        value: action,
        label: getPermissionActionLabel(action, t),
        icon: 'shield-checkmark-outline' as const,
      })),
  ], [groups, t]);
  const filteredGroups = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(i18n.language);

    return groups.filter((group) => {
      if (selectedModule && group.module !== selectedModule) return false;
      if (selectionFilter === 'selected' && !group.claims.some(({ claim }) => claim.isSelected)) {
        return false;
      }
      if (!query) return true;

      return [
        group.module,
        getPermissionModuleLabel(group.module, t),
        ...group.claims.flatMap(({ action, claim }) => [action, claim.displayValue]),
      ].some((value) => value.toLocaleLowerCase(i18n.language).includes(query));
    });
  }, [groups, i18n.language, search, selectedModule, selectionFilter, t]);
  const selectedCount = claims.filter((claim) => claim.isSelected).length;
  const percentage = claims.length ? Math.round((selectedCount / claims.length) * 100) : 0;
  const hasActiveFilters = Boolean(selectedModule) || selectionFilter !== 'all';
  const fieldErrors = useMemo(() => toFormErrorMap(errors), [errors]);

  const replaceClaims = (indexes: ReadonlySet<number>, selected?: boolean) => {
    const nextClaims = claims.map((claim, index) => {
      if (!indexes.has(index)) return claim;
      return { ...claim, isSelected: selected ?? !claim.isSelected };
    });
    setValue('roleClaims', nextClaims, { shouldDirty: true, shouldValidate: true });
  };

  const toggleClaim = (claimIndex: number) => {
    if (editingDisabled) return;
    replaceClaims(new Set([claimIndex]));
  };

  const setModuleSelection = (group: PermissionGroup, selected: boolean) => {
    if (editingDisabled) return;
    replaceClaims(new Set(group.claims.map(({ index }) => index)), selected);
  };

  const setVisibleSelection = (selected: boolean) => {
    if (editingDisabled) return;
    replaceClaims(
      new Set(filteredGroups.flatMap((group) => group.claims.map(({ index }) => index))),
      selected,
    );
  };

  const setActionSelection = (selected: boolean) => {
    if (editingDisabled || !selectedAction) return;
    replaceClaims(
      new Set(groups.flatMap((group) => group.claims)
        .filter(({ action }) => action === selectedAction)
        .map(({ index }) => index)),
      selected,
    );
  };

  const leaveScreen = () => router.replace(asHref(ROUTES.administration.roles));
  const discard = useDiscardChanges({
    active: true,
    busy,
    isDirty,
    onDiscard: leaveScreen,
  });
  const submit = handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync(values);
      reset(values);
      showToast.success(t('roleManagement.permissionsUpdatedSuccessfully'));
      router.replace(asHref(ROUTES.administration.roles));
    } catch (error) {
      showToast.error(error, t('roleManagement.permissionsSaveFailed'));
    }
  });

  if (!roleId) {
    return (
      <AppScreen edges={['left', 'right', 'bottom']}>
        <AppStateView message={t('roleManagement.roleNotFound')} state="error" />
      </AppScreen>
    );
  }

  if (roleQuery.isLoading) {
    return (
      <AppScreen contentContainerStyle={styles.centered} edges={['left', 'right', 'bottom']}>
        <AppStateView state="loading" />
      </AppScreen>
    );
  }

  if (roleQuery.isError || !roleQuery.data) {
    return (
      <AppScreen contentContainerStyle={styles.centered} edges={['left', 'right', 'bottom']}>
        <AppStateView
          message={getErrorMessage(roleQuery.error, t('roleManagement.roleNotFound'))}
          onRetry={() => void roleQuery.refetch()}
          state="error"
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      footer={canEdit ? (
        <AppButton
          disabled={isReadOnly || busy || !isDirty}
          fullWidth
          icon="save-outline"
          loading={busy}
          onPress={() => void submit()}>
          {t('roleManagement.savePermissions')}
        </AppButton>
      ) : null}>
      <AppForm
        autoFocusFirstInput={false}
        errors={fieldErrors}
        isDirty={isDirty}
        presentation="inline"
        submitting={busy}>
        <View style={[styles.heading, { direction }]}>
          <AppIconButton
            icon={isRTL ? 'arrow-forward-outline' : 'arrow-back-outline'}
            label={t('roleManagement.backToRoles')}
            onPress={discard.requestClose}
          />
          <View style={styles.headingText}>
            <AppText numberOfLines={1} variant="titleSmall">
              {t('roleManagement.permissionsTitle', { role: roleName })}
            </AppText>
            <AppText color="muted" variant="caption">
              {canEdit
                ? t('roleManagement.permissionsSubtitle')
                : t('roleManagement.permissionsReadOnly')}
            </AppText>
          </View>
        </View>

        <AppCard padding="sm" style={styles.summary} variant="filled">
          <View style={[styles.summaryRow, { direction }]}>
            <View style={styles.summaryText}>
              <AppText variant="label" weight="800">
                {t('roleManagement.selectedOfTotal', {
                  selected: selectedCount,
                  total: claims.length,
                })} {t('roleManagement.selected')}
              </AppText>
              <AppText color="muted" variant="caption">{t('roleManagement.coverage')}</AppText>
            </View>
            <AppText color="success" variant="titleSmall" weight="800">{percentage}%</AppText>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.progressValue,
                {
                  backgroundColor: theme.colors.success,
                  width: `${percentage}%` as `${number}%`,
                },
              ]}
            />
          </View>
        </AppCard>

        <View style={[styles.searchRow, { direction }]}>
          <View style={styles.searchField}>
            <AppTextField
              compact
              label={t('roleManagement.searchPermissions')}
              leadingIcon="search-outline"
              onChangeText={setSearch}
              showClearButton
              value={search}
            />
          </View>
          <AppIconButton
            color={showFilters || hasActiveFilters ? theme.colors.primary : theme.colors.textMuted}
            icon={showFilters ? 'options' : 'options-outline'}
            label={t(showFilters ? 'roleManagement.hideFilters' : 'roleManagement.showFilters')}
            onPress={() => setShowFilters((visible) => !visible)}
            style={[
              styles.searchAction,
              {
                backgroundColor: showFilters || hasActiveFilters
                  ? theme.colors.surfaceMuted
                  : theme.colors.surface,
                borderColor: showFilters || hasActiveFilters
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
          />
        </View>

        {showFilters ? (
          <AppCard padding="sm" style={styles.filters} variant="outlined">
            <AppSelectField
              label={t('roleManagement.filterByModule')}
              leadingIcon="filter-outline"
              onChange={setSelectedModule}
              options={moduleOptions}
              value={selectedModule}
            />
            <AppSegmentedControl
              label={t('roleManagement.selectionFilter')}
              onChange={setSelectionFilter}
              options={[
                { value: 'all', label: t('roleManagement.allPermissions'), icon: 'list-outline' },
                {
                  value: 'selected',
                  label: t('roleManagement.selectedOnly'),
                  icon: 'checkmark-circle-outline',
                },
              ]}
              value={selectionFilter}
            />
          </AppCard>
        ) : null}

        <View
          style={[
            styles.listToolbar,
            {
              direction,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
            },
          ]}>
          <View style={styles.listToolbarText}>
            <AppText variant="label" weight="800">
              {t('roleManagement.modulesVisible', {
                visible: filteredGroups.length,
                total: groups.length,
              })}
            </AppText>
            <AppText color="muted" variant="caption">
              {t('roleManagement.selectedOfTotal', {
                selected: selectedCount,
                total: claims.length,
              })} {t('roleManagement.selected')}
            </AppText>
          </View>
          {canEdit ? (
            <View style={[styles.listToolbarActions, { direction }]}>
              <AppIconButton
                color={theme.colors.success}
                disabled={editingDisabled || filteredGroups.length === 0}
                icon="checkmark-done-outline"
                label={t('roleManagement.selectFiltered')}
                onPress={() => setVisibleSelection(true)}
              />
              <AppIconButton
                color={theme.colors.danger}
                disabled={editingDisabled || filteredGroups.length === 0}
                icon="close-circle-outline"
                label={t('roleManagement.clearFiltered')}
                onPress={() => setVisibleSelection(false)}
              />
              <AppIconButton
                color={showBulkTools ? theme.colors.primary : theme.colors.textMuted}
                disabled={editingDisabled}
                icon={showBulkTools ? 'construct' : 'construct-outline'}
                label={t(
                  showBulkTools
                    ? 'roleManagement.hideBulkTools'
                    : 'roleManagement.showBulkTools',
                )}
                onPress={() => setShowBulkTools((visible) => !visible)}
              />
            </View>
          ) : null}
        </View>

        {canEdit && showBulkTools ? (
          <AppCard padding="sm" style={styles.actionBulkCard} variant="filled">
            <AppText variant="label" weight="800">
              {t('roleManagement.bulkByPermissionAction')}
            </AppText>
            <View style={[styles.actionBulkRow, { direction }]}>
              <View style={styles.actionSelect}>
                <AppSelectField
                  label={t('roleManagement.bulkByPermissionAction')}
                  leadingIcon="key-outline"
                  onChange={setSelectedAction}
                  options={actionOptions}
                  value={selectedAction}
                />
              </View>
              <View style={[styles.actionButtons, { direction }]}>
                <AppIconButton
                  color={theme.colors.success}
                  disabled={editingDisabled || !selectedAction}
                  icon="checkmark-done-outline"
                  label={t('roleManagement.selectAction')}
                  onPress={() => setActionSelection(true)}
                />
                <AppIconButton
                  color={theme.colors.danger}
                  disabled={editingDisabled || !selectedAction}
                  icon="close-circle-outline"
                  label={t('roleManagement.clearAction')}
                  onPress={() => setActionSelection(false)}
                />
              </View>
            </View>
          </AppCard>
        ) : null}

        {filteredGroups.length ? (
          <View style={styles.moduleList}>
            {filteredGroups.map((group) => (
              <PermissionModuleCard
                disabled={editingDisabled}
                expanded={expandedModule === group.module}
                group={group}
                key={group.module}
                onSetModule={setModuleSelection}
                onToggle={toggleClaim}
                onToggleExpanded={() => setExpandedModule((current) =>
                  current === group.module ? null : group.module)}
              />
            ))}
          </View>
        ) : (
          <AppStateView message={t('roleManagement.noPermissionMatches')} state="empty" />
        )}
      </AppForm>

      <DiscardChangesDialog
        loading={busy}
        onCancel={discard.keepEditing}
        onDiscard={discard.discard}
        visible={discard.dialogVisible}
      />
    </AppScreen>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

const styles = StyleSheet.create({
  centered: { flexGrow: 1, justifyContent: 'center' },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  headingText: { flex: 1, minWidth: 0, gap: 2 },
  summary: { gap: 8, marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryText: { flex: 1, minWidth: 0, gap: 1 },
  progressTrack: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
  progressValue: { height: '100%', borderRadius: 3 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  searchField: { flex: 1, minWidth: 0 },
  searchAction: {
    width: 44,
    height: 44,
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 8,
  },
  filters: { gap: 10, marginBottom: 10 },
  listToolbar: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
  },
  listToolbarText: { flex: 1, minWidth: 0, gap: 1 },
  listToolbarActions: { flexDirection: 'row', alignItems: 'center' },
  actionBulkCard: { gap: 8, marginBottom: 10 },
  actionBulkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionSelect: { flex: 1, flexBasis: 190, minWidth: 0 },
  actionButtons: { flexDirection: 'row', alignItems: 'center', paddingTop: 12 },
  moduleList: { gap: 8 },
});

import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/src/core/api';
import { asHref, ROUTES } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { permissions, useAuthorization } from '@/src/platform/auth';
import {
  AppButton,
  AppCard,
  AppForm,
  AppIconButton,
  AppScreen,
  AppSegmentedControl,
  AppSelectField,
  AppStatusBadge,
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
} from '../../../queries/use-administration';
import type { RolePermissionsFormValues } from '../../../models/administration-form';
import { rolePermissionsSchema } from '../../../validation/role-validation';
import { PermissionModuleCard } from '../components/PermissionModuleCard';
import { PermissionBusinessModuleRail } from '../components/PermissionBusinessModuleRail';
import {
  countChangedRoleClaims,
  getPermissionActionLabel,
  getPermissionBusinessModuleLabel,
  getPermissionScreenLabel,
  groupRoleClaims,
  summarizePermissionBusinessModules,
  type PermissionGroup,
} from '../permission-groups';

const editRolePermissions = [permissions.EditRolePermissions] as const;

interface RolePermissionsScreenProps {
  roleId: string;
}

export function RolePermissionsScreen({ roleId }: RolePermissionsScreenProps) {
  const { t, i18n } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const { width: viewportWidth } = useWindowDimensions();
  const { isReadOnly } = useAppReadOnly();
  const { allowed: canEdit } = useAuthorization({
    requiredPermissions: editRolePermissions,
  });
  const roleQuery = useRoleClaims(roleId);
  const updateMutation = useUpdateRoleClaims();
  const initializedRoleId = useRef<string | null>(null);
  const [search, setSearch] = useState('');
  const [moduleSearch, setModuleSearch] = useState('');
  const [requestedBusinessModule, setRequestedBusinessModule] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectionFilter, setSelectionFilter] = useState<'all' | 'selected'>('all');
  const [expandedScreen, setExpandedScreen] = useState<string | null>(null);
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
  // Treat missing/unparsed role data as protected until the API contract is known.
  const isSystemRole = roleQuery.data?.isSystem ?? true;
  const permissionsReadOnly = !canEdit || isReadOnly || isSystemRole;
  const editingDisabled = !canEdit || isReadOnly || isSystemRole || busy;

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
  const businessModules = useMemo(
    () => summarizePermissionBusinessModules(groups),
    [groups],
  );
  const isWideWorkspace = viewportWidth >= 760;

  const selectedBusinessModule = businessModules.find(
    (module) => module.code.toLocaleLowerCase() === requestedBusinessModule.toLocaleLowerCase(),
  )?.code ?? businessModules[0]?.code ?? '';
  const visibleBusinessModules = useMemo(() => {
    const query = moduleSearch.trim().toLocaleLowerCase(i18n.language);
    if (!query) return businessModules;
    return businessModules.filter((module) => [
      module.code,
      getPermissionBusinessModuleLabel(module.code, t),
    ].some((value) => value.toLocaleLowerCase(i18n.language).includes(query)));
  }, [businessModules, i18n.language, moduleSearch, t]);

  const moduleGroups = useMemo(() => groups.filter(
    (group) => group.moduleCode.toLocaleLowerCase() === selectedBusinessModule.toLocaleLowerCase(),
  ), [groups, selectedBusinessModule]);
  const screenOptions = useMemo(() => [
    { value: '', label: t('roleManagement.allScreens'), icon: 'apps-outline' as const },
    ...moduleGroups.map((group) => ({
      value: group.screen,
      label: getPermissionScreenLabel(group.screen, t),
      icon: 'folder-open-outline' as const,
    })),
  ], [moduleGroups, t]);
  const actionOptions = useMemo(() => [
    { value: '', label: t('roleManagement.choosePermissionAction'), icon: 'key-outline' as const },
    ...[...new Set(moduleGroups.flatMap((group) => group.claims.map(({ action }) => action)))]
      .sort((left, right) => left.localeCompare(right))
      .map((action) => ({
        value: action,
        label: getPermissionActionLabel(action, t),
        icon: 'shield-checkmark-outline' as const,
      })),
  ], [moduleGroups, t]);
  const filteredGroups = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(i18n.language);

    return moduleGroups.filter((group) => {
      if (selectedScreen && group.screen !== selectedScreen) return false;
      if (selectionFilter === 'selected' && !group.claims.some(({ claim }) => claim.isSelected)) {
        return false;
      }
      if (!query) return true;

      return [
        group.screen,
        getPermissionScreenLabel(group.screen, t),
        ...group.claims.flatMap(({ action, claim }) => [
          action,
          getPermissionActionLabel(action, t),
          claim.displayValue,
        ]),
      ].some((value) => value.toLocaleLowerCase(i18n.language).includes(query));
    });
  }, [i18n.language, moduleGroups, search, selectedScreen, selectionFilter, t]);
  const selectedCount = claims.filter((claim) => claim.isSelected).length;
  const changedCount = useMemo(() => countChangedRoleClaims(
    claims,
    roleQuery.data?.roleClaims ?? [],
  ), [claims, roleQuery.data?.roleClaims]);
  const percentage = claims.length ? Math.round((selectedCount / claims.length) * 100) : 0;
  const hasActiveFilters = Boolean(selectedScreen) || selectionFilter !== 'all';
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
      new Set(moduleGroups.flatMap((group) => group.claims)
        .filter(({ action }) => action === selectedAction)
        .map(({ index }) => index)),
      selected,
    );
  };

  const selectBusinessModule = (moduleCode: string) => {
    setRequestedBusinessModule(moduleCode);
    setSelectedScreen('');
    setExpandedScreen(null);
    setSearch('');
  };

  const leaveScreen = () => router.replace(asHref(ROUTES.administration.roles));
  const discard = useDiscardChanges({
    active: !isSystemRole,
    busy,
    isDirty,
    onDiscard: leaveScreen,
  });
  const submit = handleSubmit(async (values) => {
    if (isSystemRole || !canEdit || isReadOnly || updateMutation.isPending) return;
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
      footer={canEdit && !isSystemRole ? (
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
          </View>
        </View>

        <AppCard padding="sm" style={styles.summary} variant="filled">
          <View style={[styles.summaryRow, { direction }]}>
            <AppText style={styles.summaryText} variant="bodySmall" weight="800">
              {t('roleManagement.selectedOfTotal', {
                selected: selectedCount,
                total: claims.length,
              })} · {percentage}%
            </AppText>
            <AppStatusBadge
              color={permissionsReadOnly
                ? theme.colors.textMuted
                : changedCount > 0
                  ? theme.colors.warning
                  : theme.colors.success}
              icon={permissionsReadOnly
                ? 'lock-closed-outline'
                : changedCount > 0
                  ? 'create-outline'
                  : 'checkmark-circle-outline'}
              label={permissionsReadOnly
                ? t('roleManagement.permissionsReadOnly')
                : changedCount > 0
                  ? t('roleManagement.pendingChangesCount', { count: changedCount })
                  : t('roleManagement.noPendingChanges')}
              variant="outlined"
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

        <View
          style={[
            styles.workspace,
            isWideWorkspace ? styles.workspaceWide : null,
            { direction },
          ]}>
          <AppCard
            padding="sm"
            style={isWideWorkspace ? styles.moduleRail : styles.moduleSelector}
            variant="outlined">
            <View style={styles.moduleHeading}>
              <AppText variant="label" weight="800">
                {t('roleManagement.businessModuleNavigation')}
              </AppText>
              <AppText color="muted" variant="caption">
                {t('roleManagement.chooseBusinessModule')}
              </AppText>
            </View>
            <AppTextField
              compact
              label={t('roleManagement.searchBusinessModules')}
              leadingIcon="search-outline"
              onChangeText={setModuleSearch}
              showClearButton
              value={moduleSearch}
            />
            {visibleBusinessModules.length ? (
              <PermissionBusinessModuleRail
                horizontal={!isWideWorkspace}
                modules={visibleBusinessModules}
                onSelect={selectBusinessModule}
                selectedModule={selectedBusinessModule}
              />
            ) : (
              <AppText color="muted" variant="bodySmall">
                {t('roleManagement.noBusinessModulesMatch')}
              </AppText>
            )}
          </AppCard>

          <View style={styles.permissionPanel}>
            {showFilters ? (
              <AppCard padding="sm" style={styles.filters} variant="outlined">
                <AppSelectField
                  label={t('roleManagement.filterByScreen')}
                  leadingIcon="filter-outline"
                  onChange={setSelectedScreen}
                  options={screenOptions}
                  value={selectedScreen}
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
                  {t('roleManagement.screensVisible', {
                    visible: filteredGroups.length,
                    total: moduleGroups.length,
                  })}
                </AppText>
                <AppText color="muted" variant="caption">
                  {t('roleManagement.selectedOfTotal', {
                    selected: selectedCount,
                    total: claims.length,
                  })} {t('roleManagement.selected')}
                </AppText>
              </View>
              {canEdit && !isSystemRole ? (
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

            {canEdit && !isSystemRole && showBulkTools ? (
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
              <View style={styles.screenList}>
                {filteredGroups.map((group) => (
                  <PermissionModuleCard
                    disabled={editingDisabled}
                    expanded={expandedScreen === group.screen}
                    group={group}
                    key={`${group.moduleCode}:${group.screen}`}
                    onSetModule={setModuleSelection}
                    onToggle={toggleClaim}
                    onToggleExpanded={() => setExpandedScreen((current) =>
                      current === group.screen ? null : group.screen)}
                  />
                ))}
              </View>
            ) : (
              <AppStateView message={t('roleManagement.noPermissionMatches')} state="empty" />
            )}
          </View>
        </View>
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
    marginBottom: 8,
  },
  headingText: { flex: 1, minWidth: 0 },
  summary: { marginBottom: 8 },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryText: { flex: 1, minWidth: 0 },
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
  workspace: { gap: 10 },
  workspaceWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  moduleRail: { width: 250, gap: 10 },
  moduleSelector: { gap: 10 },
  moduleHeading: { gap: 2 },
  permissionPanel: { flex: 1, minWidth: 0 },
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
  screenList: { gap: 8 },
});

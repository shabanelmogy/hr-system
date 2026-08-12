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
const pageSizeOptions = [5, 10, 20] as const;

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
  const leaveDestination = useRef<
    typeof ROUTES.home | typeof ROUTES.administration.roles
  >(ROUTES.administration.roles);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectionFilter, setSelectionFilter] = useState<'all' | 'selected'>('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
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
  const claims = useWatch({ control, name: 'roleClaims' }) ?? [];
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
  const modulePageSizeOptions = useMemo(() => pageSizeOptions.map((size) => ({
    value: String(size),
    label: t('roleManagement.modulesPerPageValue', { count: size }),
  })), [t]);
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
  const pageCount = Math.max(1, Math.ceil(filteredGroups.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visibleGroups = filteredGroups.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize,
  );
  const selectedCount = claims.filter((claim) => claim.isSelected).length;
  const percentage = claims.length ? Math.round((selectedCount / claims.length) * 100) : 0;
  const fieldErrors = useMemo(() => toFormErrorMap(errors), [errors]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

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

  const leaveScreen = () => router.replace(asHref(leaveDestination.current));
  const discard = useDiscardChanges({
    active: true,
    busy,
    isDirty,
    onDiscard: leaveScreen,
  });
  const requestLeave = (destination: typeof ROUTES.home | typeof ROUTES.administration.roles) => {
    leaveDestination.current = destination;
    discard.requestClose();
  };
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
    <AppScreen edges={['left', 'right', 'bottom']}>
      <AppForm
        errors={fieldErrors}
        footer={
          <View style={[styles.formActions, { direction }]}>
            <AppButton
              disabled={busy}
              icon={isRTL ? 'arrow-forward-outline' : 'arrow-back-outline'}
              onPress={() => requestLeave(ROUTES.administration.roles)}
              style={styles.formAction}
              variant="outline">
              {t('roleManagement.backToRoles')}
            </AppButton>
            {canEdit ? (
              <AppButton
                disabled={isReadOnly || busy}
                icon="save-outline"
                loading={busy}
                onPress={() => void submit()}
                style={styles.formAction}>
                {t('roleManagement.savePermissions')}
              </AppButton>
            ) : null}
          </View>
        }
        isDirty={isDirty}
        presentation="inline"
        submitting={busy}>
        <View style={[styles.heading, { direction }]}>
          <AppIconButton
            icon={isRTL ? 'arrow-forward-outline' : 'arrow-back-outline'}
            label={t('roleManagement.backToRoles')}
            onPress={() => requestLeave(ROUTES.administration.roles)}
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
          <AppIconButton
            icon="home-outline"
            label={t('navigation.dashboard')}
            onPress={() => requestLeave(ROUTES.home)}
          />
        </View>

        <AppCard padding="md" style={styles.summary} variant="filled">
          <View style={[styles.summaryRow, { direction }]}>
            <View style={styles.summaryMetric}>
              <AppText color="primary" variant="titleSmall" weight="800">{selectedCount}</AppText>
              <AppText color="muted" variant="caption">{t('roleManagement.selected')}</AppText>
            </View>
            <View style={styles.summaryMetric}>
              <AppText variant="titleSmall" weight="800">{claims.length}</AppText>
              <AppText color="muted" variant="caption">{t('roleManagement.totalPermissions')}</AppText>
            </View>
            <View style={styles.summaryMetric}>
              <AppText color="success" variant="titleSmall" weight="800">{percentage}%</AppText>
              <AppText color="muted" variant="caption">{t('roleManagement.coverage')}</AppText>
            </View>
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

        <View style={styles.filters}>
          <AppTextField
            label={t('roleManagement.searchPermissions')}
            leadingIcon="search-outline"
            onChangeText={(value) => {
              setSearch(value);
              setPage(0);
            }}
            showClearButton
            value={search}
          />
          <AppSelectField
            label={t('roleManagement.filterByModule')}
            leadingIcon="filter-outline"
            onChange={(value) => {
              setSelectedModule(value);
              setPage(0);
            }}
            options={moduleOptions}
            value={selectedModule}
          />
          <AppSegmentedControl
            label={t('roleManagement.selectionFilter')}
            onChange={(value) => {
              setSelectionFilter(value);
              setPage(0);
            }}
            options={[
              { value: 'all', label: t('roleManagement.allPermissions'), icon: 'list-outline' },
              { value: 'selected', label: t('roleManagement.selectedOnly'), icon: 'checkmark-circle-outline' },
            ]}
            value={selectionFilter}
          />
          <AppSelectField
            label={t('roleManagement.modulesPerPage')}
            leadingIcon="albums-outline"
            onChange={(value) => {
              setPageSize(Number(value));
              setPage(0);
            }}
            options={modulePageSizeOptions}
            value={String(pageSize)}
          />
        </View>

        {canEdit ? (
          <View style={[styles.bulkActions, { direction }]}>
            <AppButton
              disabled={editingDisabled || filteredGroups.length === 0}
              icon="checkmark-done-outline"
              onPress={() => setVisibleSelection(true)}
              style={styles.bulkAction}
              variant="outline">
              {t('roleManagement.selectFiltered')}
            </AppButton>
            <AppButton
              disabled={editingDisabled || filteredGroups.length === 0}
              icon="close-circle-outline"
              onPress={() => setVisibleSelection(false)}
              style={styles.bulkAction}
              variant="outline">
              {t('roleManagement.clearFiltered')}
            </AppButton>
          </View>
        ) : null}

        {canEdit ? (
          <AppCard padding="md" style={styles.actionBulkCard} variant="outlined">
            <AppSelectField
              label={t('roleManagement.bulkByPermissionAction')}
              leadingIcon="key-outline"
              onChange={setSelectedAction}
              options={actionOptions}
              value={selectedAction}
            />
            <View style={[styles.bulkActions, { direction }]}>
              <AppButton
                disabled={editingDisabled || !selectedAction}
                icon="checkmark-done-outline"
                onPress={() => setActionSelection(true)}
                style={styles.bulkAction}
                variant="outline">
                {t('roleManagement.selectAction')}
              </AppButton>
              <AppButton
                disabled={editingDisabled || !selectedAction}
                icon="close-circle-outline"
                onPress={() => setActionSelection(false)}
                style={styles.bulkAction}
                variant="outline">
                {t('roleManagement.clearAction')}
              </AppButton>
            </View>
          </AppCard>
        ) : null}

        {visibleGroups.length ? (
          <View style={styles.moduleList}>
            {visibleGroups.map((group) => (
              <PermissionModuleCard
                disabled={editingDisabled}
                group={group}
                key={group.module}
                onSetModule={setModuleSelection}
                onToggle={toggleClaim}
              />
            ))}
          </View>
        ) : (
          <AppStateView message={t('roleManagement.noPermissionMatches')} state="empty" />
        )}

        {filteredGroups.length > pageSize ? (
          <View style={[styles.pagination, { direction }]}>
            <AppIconButton
              disabled={safePage === 0}
              icon={isRTL ? 'chevron-forward' : 'chevron-back'}
              label={t('common.previous')}
              onPress={() => setPage(Math.max(0, safePage - 1))}
            />
            <AppText variant="caption" weight="700">
              {t('dataTable.pageOf', { page: safePage + 1, count: pageCount })}
            </AppText>
            <AppIconButton
              disabled={safePage >= pageCount - 1}
              icon={isRTL ? 'chevron-back' : 'chevron-forward'}
              label={t('common.next')}
              onPress={() => setPage(Math.min(pageCount - 1, safePage + 1))}
            />
          </View>
        ) : null}
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
  summary: { gap: 12, marginBottom: 14 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 8,
  },
  summaryMetric: { flex: 1, alignItems: 'center', gap: 2 },
  progressTrack: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
  progressValue: { height: '100%', borderRadius: 3 },
  filters: { gap: 12, marginBottom: 12 },
  bulkActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  bulkAction: { flex: 1, minWidth: 150 },
  actionBulkCard: { gap: 10, marginBottom: 12 },
  moduleList: { gap: 12 },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  formActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  formAction: { flex: 1, minWidth: 150, maxWidth: 240 },
});

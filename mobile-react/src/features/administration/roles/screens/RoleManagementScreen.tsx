import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/src/core/api';
import { asHref, ROUTES } from '@/src/core/constants/routes';
import { useAppTheme } from '@/src/core/theme';
import { permissions, useAuthorization } from '@/src/features/auth';
import {
  AppDataTable,
  type AppDataTableColumn,
  AppIconButton,
  AppListScreen,
  AppScreen,
  AppStateView,
  AppStatusBadge,
  AppText,
  ConfirmationDialog,
  showToast,
} from '@/src/shared/components';
import {
  useRoleOptions,
  useSaveRole,
  useToggleRole,
} from '../../hooks/useAdministration';
import type { RoleFormValues, RoleOption } from '../../types/administration';
import { RoleActions } from '../components/RoleActions';
import { RoleCard } from '../components/RoleCard';
import { RoleForm } from '../components/RoleForm';

const createRolePermissions = [permissions.CreateRoles] as const;
const editRolePermissions = [permissions.EditRoles] as const;
const deleteRolePermissions = [permissions.DeleteRoles] as const;

type RoleFormMode = 'add' | 'edit' | 'view';
type RoleView = 'table' | 'cards';

export function RoleManagementScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const { allowed: canCreate } = useAuthorization({
    requiredPermissions: createRolePermissions,
  });
  const { allowed: canEdit } = useAuthorization({
    requiredPermissions: editRolePermissions,
  });
  const { allowed: canDelete } = useAuthorization({
    requiredPermissions: deleteRolePermissions,
  });
  const rolesQuery = useRoleOptions();
  const saveMutation = useSaveRole();
  const toggleMutation = useToggleRole();
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [formMode, setFormMode] = useState<RoleFormMode>('add');
  const [formOpen, setFormOpen] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<RoleOption | null>(null);
  const roles = useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);

  const [selectedRoleFilters, setSelectedRoleFilters] = useState<string[]>([]);

  const roleFilterOptions = useMemo(() => [
    { icon: 'checkmark-circle-outline' as const, label: t('roleManagement.active'), value: 'active' },
    { icon: 'pause-circle-outline' as const, label: t('roleManagement.disabled'), value: 'disabled' },
  ], [t]);

  const filteredRoles = useMemo(() => {
    if (selectedRoleFilters.length === 0) return roles;
    return roles.filter((role) => {
      if (selectedRoleFilters.includes('disabled') && role.isDeleted) return true;
      if (selectedRoleFilters.includes('active') && !role.isDeleted) return true;
      return false;
    });
  }, [roles, selectedRoleFilters]);

  const searchRoles = useCallback(
    (items: readonly RoleOption[], searchTerm: string) => {
      const query = searchTerm.trim().toLocaleLowerCase(i18n.language);
      if (!query) return items;

      return items.filter((role) =>
        [role.id, role.name, t(role.isDeleted ? 'roleManagement.disabled' : 'roleManagement.active')]
          .some((value) => value.toLocaleLowerCase(i18n.language).includes(query)),
      );
    },
    [i18n.language, t],
  );

  const openForm = useCallback((mode: RoleFormMode, role: RoleOption | null) => {
    setSelectedRole(role);
    setFormMode(mode);
    setFormOpen(true);
  }, []);

  const renderRoleActions = useCallback((role: RoleOption) => (
    <RoleActions
      canDelete={canDelete}
      canEdit={canEdit}
      onEdit={(selected) => openForm('edit', selected)}
      onManagePermissions={(selected) => router.push(
        asHref(ROUTES.administration.rolePermissions(selected.id)),
      )}
      onToggle={setPendingToggle}
      onView={(selected) => openForm('view', selected)}
      role={role}
    />
  ), [canDelete, canEdit, openForm]);

  const columns = useMemo<AppDataTableColumn<RoleOption>[]>(() => [
    {
      id: 'name',
      header: t('roleManagement.name'),
      width: 90,
      sortValue: (role) => role.name,
      render: (role) => <AppText variant="bodySmall" weight="700">{role.name}</AppText>,
    },
    {
      id: 'status',
      header: t('roleManagement.status'),
      width: 80,
      align: 'center',
      sortValue: (role) => role.isDeleted,
      render: (role) => (
        <AppStatusBadge
          color={role.isDeleted ? theme.colors.danger : theme.colors.success}
          icon={role.isDeleted ? 'pause-circle-outline' : 'checkmark-circle-outline'}
          label={t(role.isDeleted ? 'roleManagement.disabled' : 'roleManagement.active')}
        />
      ),
    },
    {
      id: 'actions',
      header: t('roleManagement.actions'),
      width: 220,
      align: 'center',
      render: renderRoleActions,
    },
  ], [renderRoleActions, t, theme.colors.danger, theme.colors.success]);

  const closeForm = () => {
    if (saveMutation.isPending) return;
    setFormOpen(false);
    setSelectedRole(null);
  };

  const saveRole = async (values: RoleFormValues) => {
    const name = values.name.trim();
    if (formMode === 'edit' && selectedRole) {
      if (selectedRole.isSystem) return;
      await saveMutation.mutateAsync({
        id: selectedRole.id,
        request: { id: selectedRole.id, name },
      });
      showToast.success(t('roleManagement.updatedSuccessfully'));
    } else {
      await saveMutation.mutateAsync({ id: null, request: { name } });
      showToast.success(t('roleManagement.createdSuccessfully'));
    }

    setFormOpen(false);
    setSelectedRole(null);
  };

  const toggleRole = async () => {
    if (!pendingToggle) return;
    if (pendingToggle.isSystem) {
      setPendingToggle(null);
      return;
    }
    const wasDisabled = pendingToggle.isDeleted;
    await toggleMutation.mutateAsync(pendingToggle.id);
    setPendingToggle(null);
    showToast.success(t(
      wasDisabled
        ? 'roleManagement.enabledSuccessfully'
        : 'roleManagement.disabledSuccessfully',
    ));
  };

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      refreshControl={
        <RefreshControl
          colors={[theme.colors.primary]}
          onRefresh={() => void rolesQuery.refetch()}
          refreshing={rolesQuery.isRefetching}
          tintColor={theme.colors.primary}
        />
      }>
      <View style={styles.heading}>
        <View style={styles.headingText}>
          <AppText numberOfLines={1} variant="titleSmall">{t('roleManagement.title')}</AppText>
          <AppText color="muted" numberOfLines={1} variant="caption">
            {t('roleManagement.subtitle')}
          </AppText>
        </View>
        {canCreate ? (
          <AppIconButton
            color={theme.colors.onPrimary}
            icon="add-outline"
            label={t('roleManagement.addRole')}
            onPress={() => openForm('add', null)}
            pressedBackgroundColor={theme.colors.secondary}
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          />
        ) : null}
      </View>

      {rolesQuery.isLoading ? (
        <AppStateView state="loading" />
      ) : rolesQuery.isError ? (
        <AppStateView
          message={getErrorMessage(rolesQuery.error, t('states.errorMessage'))}
          onRetry={() => void rolesQuery.refetch()}
          state="error"
        />
      ) : (
        <AppListScreen<RoleOption, RoleView>
          defaultView="table"
          emptyContent={(
            <AppStateView message={t('roleManagement.empty')} state="empty" />
          )}
          items={filteredRoles}
          filter={{
            options: roleFilterOptions,
            values: selectedRoleFilters,
            onChange: setSelectedRoleFilters,
            modalTitle: t('roleManagement.filterByStatus'),
          }}
          onSearch={searchRoles}
          searchPlaceholder={t('roleManagement.search')}
          showViewLabels
          views={[
            {
              value: 'table',
              defaultPageSize: 5,
              label: t('multiView.table'),
              icon: 'grid-outline',
              paginate: false,
              pageSizeOptions: [5, 10, 25],
              render: (roles) => (
                <AppDataTable
                  columns={columns}
                  defaultPageSize={5}
                  emptyMessage={t('roleManagement.empty')}
                  getRowKey={(role) => role.id}
                  pageSizeOptions={[5, 10, 25]}
                  rows={roles}
                />
              ),
            },
            {
              value: 'cards',
              carousel: true,
              getItemKey: (role) => role.id,
              label: t('multiView.cards'),
              icon: 'albums-outline',
              scrollable: true,
              render: (pageRoles) => (
                <View style={styles.cards}>
                  {pageRoles.map((role) => (
                    <RoleCard actions={renderRoleActions(role)} key={role.id} role={role} />
                  ))}
                </View>
              ),
            },
          ]}
        />
      )}

      {formOpen ? (
        <RoleForm
          loading={saveMutation.isPending}
          mode={formMode}
          onClose={closeForm}
          onSave={saveRole}
          role={selectedRole}
        />
      ) : null}

      <ConfirmationDialog
        confirmLabel={t(pendingToggle?.isDeleted ? 'roleManagement.enable' : 'roleManagement.disable')}
        description={t(
          pendingToggle?.isDeleted
            ? 'roleManagement.enableDescription'
            : 'roleManagement.disableDescription',
          { name: pendingToggle?.name ?? '' },
        )}
        loading={toggleMutation.isPending}
        onCancel={() => setPendingToggle(null)}
        onConfirm={toggleRole}
        title={t(pendingToggle?.isDeleted ? 'roleManagement.enableRole' : 'roleManagement.disableRole')}
        tone={pendingToggle?.isDeleted ? 'default' : 'warning'}
        visible={pendingToggle !== null}
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
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  headingText: { flex: 1, minWidth: 0, gap: 2 },
  addButton: { flexShrink: 0 },
  cards: {
    flexDirection: 'row',
    alignItems: 'stretch',
    flexWrap: 'wrap',
    gap: 12,
  },
});

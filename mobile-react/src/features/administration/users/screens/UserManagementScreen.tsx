import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/src/core/api';
import {
  useAssignableCompanies,
  useManagedUsers,
  useRevokeManagedUserSessions,
  useRoleOptions,
  useSaveManagedUser,
  useToggleManagedUser,
  useUnlockManagedUser,
} from '../../hooks/useAdministration';
import type {
  CreateManagedUserRequest,
  ManagedUser,
  ManagedUserFormValues,
  UpdateManagedUserRequest,
} from '../../types/administration';
import { ManagedUserForm } from '../components/ManagedUserForm';
import { ManagedUserAvatar } from '../components/ManagedUserAvatar';
import { ManagedUserActions } from '../components/ManagedUserActions';
import { ManagedUserCard } from '../components/ManagedUserCard';
import { UserManagementStats } from '../components/UserManagementStats';
import { useAuth, useAuthorization } from '@/src/features/auth';
import { permissions } from '@/src/features/auth/rbac/permissions';
import {
  AppDataTable,
  type AppDataTableColumn,
  AppIconButton,
  AppMultiView,
  AppPageHeader,
  AppScreen,
  AppStateView,
  AppStatusBadge,
  AppText,
  AppTextField,
  ConfirmationDialog,
  showToast,
} from '@/src/shared/components';
import { useAppTheme } from '@/src/core/theme';

const createPermissions = [permissions.CreateUsers, permissions.ViewRoles] as const;
const editPermissions = [permissions.EditUsers, permissions.ViewRoles] as const;

type UserFormMode = 'add' | 'edit' | 'view';
type UserView = 'table' | 'cards';
type PendingAccountAction = {
  type: 'toggle' | 'revoke';
  user: ManagedUser;
};

export function UserManagementScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const { session } = useAuth();
  const { allowed: canCreate } = useAuthorization({
    requiredPermissions: createPermissions,
    permissionMode: 'all',
  });
  const { allowed: canEdit } = useAuthorization({
    requiredPermissions: editPermissions,
    permissionMode: 'all',
  });
  const usersQuery = useManagedUsers();
  const companiesQuery = useAssignableCompanies();
  const rolesQuery = useRoleOptions(canCreate || canEdit);
  const saveMutation = useSaveManagedUser();
  const toggleMutation = useToggleManagedUser();
  const unlockMutation = useUnlockManagedUser();
  const revokeMutation = useRevokeManagedUserSessions();
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [formMode, setFormMode] = useState<UserFormMode>('add');
  const [formOpen, setFormOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAccountAction | null>(null);
  const [search, setSearch] = useState('');

  const unlockUser = useCallback(async (user: ManagedUser) => {
    try {
      await unlockMutation.mutateAsync(user.id);
      showToast.success(t('userManagement.unlockedSuccessfully'));
    } catch (error) {
      showToast.error(error, t('userManagement.unlockFailed'));
    }
  }, [t, unlockMutation]);

  const openUserForm = useCallback((mode: UserFormMode, user: ManagedUser | null) => {
    setEditing(user);
    setFormMode(mode);
    setFormOpen(true);
  }, []);

  const renderUserActions = useCallback((user: ManagedUser) => {
    const canManageUser = canEdit && user.id !== session?.userId;

    return (
      <ManagedUserActions
        canManage={canManageUser}
        onEdit={(selected) => openUserForm('edit', selected)}
        onRevokeSessions={(selected) => setPendingAction({ type: 'revoke', user: selected })}
        onToggle={(selected) => setPendingAction({ type: 'toggle', user: selected })}
        onUnlock={(selected) => void unlockUser(selected)}
        onView={(selected) => openUserForm('view', selected)}
        user={user}
      />
    );
  }, [canEdit, openUserForm, session?.userId, unlockUser]);

  const companyNames = useMemo(
    () => new Map((companiesQuery.data ?? []).map((company) => [
      company.id,
      i18n.language.startsWith('ar') ? company.nameAr : company.nameEn,
    ])),
    [companiesQuery.data, i18n.language],
  );

  const users = usersQuery.data ?? [];
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(i18n.language);
    if (!query) return users;

    return users.filter((user) => {
      const companyText = user.companyIds
        .map((companyId) => companyNames.get(companyId) ?? '')
        .join(' ');
      return [
        user.firstName,
        user.lastName,
        user.userName,
        user.email,
        user.roles.join(' '),
        companyText,
      ].some((value) => value.toLocaleLowerCase(i18n.language).includes(query));
    });
  }, [companyNames, i18n.language, search, users]);

  const columns = useMemo<AppDataTableColumn<ManagedUser>[]>(() => [
    {
      id: 'firstName',
      header: t('userManagement.firstName'),
      width: 170,
      render: (user) => (
        <View style={styles.nameCell}>
          <ManagedUserAvatar
            firstName={user.firstName}
            lastName={user.lastName}
            profilePicture={user.profilePicture}
          />
          <AppText numberOfLines={1} variant="bodySmall" weight="700">
            {user.firstName}
          </AppText>
        </View>
      ),
    },
    {
      id: 'lastName',
      header: t('userManagement.lastName'),
      width: 145,
      render: (user) => <AppText variant="bodySmall">{user.lastName}</AppText>,
    },
    {
      id: 'userName',
      header: t('userManagement.userName'),
      width: 145,
      render: (user) => <AppText variant="bodySmall">{user.userName}</AppText>,
    },
    {
      id: 'email',
      header: t('userManagement.email'),
      width: 215,
      render: (user) => <AppText variant="bodySmall">{user.email}</AppText>,
    },
    {
      id: 'roles',
      header: t('userManagement.roles'),
      width: 170,
      render: (user) => (
        <AppText numberOfLines={2} variant="bodySmall">
          {user.roles.join(', ') || t('userManagement.none')}
        </AppText>
      ),
    },
    {
      id: 'companies',
      header: t('userManagement.companies'),
      width: 190,
      render: (user) => {
        const defaultName = user.defaultCompanyId
          ? companyNames.get(user.defaultCompanyId)
          : null;
        return (
          <View style={styles.primaryCell}>
            <AppText numberOfLines={1} variant="bodySmall">
              {defaultName ?? t('userManagement.noDefaultCompany')}
            </AppText>
            <AppText color="muted" variant="caption">
              {t('userManagement.companyCount', { count: user.companyIds.length })}
            </AppText>
          </View>
        );
      },
    },
    {
      id: 'disabledStatus',
      header: t('userManagement.disabledStatus'),
      width: 125,
      align: 'center',
      render: (user) => (
        <AppStatusBadge
          color={user.isDisabled ? theme.colors.danger : theme.colors.success}
          icon={user.isDisabled ? 'pause-circle-outline' : 'checkmark-circle-outline'}
          label={t(user.isDisabled ? 'userManagement.disabled' : 'userManagement.active')}
        />
      ),
    },
    {
      id: 'lockedStatus',
      header: t('userManagement.lockedStatus'),
      width: 125,
      align: 'center',
      render: (user) => (
        <AppStatusBadge
          color={user.isLocked ? theme.colors.danger : theme.colors.success}
          icon={user.isLocked ? 'lock-closed-outline' : 'lock-open-outline'}
          label={t(user.isLocked ? 'userManagement.locked' : 'userManagement.unlocked')}
        />
      ),
    },
    {
      id: 'actions',
      header: t('userManagement.actions'),
      width: 230,
      align: 'center',
      render: renderUserActions,
    },
  ], [companyNames, renderUserActions, t, theme.colors.danger, theme.colors.success]);

  const openCreate = () => {
    openUserForm('add', null);
  };

  const closeForm = () => {
    if (saveMutation.isPending) return;
    setFormOpen(false);
    setEditing(null);
  };

  const save = async (values: ManagedUserFormValues) => {
    const common: UpdateManagedUserRequest = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      userName: values.userName.trim(),
      email: values.email.trim(),
      roles: values.roles,
      companyIds: values.companyIds,
      defaultCompanyId: values.defaultCompanyId,
    };
    if (editing) {
      const password = values.password.trim();
      await saveMutation.mutateAsync({
        id: editing.id,
        request: common,
        password: password
          ? { newPassword: password, confirmPassword: values.confirmPassword }
          : undefined,
      });
    } else {
      const request: CreateManagedUserRequest = { ...common, password: values.password };
      await saveMutation.mutateAsync({ id: null, request });
    }
    setFormOpen(false);
    setEditing(null);
    showToast.success(t('userManagement.savedSuccessfully'));
  };

  const confirmAccountAction = async () => {
    if (!pendingAction) return;

    if (pendingAction.type === 'revoke') {
      await revokeMutation.mutateAsync(pendingAction.user.id);
      showToast.success(t('userManagement.sessionsRevokedSuccessfully'));
    } else {
      await toggleMutation.mutateAsync(pendingAction.user.id);
      showToast.success(t(
        pendingAction.user.isDisabled
          ? 'userManagement.enabledSuccessfully'
          : 'userManagement.disabledSuccessfully',
      ));
    }
    setPendingAction(null);
  };

  const loading = usersQuery.isLoading || companiesQuery.isLoading ||
    ((canCreate || canEdit) && rolesQuery.isLoading);
  const queryError = usersQuery.error ?? companiesQuery.error ??
    ((canCreate || canEdit) ? rolesQuery.error : null);

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      refreshControl={
        <RefreshControl
          colors={[theme.colors.primary]}
          onRefresh={() => void Promise.all([
            usersQuery.refetch(),
            companiesQuery.refetch(),
            ...((canCreate || canEdit) ? [rolesQuery.refetch()] : []),
          ])}
          refreshing={usersQuery.isRefetching || companiesQuery.isRefetching || rolesQuery.isRefetching}
          tintColor={theme.colors.primary}
        />
      }>
      <AppPageHeader
        action={canCreate ? (
          <AppIconButton
            color={theme.colors.onPrimary}
            icon="person-add-outline"
            label={t('userManagement.addUser')}
            onPress={openCreate}
            pressedBackgroundColor={theme.colors.secondary}
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          />
        ) : null}
        subtitle={t('userManagement.subtitle')}
        title={t('userManagement.title')}
      />

      {!loading && !queryError ? <UserManagementStats users={users} /> : null}

      {!loading && !queryError ? (
        <View style={styles.search}>
          <AppTextField
            label={t('userManagement.search')}
            leadingIcon="search-outline"
            onChangeText={setSearch}
            showClearButton
            value={search}
          />
        </View>
      ) : null}

      {loading ? (
        <AppStateView state="loading" />
      ) : queryError ? (
        <AppStateView
          message={getErrorMessage(queryError, t('states.errorMessage'))}
          onRetry={() => void usersQuery.refetch()}
          state="error"
        />
      ) : (
        <AppMultiView<ManagedUser, UserView>
          defaultView="table"
          emptyContent={(
            <AppStateView message={t('userManagement.empty')} state="empty" />
          )}
          items={filteredUsers}
          resetKey={search}
          views={[
            {
              value: 'table',
              defaultPageSize: 5,
              label: t('multiView.table'),
              icon: 'grid-outline',
              pageSizeOptions: [5, 10, 25],
              render: (pageUsers) => (
                <AppDataTable
                  columns={columns}
                  emptyMessage={t('userManagement.empty')}
                  getRowKey={(user) => user.id}
                  rows={pageUsers}
                  showPagination={false}
                />
              ),
            },
            {
              value: 'cards',
              carousel: true,
              getItemKey: (user) => user.id,
              label: t('multiView.cards'),
              icon: 'albums-outline',
              render: (pageUsers) => (
                <View style={styles.cards}>
                  {pageUsers.map((user) => (
                    <ManagedUserCard
                      actions={renderUserActions(user)}
                      defaultCompanyName={user.defaultCompanyId
                        ? companyNames.get(user.defaultCompanyId) ?? t('userManagement.noDefaultCompany')
                        : t('userManagement.noDefaultCompany')}
                      key={user.id}
                      user={user}
                    />
                  ))}
                </View>
              ),
            },
          ]}
        />
      )}

      {formOpen ? (
        <ManagedUserForm
          companies={companiesQuery.data ?? []}
          currentCompanyId={session?.companyId ?? 0}
          loading={saveMutation.isPending}
          mode={formMode}
          onClose={closeForm}
          onSave={save}
          roles={rolesQuery.data ?? []}
          user={editing}
        />
      ) : null}

      <ConfirmationDialog
        confirmLabel={t(
          pendingAction?.type === 'revoke'
            ? 'userManagement.revokeSessions'
            : pendingAction?.user.isDisabled
              ? 'userManagement.enable'
              : 'userManagement.disable',
        )}
        description={t(
          pendingAction?.type === 'revoke'
            ? 'userManagement.revokeDescription'
            : pendingAction?.user.isDisabled
              ? 'userManagement.enableDescription'
              : 'userManagement.disableDescription',
          {
            name: pendingAction
              ? `${pendingAction.user.firstName} ${pendingAction.user.lastName}`
              : '',
          },
        )}
        loading={toggleMutation.isPending || revokeMutation.isPending}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAccountAction}
        title={t(
          pendingAction?.type === 'revoke'
            ? 'userManagement.revokeSessionsTitle'
            : pendingAction?.user.isDisabled
              ? 'userManagement.enableUser'
              : 'userManagement.disableUser',
        )}
        tone={pendingAction?.type === 'revoke' ? 'danger' : pendingAction?.user.isDisabled ? 'default' : 'warning'}
        visible={pendingAction !== null}
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
  addButton: { flexShrink: 0 },
  search: { marginTop: 14, marginBottom: 12 },
  primaryCell: { width: '100%', gap: 2 },
  nameCell: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 8 },
  cards: {
    flexDirection: 'row',
    alignItems: 'stretch',
    flexWrap: 'wrap',
    gap: 12,
  },
});

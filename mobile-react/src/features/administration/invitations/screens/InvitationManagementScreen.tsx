import { useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/src/core/api';
import { useAppTheme } from '@/src/core/theme';
import {
  useAssignableCompanies,
  useResendUserInvitation,
  useRevokeUserInvitation,
  useRoleOptions,
  useSaveManagedUser,
  useUserInvitations,
} from '../../hooks/useAdministration';
import type {
  CreateUserInvitationRequest,
  ManagedUserFormValues,
  UserInvitation,
} from '../../types/administration';
import { ManagedUserForm } from '../../users/components/ManagedUserForm';
import { UserInvitationsPanel } from '../../users/components/UserInvitationsPanel';
import { permissions, useAuth, useAuthorization } from '@/src/features/auth';
import {
  AppIconButton,
  AppPageHeader,
  AppScreen,
  AppStateView,
  ConfirmationDialog,
  showToast,
} from '@/src/shared/components';

const createInvitationPermissions = [
  permissions.CreateUsers,
  permissions.ViewRoles,
] as const;
const resendInvitationPermissions = [permissions.EditUsers] as const;
const revokeInvitationPermissions = [permissions.DeleteUsers] as const;

export function InvitationManagementScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { session } = useAuth();
  const { allowed: canCreate } = useAuthorization({
    requiredPermissions: createInvitationPermissions,
    permissionMode: 'all',
  });
  const { allowed: canResend } = useAuthorization({
    requiredPermissions: resendInvitationPermissions,
  });
  const { allowed: canRevoke } = useAuthorization({
    requiredPermissions: revokeInvitationPermissions,
  });
  const invitationsQuery = useUserInvitations();
  const companiesQuery = useAssignableCompanies();
  const rolesQuery = useRoleOptions(canCreate);
  const saveMutation = useSaveManagedUser();
  const resendMutation = useResendUserInvitation();
  const revokeMutation = useRevokeUserInvitation();
  const [formOpen, setFormOpen] = useState(false);
  const [pendingRevoke, setPendingRevoke] = useState<UserInvitation | null>(null);

  const closeForm = () => {
    if (!saveMutation.isPending) setFormOpen(false);
  };

  const sendInvitation = async (values: ManagedUserFormValues) => {
    const request: CreateUserInvitationRequest = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      userName: values.userName.trim(),
      email: values.email.trim(),
      roles: values.roles,
      companyIds: values.companyIds,
      defaultCompanyId: values.defaultCompanyId,
    };

    await saveMutation.mutateAsync({ id: null, request });
    setFormOpen(false);
    showToast.success(t('userManagement.invitationSentSuccessfully'));
  };

  const resendInvitation = async (invitation: UserInvitation) => {
    try {
      await resendMutation.mutateAsync(invitation.id);
      showToast.success(t('userManagement.invitationResentSuccessfully'));
    } catch (error) {
      showToast.error(error, t('userManagement.invitationActionFailed'));
    }
  };

  const revokeInvitation = async () => {
    if (!pendingRevoke) return;

    try {
      await revokeMutation.mutateAsync(pendingRevoke.id);
      showToast.success(t('userManagement.invitationRevokedSuccessfully'));
      setPendingRevoke(null);
    } catch (error) {
      showToast.error(error, t('userManagement.invitationActionFailed'));
    }
  };

  const loading = invitationsQuery.isLoading || companiesQuery.isLoading ||
    (canCreate && rolesQuery.isLoading);
  const queryError = invitationsQuery.error ?? companiesQuery.error ??
    (canCreate ? rolesQuery.error : null);

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      refreshControl={(
        <RefreshControl
          colors={[theme.colors.primary]}
          onRefresh={() => void Promise.all([
            invitationsQuery.refetch(),
            companiesQuery.refetch(),
            ...(canCreate ? [rolesQuery.refetch()] : []),
          ])}
          refreshing={invitationsQuery.isRefetching || companiesQuery.isRefetching ||
            rolesQuery.isRefetching}
          tintColor={theme.colors.primary}
        />
      )}>
      <AppPageHeader
        action={canCreate ? (
          <AppIconButton
            color={theme.colors.onPrimary}
            icon="mail-outline"
            label={t('invitationManagement.sendInvitation')}
            onPress={() => setFormOpen(true)}
            pressedBackgroundColor={theme.colors.secondary}
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          />
        ) : null}
        subtitle={t('invitationManagement.subtitle')}
        title={t('invitationManagement.title')}
      />

      {loading ? (
        <AppStateView state="loading" />
      ) : queryError ? (
        <AppStateView
          message={getErrorMessage(queryError, t('states.errorMessage'))}
          onRetry={() => void invitationsQuery.refetch()}
          state="error"
        />
      ) : (
        <UserInvitationsPanel
          canResend={canResend}
          canRevoke={canRevoke}
          invitations={invitationsQuery.data ?? []}
          loading={resendMutation.isPending || revokeMutation.isPending}
          onResend={(invitation) => void resendInvitation(invitation)}
          onRevoke={setPendingRevoke}
        />
      )}

      {formOpen ? (
        <ManagedUserForm
          companies={companiesQuery.data ?? []}
          currentCompanyId={session?.companyId ?? 0}
          loading={saveMutation.isPending}
          mode="invite"
          onClose={closeForm}
          onSave={sendInvitation}
          roles={rolesQuery.data ?? []}
          user={null}
        />
      ) : null}

      <ConfirmationDialog
        confirmLabel={t('userManagement.revokeInvitation')}
        description={t('userManagement.revokeInvitationDescription', {
          name: pendingRevoke?.email ?? '',
        })}
        loading={revokeMutation.isPending}
        onCancel={() => setPendingRevoke(null)}
        onConfirm={revokeInvitation}
        title={t('userManagement.revokeInvitationTitle')}
        tone="danger"
        visible={pendingRevoke !== null}
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
});

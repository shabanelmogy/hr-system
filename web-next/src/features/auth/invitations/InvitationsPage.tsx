"use client";

import { UserForm, UserInvitationsPanel } from "@/features/auth/users";
import { permissions } from "@/lib/auth/permissions";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useTranslation } from "react-i18next";
import useInvitationManagement from "./hooks/useInvitationManagement";

const InvitationsPage = () => {
  const { t } = useTranslation();
  const { hasAllPermissions, isReadOnly } = usePermissions();
  const canCreate = !isReadOnly && hasAllPermissions([
    permissions.CreateUsers,
    permissions.ViewRoles,
  ]);
  const canResend = !isReadOnly && hasAllPermissions([permissions.EditUsers]);
  const canRevoke = !isReadOnly && hasAllPermissions([permissions.DeleteUsers]);
  const {
    invitations,
    loading,
    isFormOpen,
    openForm,
    closeForm,
    submitInvitation,
    onResend,
    onRevoke,
    SnackbarComponent,
  } = useInvitationManagement();

  return (
    <>
      <ContentWrapper>
        <PageHeader title={t("invitations.title")} subTitle={t("invitations.subTitle")} />
        <UserInvitationsPanel
          invitations={invitations}
          loading={loading}
          canCreate={canCreate}
          canResend={canResend}
          canRevoke={canRevoke}
          onCreate={openForm}
          onResend={onResend}
          onRevoke={onRevoke}
          t={t}
        />
        <UserForm
          open={isFormOpen}
          dialogType="add"
          selectedUser={null}
          onClose={closeForm}
          onSubmit={submitInvitation}
          loading={loading}
          t={t}
        />
      </ContentWrapper>
      {SnackbarComponent}
    </>
  );
};

export default InvitationsPage;

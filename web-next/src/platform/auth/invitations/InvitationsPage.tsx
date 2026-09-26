"use client";

import { UserInvitationsPanel } from "@/platform/auth/users";
import { permissions } from "@/lib/auth/permissions";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { usePermissions } from "@/shared/hooks/usePermissions";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import useInvitationManagement from "./hooks/useInvitationManagement";

const InvitationForm = dynamic(() => import("./components/InvitationForm"), { ssr: false });

const InvitationsPage = () => {
  const { t } = useTranslation();
  const { hasAllPermissions, isReadOnly } = usePermissions();
  const canCreate = !isReadOnly && hasAllPermissions([
    permissions.CreateUserInvitations,
    permissions.ViewRoles,
  ]);
  const canResend = !isReadOnly && hasAllPermissions([permissions.ResendUserInvitations]);
  const canRevoke = !isReadOnly && hasAllPermissions([permissions.RevokeUserInvitations]);
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
        {isFormOpen ? <InvitationForm
          open={isFormOpen}
          onClose={closeForm}
          onSubmit={submitInvitation}
          loading={loading}
          t={t}
        /> : null}
      </ContentWrapper>
      {SnackbarComponent}
    </>
  );
};

export default InvitationsPage;

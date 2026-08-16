import type { CreateUserInvitationRequest } from "@/features/auth/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiHandler from "@/shared/hooks/useApiHandler";
import useNotifications from "@/shared/hooks/useNotifications";
import useUserStore from "@/features/auth/users/store/useUserStore";
import type { UserFormData } from "@/features/auth/users/utils/validation";

const useInvitationManagement = () => {
  const { t } = useTranslation();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const { loading, handleApiCall } = useApiHandler({ showSuccess, showError });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const fetchStartedRef = useRef(false);
  const invitations = useUserStore((state) => state.invitations);
  const fetchInvitations = useUserStore((state) => state.fetchInvitations);
  const inviteUser = useUserStore((state) => state.inviteUser);
  const resendInvitation = useUserStore((state) => state.resendInvitation);
  const revokeInvitation = useUserStore((state) => state.revokeInvitation);

  useEffect(() => {
    if (fetchStartedRef.current) return;
    fetchStartedRef.current = true;
    void handleApiCall(() => fetchInvitations(), null);
  }, [fetchInvitations, handleApiCall]);

  const closeForm = useCallback(() => setIsFormOpen(false), []);

  const submitInvitation = useCallback(async (formData: UserFormData) => {
    const invitation = await handleApiCall(
      () => inviteUser(toCreateUserInvitationRequest(formData)),
      t("users.invitationSent"),
      null,
      true,
    );
    if (invitation) closeForm();
  }, [closeForm, handleApiCall, inviteUser, t]);

  const onResend = useCallback(async (id: string) => {
    await handleApiCall(() => resendInvitation(id), t("users.invitationResent"));
  }, [handleApiCall, resendInvitation, t]);

  const onRevoke = useCallback(async (id: string) => {
    await handleApiCall(() => revokeInvitation(id), t("users.invitationRevoked"));
  }, [handleApiCall, revokeInvitation, t]);

  return {
    invitations,
    loading,
    isFormOpen,
    openForm: () => setIsFormOpen(true),
    closeForm,
    submitInvitation,
    onResend,
    onRevoke,
    SnackbarComponent,
  };
};

function toCreateUserInvitationRequest(formData: UserFormData): CreateUserInvitationRequest {
  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    userName: formData.userName,
    email: formData.email,
    roles: formData.roles,
    companyIds: formData.companyIds,
    defaultCompanyId: formData.defaultCompanyId,
  };
}

export default useInvitationManagement;

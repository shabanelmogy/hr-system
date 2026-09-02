"use client";

import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { useTranslation } from "react-i18next";
import UserForm from "./components/UserForm";
import UsersDashboardHeader from "./components/UsersDashboardHeader";
import UsersDataGrid from "./components/UsersDataGrid";
import useUserGridLogic from "./hooks/useUserGridLogic";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { permissions } from "@/lib/auth/permissions";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { Avatar, Box, Chip, Typography, Alert } from "@mui/material";
import { ExitToApp } from "@mui/icons-material";

// ─── Content ─────────────────────────────────────────────────────────────────
// Rendered only after the guard confirms access — hooks and API calls are safe here.
const UsersPage = () => {
  const { t } = useTranslation();
  const { hasAllPermissions, isReadOnly } = usePermissions();
  const canCreate = !isReadOnly && hasAllPermissions([
    permissions.CreateUsers,
    permissions.ViewRoles,
  ]);
  const canEdit = !isReadOnly && hasAllPermissions([
    permissions.EditUsers,
    permissions.ViewRoles,
  ]);

  const {
    dialogType,
    selectedUser,
    loading,
    users,
    apiRef,
    onAdd,
    onEdit,
    onView,
    onToggle,
    onUnlock,
    onRevoke,
    revokeTarget,
    isRevoking,
    onConfirmRevoke,
    onCancelRevoke,
    lastAddedId,
    lastEditedId,
    closeDialog,
    handleFormSubmit,
    SnackbarComponent,
  } = useUserGridLogic();
  const userFormDialogType =
    dialogType === "edit" || dialogType === "view" ? dialogType : "add";

  return (
    <>
      <ContentWrapper>
        <PageHeader title={t("users.title")} subTitle={t("users.subTitle")} />

        <UsersDashboardHeader users={users} loading={loading} t={t} />

        <UsersDataGrid
          users={users}
          loading={loading}
          apiRef={apiRef}
          onAdd={onAdd}
          onEdit={onEdit}
          onView={onView}
          onToggle={onToggle}
          onUnlock={onUnlock}
          onRevoke={onRevoke}
          lastAddedId={lastAddedId}
          lastEditedId={lastEditedId}
          canCreate={canCreate}
          canEdit={canEdit}
          t={t}
        />

        <UserForm
          open={dialogType === "edit" || dialogType === "add" || dialogType === "view"}
          dialogType={userFormDialogType}
          selectedUser={selectedUser}
          onClose={closeDialog}
          onSubmit={handleFormSubmit}
          loading={loading}
          t={t}
        />

        {revokeTarget && (
          <ConfirmationDialog
            open={Boolean(revokeTarget)}
            title={t("users.revokeSessionsTitle")}
            description={t("users.revokeDescription", {
              name: `${revokeTarget.firstName} ${revokeTarget.lastName}`,
            })}
            confirmLabel={t("users.revokeSessions")}
            cancelLabel={t("actions.cancel")}
            confirmColor="error"
            confirmIcon={<ExitToApp />}
            icon={<ExitToApp color="error" />}
            busy={isRevoking}
            onClose={onCancelRevoke}
            onConfirm={onConfirmRevoke}
          >
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Avatar
                  src={revokeTarget.profilePicture || undefined}
                  sx={{ width: 40, height: 40 }}
                >
                  {revokeTarget.firstName?.[0]}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                    {revokeTarget.firstName} {revokeTarget.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {revokeTarget.email}
                  </Typography>
                  {revokeTarget.roles?.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                      {revokeTarget.roles.map((role) => (
                        <Chip key={role} label={role} size="small" color="primary" variant="outlined" />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>

              <Alert severity="warning" sx={{ "& .MuiAlert-message": { width: "100%" } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {t("users.revokeNoticeTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("users.revokeNoticeDetails")}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  {t("users.revokeNoticeSafe")}
                </Typography>
              </Alert>
            </Box>
          </ConfirmationDialog>
        )}

      </ContentWrapper>
      {SnackbarComponent}
    </>
  );
};

export default UsersPage;

"use client";

import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { useTranslation } from "react-i18next";
import UserForm from "./components/UserForm";
import UsersDataGrid from "./components/UsersDataGrid";
import useUserGridLogic from "./hooks/useUserGridLogic";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { permissions } from "@/lib/auth/permissions";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { Avatar, Box, Chip, Typography, Alert, TextField } from "@mui/material";
import { ArchiveOutlined, ExitToApp, Restore } from "@mui/icons-material";
import { useState } from "react";
import type { User } from "../types";

// ─── Content ─────────────────────────────────────────────────────────────────
// Rendered only after the guard confirms access — hooks and API calls are safe here.
const UsersPage = () => {
  const { t } = useTranslation();
  const { hasAllPermissions, hasPermission, isReadOnly } = usePermissions();
  const canCreate = !isReadOnly && hasAllPermissions([
    permissions.CreateUsers,
    permissions.ViewRoles,
  ]);
  const canEdit = !isReadOnly && hasAllPermissions([
    permissions.EditUsers,
    permissions.ViewRoles,
  ]);
  const canDelete = !isReadOnly && hasPermission(permissions.DeleteUsers);
  const [lifecycleTarget, setLifecycleTarget] = useState<User | null>(null);
  const [lifecycleAction, setLifecycleAction] = useState<"archive" | "restore" | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [archiveReasonTouched, setArchiveReasonTouched] = useState(false);

  const {
    dialogType,
    selectedUser,
    loading,
    isFetching,
    error,
    users,
    totalCount,
    page,
    pageSize,
    searchValue,
    sortColumn,
    sortDirection,
    includeArchived,
    apiRef,
    onAdd,
    onEdit,
    onView,
    onToggle,
    onUnlock,
    onRevoke,
    archiveUser,
    restoreUser,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onSortChange,
    onIncludeArchivedChange,
    onResetList,
    onRefresh,
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
  const closeLifecycleDialog = () => {
    if (loading) return;
    setLifecycleTarget(null);
    setLifecycleAction(null);
    setArchiveReason("");
    setArchiveReasonTouched(false);
  };
  const openArchive = (user: User) => {
    setLifecycleTarget(user);
    setLifecycleAction("archive");
    setArchiveReason("");
    setArchiveReasonTouched(false);
  };
  const openRestore = (user: User) => {
    setLifecycleTarget(user);
    setLifecycleAction("restore");
    setArchiveReason("");
    setArchiveReasonTouched(false);
  };
  const confirmLifecycle = async () => {
    if (!lifecycleTarget || !lifecycleAction) return;
    if (lifecycleAction === "archive") {
      setArchiveReasonTouched(true);
      if (!archiveReason.trim()) return;
      if (await archiveUser(lifecycleTarget, archiveReason)) closeLifecycleDialog();
      return;
    }
    if (await restoreUser(lifecycleTarget)) closeLifecycleDialog();
  };

  return (
    <>
      <ContentWrapper>
        <PageHeader title={t("users.title")} subTitle={t("users.subTitle")} />

        {error ? (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<button type="button" onClick={() => void onRefresh()}>{t("common.retry")}</button>}
          >
            {t("users.fetchError")}
          </Alert>
        ) : null}

        <UsersDataGrid
          users={users}
          loading={loading || isFetching}
          apiRef={apiRef}
          onAdd={onAdd}
          onEdit={onEdit}
          onView={onView}
          onToggle={onToggle}
          onUnlock={onUnlock}
          onRevoke={onRevoke}
          onArchive={openArchive}
          onRestore={openRestore}
          lastAddedId={lastAddedId}
          lastEditedId={lastEditedId}
          canCreate={canCreate}
          canEdit={canEdit}
          canDelete={canDelete}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          searchValue={searchValue}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          includeArchived={includeArchived}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onSearchChange={onSearchChange}
          onSortChange={onSortChange}
          onIncludeArchivedChange={onIncludeArchivedChange}
          onResetList={onResetList}
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

        {lifecycleTarget && lifecycleAction ? (
          <ConfirmationDialog
            open
            title={lifecycleAction === "archive" ? t("users.archiveTitle") : t("users.restoreTitle")}
            description={lifecycleAction === "archive" ? t("users.archiveDescription") : t("users.restoreDescription")}
            confirmLabel={lifecycleAction === "archive" ? t("actions.archive") : t("actions.restore")}
            cancelLabel={t("actions.cancel")}
            confirmColor={lifecycleAction === "archive" ? "warning" : "success"}
            confirmIcon={lifecycleAction === "archive" ? <ArchiveOutlined /> : <Restore />}
            icon={lifecycleAction === "archive" ? <ArchiveOutlined color="warning" /> : <Restore color="success" />}
            busy={loading}
            onClose={closeLifecycleDialog}
            onConfirm={() => void confirmLifecycle()}
          >
            <Typography sx={{ mt: 2, fontWeight: 700 }}>
              {lifecycleTarget.firstName} {lifecycleTarget.lastName}
            </Typography>
            {lifecycleAction === "archive" ? (
              <TextField
                autoFocus
                fullWidth
                required
                multiline
                minRows={3}
                sx={{ mt: 2 }}
                label={t("users.archiveReason")}
                value={archiveReason}
                onChange={(event) => setArchiveReason(event.target.value)}
                onBlur={() => setArchiveReasonTouched(true)}
                error={archiveReasonTouched && !archiveReason.trim()}
                helperText={archiveReasonTouched && !archiveReason.trim() ? t("validation.required") : " "}
                slotProps={{ htmlInput: { maxLength: 1000 } }}
              />
            ) : null}
          </ConfirmationDialog>
        ) : null}

      </ContentWrapper>
      {SnackbarComponent}
    </>
  );
};

export default UsersPage;

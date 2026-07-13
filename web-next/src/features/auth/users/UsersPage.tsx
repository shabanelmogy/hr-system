"use client";

import { ContentWrapper } from "@/shared/components/layout";
import { MyHeader } from "@/shared/components/common";
import { ForbiddenPage } from "@/shared/components/auth";
import { usePageGuard } from "@/shared/hooks";
import { permissions } from "@/lib/auth/permissions";
import { useTranslation } from "react-i18next";
import UserDeleteDialog from "./components/UserDeleteDialog";
import UserForm from "./components/UserForm";
import UsersDashboardHeader from "./components/UsersDashboardHeader";
import UsersDataGrid from "./components/UsersDataGrid";
import useUserGridLogic from "./hooks/useUserGridLogic";

// ─── Content ─────────────────────────────────────────────────────────────────
// Rendered only after the guard confirms access — hooks and API calls are safe here.
const UsersPageContent = () => {
  const { t } = useTranslation();

  const {
    dialogType,
    selectedUser,
    loading,
    users,
    apiRef,
    onEdit,
    onView,
    onToggle,
    onUnlock,
    onAdd,
    onRevoke,
    closeDialog,
    handleFormSubmit,
    handleDelete,
    SnackbarComponent,
  } = useUserGridLogic();

  return (
    <>
      <ContentWrapper>
        <MyHeader title={t("users.title")} subTitle={t("users.subTitle")} />

        <UsersDashboardHeader users={users} loading={loading} t={t} />

        <UsersDataGrid
          users={users}
          loading={loading}
          apiRef={apiRef}
          onEdit={onEdit}
          onView={onView}
          onToggle={onToggle}
          onUnlock={onUnlock}
          onAdd={onAdd}
          onRevoke={onRevoke}
          t={t}
        />

        <UserForm
          open={["edit", "add", "view"].includes(dialogType)}
          dialogType={dialogType}
          selectedUser={selectedUser}
          onClose={closeDialog}
          onSubmit={handleFormSubmit}
          loading={loading}
          t={t}
        />

        <UserDeleteDialog
          open={dialogType === "delete"}
          onClose={closeDialog}
          onConfirm={handleDelete}
          selectedUser={selectedUser}
        />
      </ContentWrapper>
      {SnackbarComponent}
    </>
  );
};

// ─── Guard wrapper ────────────────────────────────────────────────────────────
// Checks the session before mounting UsersPageContent.
// While loading → render nothing (the shell already shows a loading indicator).
// Not allowed   → render the Forbidden page.
const UsersPage = () => {
  const { isLoading, allowed } = usePageGuard({
    requiredPermissions: [permissions.ViewUsers],
  });

  if (isLoading) return null;
  if (!allowed) return <ForbiddenPage />;
  return <UsersPageContent />;
};

export default UsersPage;
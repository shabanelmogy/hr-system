"use client";

import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { useTranslation } from "react-i18next";
import UserForm from "./components/UserForm";
import UsersDashboardHeader from "./components/UsersDashboardHeader";
import UsersDataGrid from "./components/UsersDataGrid";
import useUserGridLogic from "./hooks/useUserGridLogic";

// ─── Content ─────────────────────────────────────────────────────────────────
// Rendered only after the guard confirms access — hooks and API calls are safe here.
const UsersPage = () => {
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
          onEdit={onEdit}
          onView={onView}
          onToggle={onToggle}
          onUnlock={onUnlock}
          onAdd={onAdd}
          onRevoke={onRevoke}
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

      </ContentWrapper>
      {SnackbarComponent}
    </>
  );
};

export default UsersPage;

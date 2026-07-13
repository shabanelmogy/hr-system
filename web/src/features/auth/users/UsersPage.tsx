// UsersPage.js - UPDATED FOR SIMPLE VERSION
import { MyContentsWrapper } from "@/layouts/components";
import { MyHeader } from "@/shared/components";
import { useTranslation } from "react-i18next";
import UserDeleteDialog from "./components/userDeleteDialog";
import UserForm from "./components/userForm";
import UsersDashboardHeader from "./components/usersDashboardHeader";
import UsersDataGrid from "./components/usersDataGrid";
import useUserGridLogic from "./hooks/useUserGridLogic";

const UsersPage = () => {
  const { t } = useTranslation();

  // All logic is now in the hook
  const {
    dialogType,
    selectedUser,
    loading,
    users,
    apiRef,
    onEdit,
    onView,
    onToggle,    // Single function for enable/disable
    onUnlock,    // Unlock only
    onAdd,
    onRevoke,
    closeDialog,
    handleFormSubmit,
    handleDelete,
    SnackbarComponent,
  } = useUserGridLogic();

  return (
    <>
      <MyContentsWrapper>
        <MyHeader title={t("users.title")} subTitle={t("users.subTitle")} />

        {/* Add the dashboard header */}
        <UsersDashboardHeader
          users={users}
          loading={loading}
          t={t}
        />

        <UsersDataGrid
          users={users}
          loading={loading}
          apiRef={apiRef}
          onEdit={onEdit}
          onView={onView}
          onToggle={onToggle}    // Enable/Disable toggle
          onUnlock={onUnlock}    // Unlock only
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
      </MyContentsWrapper>
      {SnackbarComponent}
    </>
  );
};

export default UsersPage;
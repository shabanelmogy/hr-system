"use client";

// RolesPage.js
import { ContentWrapper } from "@/shared/components/layout";
import { MyHeader } from "@/shared/components/common";
import { useTranslation } from "react-i18next";
import RoleDeleteDialog from "./components/RoleDeleteDialog";
import RoleForm from "./components/RoleForm";
import RolesDataGrid from "./components/RolesDataGrid";
import useRoleGridLogic from "./hooks/UseRoleGridLogic";

const RolesPage = () => {
  const { t } = useTranslation();

  // All logic is now in the hook
  const {
    dialogType,
    selectedRole,
    loading,
    roles,
    apiRef,
    onEdit,
    onView,
    onDelete,
    onAdd,
    onManagePermissions,
    closeDialog,
    handleFormSubmit,
    handleDelete,
    SnackbarComponent,
  } = useRoleGridLogic();

  return (
    <>
      <ContentWrapper>
        <MyHeader
          title={t("roles.title")}
          subTitle={t("roles.subTitle")}
        />

        <RolesDataGrid
          roles={roles}
          loading={loading}
          apiRef={apiRef}
          onEdit={onEdit}
          onView={onView}
          onDelete={onDelete}
          onAdd={onAdd}
          onManagePermissions={onManagePermissions}
          t={t}
        />

        <RoleForm
          open={["edit", "add", "view"].includes(dialogType)}
          dialogType={dialogType}
          selectedRole={selectedRole}
          onClose={closeDialog}
          onSubmit={handleFormSubmit}
          loading={loading}
          t={t}
        />

        <RoleDeleteDialog
          open={dialogType === "delete"}
          onClose={closeDialog}
          onConfirm={handleDelete}
          selectedRole={selectedRole}
        />
      </ContentWrapper>
      {SnackbarComponent}
    </>
  );
};

export default RolesPage;
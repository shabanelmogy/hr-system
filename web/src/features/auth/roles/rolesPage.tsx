// RolesPage.js
import { MyContentsWrapper } from "@/layouts/components";
import { MyHeader } from "@/shared/components";
import { useTranslation } from "react-i18next";
import RoleDeleteDialog from "./components/roleDeleteDialog";
import RoleForm from "./components/roleForm";
import RolesDataGrid from "./components/rolesDataGrid";
import useRoleGridLogic from "./hooks/useRoleGridLogic";

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
      <MyContentsWrapper>
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
      </MyContentsWrapper>
      {SnackbarComponent}
    </>
  );
};

export default RolesPage;
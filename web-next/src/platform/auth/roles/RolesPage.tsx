"use client";

// RolesPage.js
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import RolesDataGrid from "./components/RolesDataGrid";
import useRoleGridLogic from "./hooks/UseRoleGridLogic";

const RoleForm = dynamic(() => import("./components/RoleForm"), { ssr: false });
const RoleArchiveDialog = dynamic(() => import("./components/RoleArchiveDialog"), { ssr: false });

const RolesPage = () => {
  const { t } = useTranslation();

  // All logic is now in the hook
  const {
    dialogType,
    selectedRole,
    loading,
    roles,
    canCreate,
    canEdit,
    canDelete,
    canEditPermissions,
    apiRef,
    onEdit,
    onView,
    onDelete,
    onAdd,
    onManagePermissions,
    onRestore,
    lastAddedId,
    lastEditedId,
    lastDeletedIndex,
    closeDialog,
    handleFormSubmit,
    handleDelete,
    SnackbarComponent,
  } = useRoleGridLogic();
  const roleFormDialogType =
    dialogType === "edit" || dialogType === "view" ? dialogType : "add";

  return (
    <>
      <ContentWrapper>
        <PageHeader
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
          onRestore={onRestore}
          canCreate={canCreate}
          canEdit={canEdit}
          canDelete={canDelete}
          canEditPermissions={canEditPermissions}
          lastAddedId={lastAddedId}
          lastEditedId={lastEditedId}
          lastDeletedIndex={lastDeletedIndex}
          t={t}
        />

        {dialogType === "edit" || dialogType === "add" || dialogType === "view" ? <RoleForm
          open={dialogType === "edit" || dialogType === "add" || dialogType === "view"}
          dialogType={roleFormDialogType}
          selectedRole={selectedRole}
          onClose={closeDialog}
          onSubmit={handleFormSubmit}
          loading={loading}
          t={t}
        /> : null}

        {dialogType === "delete" ? <RoleArchiveDialog
          open
          onClose={closeDialog}
          onConfirm={handleDelete}
          selectedRole={selectedRole}
        /> : null}
      </ContentWrapper>
      {SnackbarComponent}
    </>
  );
};

export default RolesPage;

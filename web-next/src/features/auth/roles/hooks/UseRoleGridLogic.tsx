import { appRoutes, normalizeAppPath } from "@/config/routes";
import type { CreateRoleRequest, Role, UpdateRoleRequest } from "../../types";
import useApiHandler from "@/shared/hooks/useApiHandler";
import { useGridCrudController } from "@/shared/hooks/useGridCrudController";
import { useGridCrudMarkerCleanup } from "@/shared/hooks/useGridCrudMarkerCleanup";
import useNotifications from "@/shared/hooks/useNotifications";
import { useGridApiRef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import useRoleStore from "../store/useRoleStore";
import type { RoleFormData } from "../utils/validation";

const useRoleGridLogic = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const { loading, handleApiCall } = useApiHandler({ showSuccess, showError });
  const fetchStartedRef = useRef(false);
  const apiRef = useGridApiRef();

  const fetchRoles = useRoleStore((state) => state.fetchRoles);
  const roles = useRoleStore((state) => state.roles);
  const addRole = useRoleStore((state) => state.addRole);
  const updateRole = useRoleStore((state) => state.updateRole);
  const toggleRole = useRoleStore((state) => state.toggleRole);
  const activeRoles = useMemo(
    () => roles.filter((role) => !role.isDeleted),
    [roles],
  );

  const create = useCallback(async (formData: RoleFormData): Promise<Role> => {
    const request: CreateRoleRequest = { name: formData.name };
    const role = await handleApiCall(
      () => addRole(request),
      t("roles.created"),
      null,
      true,
    );
    if (!role) throw new Error("Role creation did not return a role.");
    return role;
  }, [addRole, handleApiCall, t]);

  const update = useCallback(async (
    id: string | number,
    formData: RoleFormData,
  ): Promise<Role> => {
    const request: UpdateRoleRequest = { id: String(id), name: formData.name };
    const role = await handleApiCall(
      () => updateRole(request),
      t("roles.updated"),
      null,
      true,
    );
    if (!role) throw new Error("Role update did not return a role.");
    return role;
  }, [handleApiCall, t, updateRole]);

  const remove = useCallback(async (id: string | number) => {
    const role = await handleApiCall(
      () => toggleRole(String(id)),
      t("roles.deleted"),
      null,
      true,
    );
    if (!role) throw new Error("Role deletion did not return a role.");
    return role;
  }, [handleApiCall, t, toggleRole]);

  const refresh = useCallback(async () => {
    await handleApiCall(() => fetchRoles(), null);
  }, [fetchRoles, handleApiCall]);

  const crud = useGridCrudController<Role, RoleFormData>({
    items: activeRoles,
    create,
    update,
    remove,
    refresh,
  });

  useGridCrudMarkerCleanup({
    lastAddedId: crud.lastAddedId,
    lastEditedId: crud.lastEditedId,
    lastDeletedIndex: crud.lastDeletedIndex,
    clearLastAdded: crud.clearLastAdded,
    clearLastEdited: crud.clearLastEdited,
    clearLastDeleted: crud.clearLastDeleted,
  });

  const handleManagePermissions = useCallback((role: Role) => {
    router.push(normalizeAppPath(appRoutes.auth.rolePermissionsPage(role.id)));
  }, [router]);

  useEffect(() => {
    if (fetchStartedRef.current) return;
    fetchStartedRef.current = true;
    void handleApiCall(() => fetchRoles(), null);
  }, [fetchRoles, handleApiCall]);

  return {
    dialogType: crud.dialogType,
    selectedRole: crud.selectedItem,
    loading,
    roles: activeRoles,
    apiRef,
    closeDialog: crud.closeDialog,
    handleFormSubmit: crud.handleFormSubmit,
    handleDelete: crud.handleDelete,
    onEdit: crud.onEdit,
    onView: crud.onView,
    onDelete: crud.onDelete,
    onAdd: crud.onAdd,
    onManagePermissions: handleManagePermissions,
    lastAddedId: crud.lastAddedId,
    lastEditedId: crud.lastEditedId,
    lastDeletedIndex: crud.lastDeletedIndex,
    SnackbarComponent,
  };
};

export default useRoleGridLogic;

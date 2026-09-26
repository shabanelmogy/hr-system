import { appRoutes, normalizeAppPath } from "@/config/routes";
import type { CreateRoleRequest, Role, UpdateRoleRequest } from "../../types";
import useApiHandler from "@/shared/hooks/useApiHandler";
import { useGridCrudController } from "@/shared/hooks/useGridCrudController";
import { useGridCrudMarkerCleanup } from "@/shared/hooks/useGridCrudMarkerCleanup";
import useNotifications from "@/shared/hooks/useNotifications";
import { useGridApiRef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import useRoleStore from "../store/useRoleStore";
import type { RoleFormData } from "../utils/validation";
import { useUnsavedChanges } from "@/shared/contexts/UnsavedChangesContext";
import { permissions } from "@/lib/auth/permissions";
import { usePermissions } from "@/shared/hooks/usePermissions";

const useRoleGridLogic = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { requestDiscard } = useUnsavedChanges();
  const { hasPermission, isReadOnly } = usePermissions();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const { loading, handleApiCall } = useApiHandler({ showSuccess, showError });
  const fetchStartedRef = useRef(false);
  const apiRef = useGridApiRef();

  const fetchRoles = useRoleStore((state) => state.fetchRoles);
  const roles = useRoleStore((state) => state.roles);
  const addRole = useRoleStore((state) => state.addRole);
  const updateRole = useRoleStore((state) => state.updateRole);
  const toggleRole = useRoleStore((state) => state.toggleRole);
  const canCreate = !isReadOnly && hasPermission(permissions.CreateRoles);
  const canEdit = !isReadOnly && hasPermission(permissions.EditRoles);
  const canDelete = !isReadOnly && hasPermission(permissions.SetRoleStatus);
  const canViewPermissions = hasPermission(permissions.ViewRolePermissions);
  const canEditPermissions = !isReadOnly && hasPermission(permissions.EditRolePermissions);

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
      t("actions.archive"),
      null,
      true,
    );
    if (!role) throw new Error("Role archive did not return a role.");
    return role;
  }, [handleApiCall, t, toggleRole]);

  const handleRestore = useCallback(async (role: Role) => {
    const restoredRole = await handleApiCall(
      () => toggleRole(role.id),
      t("actions.restore"),
      null,
      true,
    );
    if (!restoredRole) throw new Error("Role restore did not return a role.");
    return restoredRole;
  }, [handleApiCall, t, toggleRole]);

  const refresh = useCallback(async () => {
    await handleApiCall(() => fetchRoles(), null);
  }, [fetchRoles, handleApiCall]);

  const crud = useGridCrudController<Role, RoleFormData>({
    items: roles,
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

  const handleManagePermissions = useCallback(async (role: Role) => {
    if (!(await requestDiscard())) return;
    router.push(normalizeAppPath(appRoutes.platform.administration.rolePermissions(role.id)));
  }, [requestDiscard, router]);

  useEffect(() => {
    if (fetchStartedRef.current) return;
    fetchStartedRef.current = true;
    void handleApiCall(() => fetchRoles(), null);
  }, [fetchRoles, handleApiCall]);

  return {
    dialogType: crud.dialogType,
    selectedRole: crud.selectedItem,
    loading,
    roles,
    canCreate,
    canEdit,
    canDelete,
    apiRef,
    closeDialog: crud.closeDialog,
    handleFormSubmit: crud.handleFormSubmit,
    handleDelete: crud.handleDelete,
    onEdit: crud.onEdit,
    onView: crud.onView,
    onDelete: crud.onDelete,
    onAdd: crud.onAdd,
    onManagePermissions: canViewPermissions ? handleManagePermissions : undefined,
    canEditPermissions,
    onRestore: handleRestore,
    lastAddedId: crud.lastAddedId,
    lastEditedId: crud.lastEditedId,
    lastDeletedIndex: crud.lastDeletedIndex,
    SnackbarComponent,
  };
};

export default useRoleGridLogic;

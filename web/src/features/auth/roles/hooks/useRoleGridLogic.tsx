// hooks/useRoleGridLogic.js
import { appRoutes } from "@/routes/appRoutes";
import { useApiHandler, useNotifications } from "@/shared/hooks";
import { useGridApiRef } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useRoleStore from "../store/useRoleStore";

const useRoleGridLogic = () => {
  // Hooks
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const { loading, handleApiCall } = useApiHandler({
    showSuccess,
    showError,
  }); // Pass notification functions to the API handler

  // State management
  const [dialogType, setDialogType] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [fetchTriggered, setFetchTriggered] = useState(false);

  // Store access
  const { fetchRoles, roles, addRole, updateRole, toggleRole } =
    useRoleStore() as any;

  // Refs for grid navigation
  const gridActionRef = useRef(null);
  const apiRef = useGridApiRef();

  // Memoized roles
  const stableRoles = useMemo(() => roles, [roles]);

  // Fetch roles
  const getAllRoles = useCallback(async () => {
    if (loading || fetchTriggered) return;
    setFetchTriggered(true);
    await handleApiCall(async () => {
      const response = await fetchRoles();
      // Filter based on delete filter preference if needed
      const filterData = response.filter((r: any) => !r.isDeleted);
      useRoleStore.setState({ roles: filterData });
      return filterData;
    }, t("roles.fetched"));
  }, [fetchRoles, handleApiCall, loading, fetchTriggered, t]);

  // Dialog management
  const openDialog = useCallback((type: any, role: any = null) => {
    setDialogType(type);
    setSelectedRole(role);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogType(null);
    setSelectedRole(null);
  }, []);

  // Grid navigation
  const handleGridNavigation = useCallback(() => {
    const gridAction = gridActionRef.current;
    if (!gridAction || !apiRef.current || !stableRoles.length) {
      gridActionRef.current = null;
      return;
    }

    const { type, id } = gridAction;
    const pageSize = apiRef.current.state.pagination.paginationModel.pageSize;
    let targetIndex;

    if (type === "add") {
      targetIndex = stableRoles.length - 1;
    } else if (type === "edit") {
      targetIndex = stableRoles.findIndex((row: any) => row.id === id);
    } else if (type === "delete") {
      const deletedIndex = stableRoles.findIndex((row: any) => row.id === id);
      targetIndex = Math.max(0, deletedIndex - 1);
    }

    if (targetIndex >= 0 && targetIndex < stableRoles.length) {
      const newPage = Math.floor(targetIndex / pageSize);
      apiRef.current.setPage(newPage);
      apiRef.current.scrollToIndexes({ rowIndex: targetIndex, colIndex: 0 });
      const selectId = type === "delete" ? stableRoles[targetIndex]?.id : id;
      if (selectId) apiRef.current.selectRow(selectId, true);
    }

    gridActionRef.current = null;
  }, [stableRoles, gridActionRef, apiRef]);

  // Form submission handler
  const handleFormSubmit = useCallback(
    async (formdata: any) => {
      let gridAction = null;
      if (dialogType === "edit" && selectedRole?.id) {
        const result = await handleApiCall(
          () => updateRole({ ...formdata, id: selectedRole.id }),
          t("roles.updated")
        );
        gridAction = { type: "edit", id: result.id };
      } else if (dialogType === "add") {
        const response = await handleApiCall(
          () => addRole(formdata),
          t("roles.created")
        );
        gridAction = { type: "add", id: response.id };
      }
      closeDialog();
      if (gridAction) {
        gridActionRef.current = gridAction;
        handleGridNavigation();
      }
    },
    [
      dialogType,
      selectedRole,
      updateRole,
      addRole,
      handleApiCall,
      t,
      closeDialog,
      gridActionRef,
      handleGridNavigation,
    ]
  );

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!selectedRole?.id) return;

    const deletedId = selectedRole.id;
    await handleApiCall(() => toggleRole(deletedId), t("roles.deleted"));
    closeDialog();

    gridActionRef.current = { type: "delete", id: deletedId };
    handleGridNavigation();
  }, [
    selectedRole,
    toggleRole,
    handleApiCall,
    t,
    closeDialog,
    gridActionRef,
    handleGridNavigation,
  ]);

  // Navigate to permissions management
  //TODO: Custom Hook For Navigation
  const handleManagePermissions = useCallback((role: any) => {
    const path = appRoutes.auth.rolePermissionsPage.replace(':id', role.id);
    navigate(`/${path}`);
  }, [navigate]);

  // Initial fetch
  useEffect(() => {
    getAllRoles();
  }, [getAllRoles]);

  return {
    // State
    dialogType,
    selectedRole,
    loading,
    roles: stableRoles,
    apiRef,

    // Methods
    openDialog,
    closeDialog,
    handleFormSubmit,
    handleDelete,
    handleManagePermissions,
    onEdit: (role: any) => openDialog("edit", role),
    onView: (role: any) => openDialog("view", role),
    onDelete: (role: any) => openDialog("delete", role),
    onAdd: () => openDialog("add"),
    onManagePermissions: handleManagePermissions,

    // Components
    SnackbarComponent,
  };
};

export default useRoleGridLogic;

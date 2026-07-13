// hooks/useUserGridLogic.js - SIMPLE VERSION (NO LOCK FUNCTION)
import { useNotifications } from "@/shared/hooks";
import useApiHandler from "@/shared/hooks/useApiHandler";
import { useGridApiRef } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useUserStore from "../store/useUserStore";

const useUserGridLogic = () => {
  // Hooks
  const { t } = useTranslation();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const { loading, handleApiCall } = useApiHandler({
    showSuccess,
    showError,
  });

  // State management
  const [fetchTriggered, setFetchTriggered] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDisabled, setShowDisabled] = useState(true);
  const [dialogType, setDialogType] = useState(null);

  // Store access - ONLY using what you have
  const fetchUsers = useUserStore((state: any) => state.fetchUsers);
  const users = useUserStore((state: any) => state.users);
  const addUser = useUserStore((state: any) => state.addUser);
  const updateUser = useUserStore((state: any) => state.updateUser);
  const toggleUser = useUserStore((state: any) => state.toggleUser);
  const unLockUser = useUserStore((state: any) => state.unLockUser);
  const revokeToken = useUserStore((state: any) => state.revokeToken);
  const deleteUser = useUserStore((state: any) => state.deleteUser);

  // Refs for grid navigation
  const gridActionRef = useRef(null);
  const apiRef = useGridApiRef();

  // Memoized users with filtering logic
  const stableUsers = useMemo(() => {
    if (showDisabled) {
      return users;
    } else {
      return users.filter((u: any) => !u.isDisabled);
    }
  }, [users, showDisabled]);

  // Fetch users
  const getAllUsers = useCallback(async () => {
    if (loading || fetchTriggered) return;
    setFetchTriggered(true);
    await handleApiCall(async () => {
      const response = await fetchUsers();
      useUserStore.setState({ users: response });
      return response;
    }, t("users.fetched"));
  }, [fetchUsers, handleApiCall, loading, fetchTriggered, t]);

  // Toggle function to show/hide disabled users
  const toggleShowDisabled = useCallback(() => {
    setShowDisabled((prev) => !prev);
  }, []);

  // Dialog management
  const openDialog = useCallback((type: "add" | "edit" | "view" | "delete", user: any = null) => {
    setDialogType(type);
    setSelectedUser(user);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogType(null);
    setSelectedUser(null);
  }, []);

  // Grid navigation
  const handleGridNavigation = useCallback(() => {
    const gridAction = gridActionRef.current;
    if (!gridAction || !apiRef.current || !stableUsers.length) {
      gridActionRef.current = null;
      return;
    }

    const { type, id } = gridAction;
    const pageSize = apiRef.current.state.pagination.paginationModel.pageSize;
    let targetIndex;

    if (type === "add") {
      targetIndex = stableUsers.length - 1;
    } else if (type === "edit") {
      targetIndex = stableUsers.findIndex((row: any) => row.id === id);
    } else if (type === "delete") {
      const deletedIndex = stableUsers.findIndex((row: any) => row.id === id);
      targetIndex = Math.max(0, deletedIndex - 1);
    }

    if (targetIndex >= 0 && targetIndex < stableUsers.length) {
      const newPage = Math.floor(targetIndex / pageSize);
      apiRef.current.setPage(newPage);
      apiRef.current.scrollToIndexes({ rowIndex: targetIndex, colIndex: 0 });
      const selectId = type === "delete" ? stableUsers[targetIndex]?.id : id;
      if (selectId) apiRef.current.selectRow(selectId, true);
    }

    gridActionRef.current = null;
  }, [stableUsers, gridActionRef, apiRef]);

  // Form submission handler
  const handleFormSubmit = useCallback(
    async (formdata: any) => {
      let gridAction = null;
      if (dialogType === "edit" && selectedUser?.id) {
        const result = await handleApiCall(
          () => updateUser({ ...formdata, id: selectedUser.id }),
          t("users.updated")
        );
        gridAction = { type: "edit", id: result.id };
      } else if (dialogType === "add") {
        const response = await handleApiCall(
          () => addUser(formdata),
          t("users.created")
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
      selectedUser,
      updateUser,
      addUser,
      handleApiCall,
      t,
      closeDialog,
      gridActionRef,
      handleGridNavigation,
    ]
  );

  // Handle enable/disable user - using toggleUser function
  const handleToggleUser = useCallback(
    async (user: any) => {
      const action = user.isDisabled ? "enabled" : "disabled";
      await handleApiCall(async () => {
        const result = await toggleUser(user.id);
        return result;
      }, t(`users.${action}`));
    },
    [toggleUser, fetchUsers, handleApiCall, t]
  );

  // Handle unlock user - using your existing unLockUser function
  const handleUnlockUser = useCallback(
    async (user: any) => {
      await handleApiCall(async () => {
        const result = await unLockUser(user.id);
        // No need to fetch all users - store already updated in unLockUser
        return result;
      }, t("users.unlocked"));
    },
    [unLockUser, handleApiCall, t]
  );

  //Handle Revoke Token
  const handleRevokeToken = useCallback(async (user: any) => {
    await handleApiCall(async () => {
      const result = await revokeToken(user.id);
      return result;
    }, t("users.revoked"));
  }, []);

  // Handle delete user
  const handleDelete = useCallback(
    async () => {
      if (!selectedUser?.id) return;

      await handleApiCall(async () => {
        const result = await deleteUser(selectedUser.id);
        gridActionRef.current = { type: "delete", id: selectedUser.id };
        return result;
      }, t("users.deleted"));

      closeDialog();
      handleGridNavigation();
    },
    [selectedUser, deleteUser, handleApiCall, t, closeDialog, handleGridNavigation]
  );

  // Get user counts for display
  const userCounts = useMemo(() => {
    const total = users.length;
    const active = users.filter((u: any) => !u.isDisabled).length;
    const disabled = users.filter((u: any) => u.isDisabled).length;
    const locked = users.filter((u: any) => u.isLocked).length;

    return { total, active, disabled, locked };
  }, [users]);

  // Initial fetch
  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  return {
    // State
    dialogType,
    selectedUser,
    loading,
    users: stableUsers,
    apiRef,
    showDisabled,
    userCounts,

    // Methods
    openDialog,
    closeDialog,
    handleFormSubmit,
    handleToggleUser, // Single function for enable/disable
    handleUnlockUser, // Unlock only
    toggleShowDisabled,
    handleRevokeToken,
    handleDelete,

    // Actions for grid
    onEdit: (user: any) => openDialog("edit", user),
    onView: (user: any) => openDialog("view", user),
    onAdd: () => openDialog("add"),
    onToggle: handleToggleUser, // Enable/Disable toggle
    onUnlock: handleUnlockUser,
    onRevoke: handleRevokeToken, // Unlock only

    // Components
    SnackbarComponent,
  };
};

export default useUserGridLogic;

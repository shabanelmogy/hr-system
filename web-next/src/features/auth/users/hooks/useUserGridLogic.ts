import type { CreateUserRequest, UpdateUserRequest, User } from "../../types";
import useApiHandler from "@/shared/hooks/useApiHandler";
import { useGridRowNavigation } from "@/shared/hooks/useGridRowNavigation";
import useNotifications from "@/shared/hooks/useNotifications";
import { useGridApiRef } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useUserStore from "../store/useUserStore";
import type { UserFormData } from "../utils/validation";

type UserDialogType = "add" | "edit" | "view" | null;

const useUserGridLogic = () => {
  const { t } = useTranslation();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const { loading, handleApiCall } = useApiHandler({ showSuccess, showError });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogType, setDialogType] = useState<UserDialogType>(null);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [lastEditedId, setLastEditedId] = useState<string | null>(null);
  const fetchStartedRef = useRef(false);
  const apiRef = useGridApiRef();

  const fetchUsers = useUserStore((state) => state.fetchUsers);
  const users = useUserStore((state) => state.users);
  const addUser = useUserStore((state) => state.addUser);
  const updateUser = useUserStore((state) => state.updateUser);
  const changeUserPassword = useUserStore((state) => state.changeUserPassword);
  const toggleUser = useUserStore((state) => state.toggleUser);
  const unLockUser = useUserStore((state) => state.unLockUser);
  const revokeToken = useUserStore((state) => state.revokeToken);

  const stableUsers = useMemo(() => users, [users]);

  const closeDialog = useCallback(() => {
    setDialogType(null);
    setSelectedUser(null);
  }, []);

  const openDialog = useCallback((type: UserDialogType, user: User | null = null) => {
    setDialogType(type);
    setSelectedUser(user);
  }, []);

  const handleFormSubmit = useCallback(async (formData: UserFormData) => {
    if (dialogType === "add") {
      const request = toCreateUserRequest(formData);
      const created = await handleApiCall(
        () => addUser(request),
        t("users.created"),
        null,
        true,
      );
      if (!created) return;
      setLastAddedId(created.id);
      closeDialog();
      return;
    }

    if (dialogType !== "edit" || !selectedUser) return;
    const request = toUpdateUserRequest(selectedUser.id, formData);
    const updated = await handleApiCall(
      async () => {
        const result = await updateUser(request);
        const password = formData.password?.trim();
        if (password) {
          await changeUserPassword({
            id: selectedUser.id,
            newPassword: password,
            confirmPassword: formData.confirmPassword ?? "",
          });
        }
        return result;
      },
      t("users.updated"),
      null,
      true,
    );
    if (!updated) return;
    setLastEditedId(updated.id);
    closeDialog();
  }, [
    addUser,
    changeUserPassword,
    closeDialog,
    dialogType,
    handleApiCall,
    selectedUser,
    t,
    updateUser,
  ]);

  const handleToggleUser = useCallback(async (user: User) => {
    const action = user.isDisabled ? "enabled" : "disabled";
    await handleApiCall(() => toggleUser(user.id), t(`users.${action}`));
  }, [handleApiCall, t, toggleUser]);

  const handleUnlockUser = useCallback(async (user: User) => {
    await handleApiCall(() => unLockUser(user.id), t("users.unlocked"));
  }, [handleApiCall, t, unLockUser]);

  const handleRevokeToken = useCallback(async (user: User) => {
    await handleApiCall(() => revokeToken(user.id), t("users.revoked"));
  }, [handleApiCall, revokeToken, t]);

  const onAdd = useCallback(() => openDialog("add"), [openDialog]);
  const onEdit = useCallback((user: User) => openDialog("edit", user), [openDialog]);
  const onView = useCallback((user: User) => openDialog("view", user), [openDialog]);
  const clearLastAdded = useCallback(() => setLastAddedId(null), []);
  const clearLastEdited = useCallback(() => setLastEditedId(null), []);

  useGridRowNavigation({
    apiRef,
    items: stableUsers,
    isLoading: loading,
    isFetching: false,
    lastAddedId,
    lastEditedId,
    lastDeletedIndex: null,
    clearLastAdded,
    clearLastEdited,
    clearLastDeleted: noop,
  });

  useEffect(() => {
    if (fetchStartedRef.current) return;
    fetchStartedRef.current = true;
    void handleApiCall(() => fetchUsers(), null);
  }, [fetchUsers, handleApiCall]);

  return {
    dialogType,
    selectedUser,
    loading,
    users: stableUsers,
    apiRef,
    openDialog,
    closeDialog,
    handleFormSubmit,
    onEdit,
    onView,
    onAdd,
    onToggle: handleToggleUser,
    onUnlock: handleUnlockUser,
    onRevoke: handleRevokeToken,
    SnackbarComponent,
  };
};

function toCreateUserRequest(formData: UserFormData): CreateUserRequest {
  const password = formData.password?.trim();
  if (!password) throw new Error("A password is required when creating a user.");
  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    userName: formData.userName,
    email: formData.email,
    password,
    roles: formData.roles,
  };
}

function toUpdateUserRequest(
  id: string,
  formData: UserFormData,
): UpdateUserRequest {
  return {
    id,
    firstName: formData.firstName,
    lastName: formData.lastName,
    userName: formData.userName,
    email: formData.email,
    roles: formData.roles,
  };
}

function noop() {}

export default useUserGridLogic;

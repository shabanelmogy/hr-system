import type { CreateUserRequest, UpdateUserRequest, User } from "../../types";
import useApiHandler from "@/shared/hooks/useApiHandler";
import { useGridCrudMarkerCleanup } from "@/shared/hooks/useGridCrudMarkerCleanup";
import useNotifications from "@/shared/hooks/useNotifications";
import {
  getLastServerListPage,
  useServerListState,
} from "@/shared/hooks/useServerListState";
import { useGridApiRef } from "@mui/x-data-grid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useUserStore from "../store/useUserStore";
import type { UserFormData } from "../utils/validation";
import { getUsersPage, userPageKeys } from "../userPageApi";

type UserDialogType = "add" | "edit" | "view" | null;
export type UserSortColumn = "name" | "userName" | "email";

const useUserGridLogic = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const { loading: mutationLoading, handleApiCall } = useApiHandler({ showSuccess, showError });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogType, setDialogType] = useState<UserDialogType>(null);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [lastEditedId, setLastEditedId] = useState<string | null>(null);
  const apiRef = useGridApiRef();
  const list = useServerListState<UserSortColumn, { includeArchived: boolean }>({
    defaultColumn: "name",
    defaultSortDirection: "ASC",
    defaultFilters: { includeArchived: false },
    defaultPageSize: 10,
  });

  const pageQuery = useMemo(() => ({
    pageNumber: list.state.page + 1,
    pageSize: list.state.pageSize,
    searchValue: list.debouncedSearchValue || undefined,
    columnName: list.state.columnName,
    sortDirection: list.state.sortDirection,
    includeArchived: list.state.filters.includeArchived,
  }), [list.debouncedSearchValue, list.state]);
  const usersQuery = useQuery({
    queryKey: userPageKeys.page(pageQuery),
    queryFn: () => getUsersPage(pageQuery),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });
  const users = usersQuery.data?.items ?? [];
  const totalCount = usersQuery.data?.metaData.totalCount ?? 0;

  const fetchCompanyOptions = useUserStore((state) => state.fetchCompanyOptions);
  const hasCompanyOptionsLoaded = useUserStore((state) => state.hasCompanyOptionsLoaded);
  const addUser = useUserStore((state) => state.addUser);
  const updateUser = useUserStore((state) => state.updateUser);
  const changeUserPassword = useUserStore((state) => state.changeUserPassword);
  const toggleUser = useUserStore((state) => state.toggleUser);
  const unLockUser = useUserStore((state) => state.unLockUser);
  const archiveUser = useUserStore((state) => state.archiveUser);
  const restoreUser = useUserStore((state) => state.restoreUser);
  const revokeToken = useUserStore((state) => state.revokeToken);

  useEffect(() => {
    if (hasCompanyOptionsLoaded) return;
    void handleApiCall(() => fetchCompanyOptions(), null);
  }, [fetchCompanyOptions, handleApiCall, hasCompanyOptionsLoaded]);

  useEffect(() => {
    if (!usersQuery.data) return;
    const lastPage = getLastServerListPage(totalCount, list.state.pageSize);
    if (list.state.page > lastPage) list.setPage(lastPage);
  }, [list, totalCount, usersQuery.data]);

  const refreshUsers = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: userPageKeys.all });
  }, [queryClient]);

  const closeDialog = useCallback(() => {
    setDialogType(null);
    setSelectedUser(null);
  }, []);

  const openDialog = useCallback((type: UserDialogType, user: User | null = null) => {
    setDialogType(type);
    setSelectedUser(user);
  }, []);

  const handleFormSubmit = useCallback(async (formData: UserFormData) => {
    if (dialogType === "edit" && selectedUser) {
      const request = toUpdateUserRequest(selectedUser.id, formData);
      const updatedId = await handleApiCall(
        async () => {
          await updateUser(request);
          const password = formData.password?.trim();
          if (password) {
            await changeUserPassword({
              id: selectedUser.id,
              newPassword: password,
              confirmPassword: formData.confirmPassword ?? "",
            });
          }
          await refreshUsers();
          return selectedUser.id;
        },
        t("users.updated"),
        null,
        true,
      );
      if (!updatedId) return;
      setLastEditedId(updatedId);
      closeDialog();
    } else if (dialogType === "add") {
      const request: CreateUserRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        userName: formData.userName.trim(),
        email: formData.email.trim(),
        password: formData.password?.trim() ?? "",
        roles: formData.roles,
        companyIds: formData.companyIds,
        defaultCompanyId: formData.defaultCompanyId,
      };
      const created = await handleApiCall(
        async () => {
          const result = await addUser(request);
          await refreshUsers();
          return result;
        },
        t("users.created"),
        null,
        true,
      );
      if (!created) return;
      setLastAddedId(created.id);
      closeDialog();
    }
  }, [
    addUser,
    changeUserPassword,
    closeDialog,
    dialogType,
    handleApiCall,
    refreshUsers,
    selectedUser,
    t,
    updateUser,
  ]);

  const handleToggleUser = useCallback(async (user: User) => {
    const action = user.isDisabled ? "enabled" : "disabled";
    await handleApiCall(async () => {
      await toggleUser(user.id);
      await refreshUsers();
    }, t(`users.${action}`));
  }, [handleApiCall, refreshUsers, t, toggleUser]);

  const handleUnlockUser = useCallback(async (user: User) => {
    await handleApiCall(async () => {
      await unLockUser(user.id);
      await refreshUsers();
    }, t("users.unlocked"));
  }, [handleApiCall, refreshUsers, t, unLockUser]);

  const handleArchiveUser = useCallback(async (user: User, reason: string) => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) return false;
    const result = await handleApiCall(async () => {
      await archiveUser(user.id, trimmedReason);
      await refreshUsers();
      return true;
    }, t("users.archived"));
    return Boolean(result);
  }, [archiveUser, handleApiCall, refreshUsers, t]);

  const handleRestoreUser = useCallback(async (user: User) => {
    const result = await handleApiCall(async () => {
      await restoreUser(user.id);
      await refreshUsers();
      return true;
    }, t("users.restored"));
    return Boolean(result);
  }, [handleApiCall, refreshUsers, restoreUser, t]);

  const [revokeTarget, setRevokeTarget] = useState<User | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const onRevoke = useCallback((user: User) => {
    setRevokeTarget(user);
  }, []);

  const onConfirmRevoke = useCallback(async () => {
    if (!revokeTarget) return;
    setIsRevoking(true);
    try {
      await handleApiCall(() => revokeToken(revokeTarget.id), t("users.revoked"));
      setRevokeTarget(null);
    } finally {
      setIsRevoking(false);
    }
  }, [handleApiCall, revokeTarget, revokeToken, t]);

  const onCancelRevoke = useCallback(() => {
    if (!isRevoking) setRevokeTarget(null);
  }, [isRevoking]);

  const onAdd = useCallback(() => openDialog("add"), [openDialog]);
  const onEdit = useCallback((user: User) => openDialog("edit", user), [openDialog]);
  const onView = useCallback((user: User) => openDialog("view", user), [openDialog]);
  const clearLastAdded = useCallback(() => setLastAddedId(null), []);
  const clearLastEdited = useCallback(() => setLastEditedId(null), []);

  useGridCrudMarkerCleanup({
    lastAddedId,
    lastEditedId,
    lastDeletedIndex: null,
    clearLastAdded,
    clearLastEdited,
    clearLastDeleted: noop,
  });

  return {
    dialogType,
    selectedUser,
    loading: mutationLoading || usersQuery.isLoading,
    isFetching: usersQuery.isFetching || list.isSearchPending,
    error: usersQuery.error,
    users,
    totalCount,
    page: list.state.page,
    pageSize: list.state.pageSize,
    searchValue: list.state.searchValue,
    sortColumn: list.state.columnName,
    sortDirection: list.state.sortDirection,
    includeArchived: list.state.filters.includeArchived,
    apiRef,
    closeDialog,
    handleFormSubmit,
    onAdd,
    onEdit,
    onView,
    onToggle: handleToggleUser,
    onUnlock: handleUnlockUser,
    archiveUser: handleArchiveUser,
    restoreUser: handleRestoreUser,
    onRevoke,
    onRefresh: usersQuery.refetch,
    onPageChange: list.setPage,
    onPageSizeChange: list.setPageSize,
    onSearchChange: list.setSearchValue,
    onSortChange: list.setSort,
    onIncludeArchivedChange: (includeArchived: boolean) => list.setFilters({ includeArchived }),
    onResetList: list.reset,
    revokeTarget,
    isRevoking,
    onConfirmRevoke,
    onCancelRevoke,
    lastAddedId,
    lastEditedId,
    SnackbarComponent,
  };
};

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
    companyIds: formData.companyIds,
    defaultCompanyId: formData.defaultCompanyId,
  };
}

function noop() {}

export default useUserGridLogic;

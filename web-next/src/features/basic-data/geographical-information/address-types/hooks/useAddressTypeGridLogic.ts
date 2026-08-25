import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";
import { useModulePermissions } from "@/shared/hooks/usePermissions";
import { getLastServerListPage, useServerListState } from "@/shared/hooks/useServerListState";
import { normalizeBulkSelection } from "@/shared/utils/bulkSelection";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAddressTypePage,
  useArchiveAddressType,
  useBulkArchiveAddressTypes,
  useCreateAddressType,
  useRestoreAddressType,
  useUpdateAddressType,
} from "./useAddressTypeQueries";
import type { AddressType, AddressTypeListFilters, AddressTypeSortColumn, CreateAddressTypeRequest } from "../types/AddressType";
import { toAddressTypePageQuery } from "../utils/addressTypePageQuery";
import { canRunAddressTypeAction, type AddressTypePermissionSet } from "../utils/addressTypePermissions";

export type AddressTypeDialogType = "add" | "edit" | "view" | null;

const defaultFilters: AddressTypeListFilters = {
  status: "active",
  searchField: "all",
  searchOperator: "contains",
};

/** The one controller shared by every Address Type list view. */
export default function useAddressTypeGridLogic() {
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const authorization = useModulePermissions("AddressTypes");
  const list = useServerListState<AddressTypeSortColumn, AddressTypeListFilters>({
    defaultColumn: "createdOn",
    defaultSortDirection: "DESC",
    defaultFilters,
    defaultPageSize: 10,
  });
  const pageQuery = useMemo(
    () => toAddressTypePageQuery(list.state, list.debouncedSearchValue),
    [list.debouncedSearchValue, list.state],
  );
  const query = useAddressTypePage(pageQuery);
  const create = useCreateAddressType();
  const update = useUpdateAddressType();
  const archive = useArchiveAddressType();
  const restore = useRestoreAddressType();
  const bulkArchive = useBulkArchiveAddressTypes();
  const [dialogType, setDialogType] = useState<AddressTypeDialogType>(null);
  const [selectedItem, setSelectedItem] = useState<AddressType | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<AddressType | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const items = query.data?.items ?? [];
  const totalCount = query.data?.metaData.totalCount ?? 0;
  const permissions = useMemo<AddressTypePermissionSet>(() => ({
    canView: authorization.canView,
    canCreate: authorization.canCreate && !isReadOnly,
    canEdit: authorization.canEdit && !isReadOnly,
    canDelete: authorization.canDelete && !isReadOnly,
    canRestore: authorization.canDelete && !isReadOnly,
  }), [authorization, isReadOnly]);
  const selectableIds = useMemo(
    () => new Set(items.filter((item) => !item.isDeleted).map((item) => item.id)),
    [items],
  );
  const selectedAddressTypeIds = useMemo(
    () => permissions.canDelete ? selectedIds.filter((id) => selectableIds.has(id)) : [],
    [permissions.canDelete, selectableIds, selectedIds],
  );
  const clearBulkSelection = useCallback(() => setSelectedIds([]), []);

  useEffect(() => {
    if (!query.isSuccess) return;
    const lastPage = getLastServerListPage(totalCount, list.state.pageSize);
    if (list.state.page > lastPage) list.setPage(lastPage);
  }, [list, query.isSuccess, totalCount]);

  const setPage = useCallback((page: number) => {
    clearBulkSelection();
    list.setPage(page);
  }, [clearBulkSelection, list]);
  const setPageSize = useCallback((pageSize: number) => {
    clearBulkSelection();
    list.setPageSize(pageSize);
  }, [clearBulkSelection, list]);
  const setSearchValue = useCallback((value: string) => {
    clearBulkSelection();
    list.setSearchValue(value);
  }, [clearBulkSelection, list]);
  const setSearchField = useCallback((value: AddressTypeListFilters["searchField"]) => {
    clearBulkSelection();
    list.setFilters({ ...list.state.filters, searchField: value });
  }, [clearBulkSelection, list]);
  const setSearchOperator = useCallback((value: AddressTypeListFilters["searchOperator"]) => {
    clearBulkSelection();
    list.setFilters({ ...list.state.filters, searchOperator: value });
  }, [clearBulkSelection, list]);
  const setSort = useCallback((column: AddressTypeSortColumn, direction: "ASC" | "DESC") => {
    clearBulkSelection();
    list.setSort(column, direction);
  }, [clearBulkSelection, list]);
  const setStatus = useCallback((status: AddressTypeListFilters["status"]) => {
    clearBulkSelection();
    list.setFilters({ ...list.state.filters, status });
  }, [clearBulkSelection, list]);
  const resetList = useCallback(() => {
    clearBulkSelection();
    list.reset();
  }, [clearBulkSelection, list]);
  const setSelectedAddressTypeIds = useCallback((ids: number[]) => {
    setSelectedIds(normalizeBulkSelection(ids, selectableIds, 100).ids);
  }, [selectableIds]);

  const onAdd = useCallback(() => {
    if (isReadOnly) notifyBlockedAction();
    else if (canRunAddressTypeAction("create", permissions)) {
      setSelectedItem(null);
      setDialogType("add");
    }
  }, [isReadOnly, notifyBlockedAction, permissions]);
  const onView = useCallback((item: AddressType) => {
    if (canRunAddressTypeAction("view", permissions, item)) {
      setSelectedItem(item);
      setDialogType("view");
    }
  }, [permissions]);
  const onEdit = useCallback((item: AddressType) => {
    if (isReadOnly) notifyBlockedAction();
    else if (canRunAddressTypeAction("edit", permissions, item)) {
      setSelectedItem(item);
      setDialogType("edit");
    }
  }, [isReadOnly, notifyBlockedAction, permissions]);
  const onDelete = useCallback((item: AddressType) => {
    if (isReadOnly) notifyBlockedAction();
    else if (canRunAddressTypeAction("archive", permissions, item)) setArchiveTarget(item);
  }, [isReadOnly, notifyBlockedAction, permissions]);
  const onRestore = useCallback(async (item: AddressType) => {
    if (isReadOnly) notifyBlockedAction();
    else if (canRunAddressTypeAction("restore", permissions, item)) await restore.mutateAsync(item.id);
  }, [isReadOnly, notifyBlockedAction, permissions, restore]);
  const save = useCallback(async (request: CreateAddressTypeRequest) => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (dialogType === "add" && canRunAddressTypeAction("create", permissions)) {
      await create.mutateAsync(request);
      setDialogType(null);
    } else if (dialogType === "edit" && selectedItem && canRunAddressTypeAction("edit", permissions, selectedItem)) {
      await update.mutateAsync({ ...request, id: selectedItem.id });
      setDialogType(null);
    }
  }, [create, dialogType, isReadOnly, notifyBlockedAction, permissions, selectedItem, update]);
  const confirmArchive = useCallback(async () => {
    if (!archiveTarget || isReadOnly) {
      if (isReadOnly) notifyBlockedAction();
      return;
    }
    await archive.mutateAsync(archiveTarget.id);
    setArchiveTarget(null);
    clearBulkSelection();
  }, [archive, archiveTarget, clearBulkSelection, isReadOnly, notifyBlockedAction]);
  const submitBulkArchive = useCallback(async () => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (!permissions.canDelete || selectedAddressTypeIds.length === 0) return;
    await bulkArchive.mutateAsync(selectedAddressTypeIds);
    clearBulkSelection();
  }, [bulkArchive, clearBulkSelection, isReadOnly, notifyBlockedAction, permissions.canDelete, selectedAddressTypeIds]);

  return {
    items, totalCount, loading: query.isLoading, isFetching: query.isFetching || list.isSearchPending, error: query.error,
    page: list.state.page, pageSize: list.state.pageSize, searchValue: list.state.searchValue,
    searchField: list.state.filters.searchField, searchOperator: list.state.filters.searchOperator,
    sortColumn: list.state.columnName, sortDirection: list.state.sortDirection, status: list.state.filters.status,
    permissions, selectedAddressTypeIds, dialogType, selectedItem, archiveTarget,
    setPage, setPageSize, setSearchValue, setSearchField, setSearchOperator, setSort, setStatus, resetList,
    setSelectedAddressTypeIds, onAdd, onView, onEdit, onDelete, onRestore, save,
    closeDialog: () => setDialogType(null), closeArchive: () => setArchiveTarget(null), confirmArchive, submitBulkArchive,
    refresh: () => query.refetch(), isSaving: create.isPending || update.isPending,
    isArchiving: archive.isPending, isBulkArchiving: bulkArchive.isPending,
  };
}

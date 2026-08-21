import { showToast } from "@/shared/components/feedback/transient";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";
import { useGridCrudController } from "@/shared/hooks/useGridCrudController";
import { useGridCrudMarkerCleanup } from "@/shared/hooks/useGridCrudMarkerCleanup";
import { getLastServerListPage, useServerListState } from "@/shared/hooks/useServerListState";
import { useStatesPermissions } from "@/shared/hooks/usePermissions";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { useGridApiRef, type GridApi } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import type {
  CreateStateRequest,
  StateListFilters,
  StateListItem,
  StateSearchField,
  StateSearchOperator,
  StateSortColumn,
  StateStatus,
} from "../types/State";
import { toStatePageQuery } from "../utils/statePageQuery";
import { canRunStateAction, type StatePermissionSet } from "../utils/statePermissions";
import {
  useArchiveState,
  useBulkArchiveStates,
  useCreateState,
  useRestoreState,
  useStatePage,
  useUpdateState,
} from "./useStateQueries";

type DialogType = "add" | "edit" | "view" | "delete" | null;
const defaultStateFilters: StateListFilters = {
  status: "active",
  searchField: "all",
  searchOperator: "contains",
};

export interface UseStateGridLogicReturn {
  dialogType: DialogType;
  selectedState: StateListItem | null;
  restoreState: StateListItem | null;
  selectedStateIds: number[];
  bulkArchiveOpen: boolean;
  loading: boolean;
  states: StateListItem[];
  totalCount: number;
  apiRef: RefObject<GridApi | null>;
  error: Error | null;
  isFetching: boolean;
  page: number;
  pageSize: number;
  searchValue: string;
  searchField: StateSearchField;
  searchOperator: StateSearchOperator;
  sortColumn: StateSortColumn;
  sortDirection: "ASC" | "DESC";
  filter: StateStatus;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearchValue: (value: string) => void;
  setSearchField: (value: StateSearchField) => void;
  setSearchOperator: (value: StateSearchOperator) => void;
  setSort: (column: StateSortColumn, direction: "ASC" | "DESC") => void;
  setFilter: (value: StateStatus) => void;
  resetList: () => void;
  closeDialog: () => void;
  handleFormSubmit: (request: CreateStateRequest) => Promise<void>;
  handleDelete: () => Promise<void>;
  setSelectedStateIds: (ids: number[]) => void;
  onBulkArchive: () => void;
  closeBulkArchive: () => void;
  handleBulkArchive: () => Promise<void>;
  handleRefresh: () => void;
  onEdit: (state: StateListItem) => void;
  onView: (state: StateListItem) => void;
  onDelete: (state: StateListItem) => void;
  onAdd: () => void;
  isCreating: boolean;
  isUpdating: boolean;
  isArchiving: boolean;
  isBulkArchiving: boolean;
  isRestoring: boolean;
  onRestore: (state: StateListItem) => void;
  closeRestore: () => void;
  handleRestore: () => Promise<void>;
  lastAddedId: string | number | null;
  lastEditedId: string | number | null;
  lastDeletedIndex: number | null;
  permissions: StatePermissionSet;
}

export default function useStateGridLogic(): UseStateGridLogicReturn {
  const { t } = useTranslation();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const authorization = useStatesPermissions();
  const [restoreState, setRestoreState] = useState<StateListItem | null>(null);
  const [selectionIds, setSelectionIds] = useState<number[]>([]);
  const [bulkArchiveOpen, setBulkArchiveOpen] = useState(false);
  const list = useServerListState<StateSortColumn, StateListFilters>({
    defaultColumn: "createdOn",
    defaultSortDirection: "DESC",
    defaultFilters: defaultStateFilters,
    defaultPageSize: 10,
  });
  const pageQuery = useMemo(
    () => toStatePageQuery(list.state, list.debouncedSearchValue),
    [list.debouncedSearchValue, list.state],
  );
  const query = useStatePage(pageQuery);
  const states = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const totalCount = query.data?.metaData.totalCount ?? 0;
  const apiRef = useGridApiRef();
  const permissions = useMemo<StatePermissionSet>(() => ({
    canView: authorization.canView,
    canCreate: authorization.canCreate && !isReadOnly,
    canEdit: authorization.canEdit && !isReadOnly,
    canDelete: authorization.canDelete && !isReadOnly,
    canRestore: authorization.canDelete && !isReadOnly,
  }), [authorization, isReadOnly]);

  useEffect(() => {
    if (!query.data) return;
    const lastPage = getLastServerListPage(totalCount, list.state.pageSize);
    if (list.state.page > lastPage) list.setPage(lastPage);
  }, [list, query.data, totalCount]);

  const selectableIds = useMemo(
    () => new Set(states.filter((state) => !state.isDeleted).map((state) => state.id)),
    [states],
  );
  const selectedStateIds = useMemo(
    () => permissions.canDelete ? selectionIds.filter((id) => selectableIds.has(id)) : [],
    [permissions.canDelete, selectableIds, selectionIds],
  );
  const clearBulkSelection = useCallback(() => {
    setSelectionIds([]);
    setBulkArchiveOpen(false);
  }, []);
  const setSelectedStateIds = useCallback((ids: number[]) => {
    setSelectionIds(ids.filter((id) => selectableIds.has(id)));
  }, [selectableIds]);
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
  const setSearchField = useCallback((searchField: StateSearchField) => {
    clearBulkSelection();
    list.setFilters({ ...list.state.filters, searchField });
  }, [clearBulkSelection, list]);
  const setSearchOperator = useCallback((searchOperator: StateSearchOperator) => {
    clearBulkSelection();
    list.setFilters({ ...list.state.filters, searchOperator });
  }, [clearBulkSelection, list]);
  const setSort = useCallback((column: StateSortColumn, direction: "ASC" | "DESC") => {
    clearBulkSelection();
    list.setSort(column, direction);
  }, [clearBulkSelection, list]);
  const setFilter = useCallback((status: StateStatus) => {
    clearBulkSelection();
    list.setFilters({ ...list.state.filters, status });
  }, [clearBulkSelection, list]);
  const resetList = useCallback(() => {
    clearBulkSelection();
    list.reset();
  }, [clearBulkSelection, list]);

  const createMutation = useCreateState({
    onSuccess: (state) => showToast.success(t("states.created", { name: state.nameEn })),
    onError: (error) => showToast.error(extractErrorMessage(error) || t("states.createError")),
  });
  const updateMutation = useUpdateState({
    onSuccess: (state) => showToast.success(t("states.updated", { name: state.nameEn })),
    onError: (error) => showToast.error(extractErrorMessage(error) || t("states.updateError")),
  });
  const archiveMutation = useArchiveState({
    onSuccess: () => showToast.success(t("states.archived")),
    onError: (error) => showToast.error(extractErrorMessage(error) || t("states.archiveError")),
  });
  const restoreMutation = useRestoreState({
    onSuccess: () => showToast.success(t("states.restored")),
    onError: (error) => showToast.error(extractErrorMessage(error) || t("states.restoreError")),
  });
  const bulkArchiveMutation = useBulkArchiveStates({
    onSuccess: (result) => showToast.success(t("states.bulkArchived", { count: result.archivedCount })),
    onError: (error) => showToast.error(extractErrorMessage(error) || t("states.bulkArchiveError")),
  });
  const crud = useGridCrudController<StateListItem, CreateStateRequest>({
    items: states,
    create: async (request) => ({ ...(await createMutation.mutateAsync(request)), districtsCount: 0 }),
    update: (id, request) => {
      const stateId = Number(id);
      if (!Number.isInteger(stateId)) return Promise.reject(new Error("Invalid state identifier."));
      return updateMutation.mutateAsync({ id: stateId, request }).then((state) => ({
        ...state,
        districtsCount: states.find((item) => item.id === stateId)?.districtsCount ?? 0,
      }));
    },
    remove: (id) => {
      const stateId = Number(id);
      return Number.isInteger(stateId)
        ? archiveMutation.mutateAsync(stateId)
        : Promise.reject(new Error("Invalid state identifier."));
    },
    refresh: () => query.refetch(),
  });
  useGridCrudMarkerCleanup({
    lastAddedId: crud.lastAddedId,
    lastEditedId: crud.lastEditedId,
    lastDeletedIndex: crud.lastDeletedIndex,
    clearLastAdded: crud.clearLastAdded,
    clearLastEdited: crud.clearLastEdited,
    clearLastDeleted: crud.clearLastDeleted,
  });

  const notifyPermissionDenied = useCallback(() => showToast.error(t("states.permissionDenied")), [t]);
  const onAdd = useCallback(() => {
    if (isReadOnly) notifyBlockedAction();
    else if (!canRunStateAction("create", permissions)) notifyPermissionDenied();
    else crud.onAdd();
  }, [crud, isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions]);
  const onEdit = useCallback((state: StateListItem) => {
    if (isReadOnly) notifyBlockedAction();
    else if (!canRunStateAction("edit", permissions, state)) notifyPermissionDenied();
    else crud.onEdit(state);
  }, [crud, isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions]);
  const onDelete = useCallback((state: StateListItem) => {
    if (isReadOnly) notifyBlockedAction();
    else if (!canRunStateAction("archive", permissions, state)) notifyPermissionDenied();
    else crud.onDelete(state);
  }, [crud, isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions]);
  const onView = useCallback((state: StateListItem) => {
    if (!canRunStateAction("view", permissions, state)) notifyPermissionDenied();
    else crud.onView(state);
  }, [crud, notifyPermissionDenied, permissions]);
  const handleFormSubmit = useCallback(async (request: CreateStateRequest) => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    const allowed = crud.dialogType === "add"
      ? canRunStateAction("create", permissions)
      : crud.dialogType === "edit" && canRunStateAction("edit", permissions, crud.selectedItem);
    if (!allowed) {
      notifyPermissionDenied();
      return;
    }
    await crud.handleFormSubmit(request);
  }, [crud, isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions]);
  const handleDelete = useCallback(async () => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (!canRunStateAction("archive", permissions, crud.selectedItem)) {
      notifyPermissionDenied();
      return;
    }
    await crud.handleDelete();
  }, [crud, isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions]);
  const onBulkArchive = useCallback(() => {
    if (isReadOnly) notifyBlockedAction();
    else if (!permissions.canDelete) notifyPermissionDenied();
    else if (selectedStateIds.length === 0) showToast.error(t("states.bulkArchiveSelectionRequired"));
    else setBulkArchiveOpen(true);
  }, [isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions.canDelete, selectedStateIds.length, t]);
  const closeBulkArchive = useCallback(() => {
    if (!bulkArchiveMutation.isPending) setBulkArchiveOpen(false);
  }, [bulkArchiveMutation.isPending]);
  const handleBulkArchive = useCallback(async () => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (!permissions.canDelete || selectedStateIds.length === 0) {
      notifyPermissionDenied();
      return;
    }
    try {
      await bulkArchiveMutation.mutateAsync(selectedStateIds);
      clearBulkSelection();
    } catch { /* mutation callback keeps the dialog visible with an actionable error */ }
  }, [bulkArchiveMutation, clearBulkSelection, isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions.canDelete, selectedStateIds]);
  const onRestore = useCallback((state: StateListItem) => {
    if (isReadOnly) notifyBlockedAction();
    else if (!canRunStateAction("restore", permissions, state)) notifyPermissionDenied();
    else setRestoreState(state);
  }, [isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions]);
  const closeRestore = useCallback(() => setRestoreState(null), []);
  const handleRestore = useCallback(async () => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (!restoreState || !canRunStateAction("restore", permissions, restoreState)) {
      notifyPermissionDenied();
      return;
    }
    try {
      await restoreMutation.mutateAsync(restoreState.id);
      closeRestore();
    } catch { /* mutation callback owns recoverable API feedback */ }
  }, [closeRestore, isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions, restoreMutation, restoreState]);

  return {
    dialogType: crud.dialogType, selectedState: crud.selectedItem, restoreState, selectedStateIds, bulkArchiveOpen,
    loading: query.isLoading, states, totalCount, apiRef, error: query.error,
    isFetching: query.isFetching || list.isSearchPending,
    page: list.state.page, pageSize: list.state.pageSize, searchValue: list.state.searchValue,
    searchField: list.state.filters.searchField ?? "all",
    searchOperator: list.state.filters.searchOperator ?? "contains",
    sortColumn: list.state.columnName, sortDirection: list.state.sortDirection, filter: list.state.filters.status,
    setPage, setPageSize, setSearchValue, setSearchField, setSearchOperator, setSort, setFilter, resetList,
    closeDialog: crud.closeDialog, handleFormSubmit, handleDelete, setSelectedStateIds,
    onBulkArchive, closeBulkArchive, handleBulkArchive, handleRefresh: crud.handleRefresh,
    onEdit, onView, onDelete, onAdd,
    isCreating: createMutation.isPending, isUpdating: updateMutation.isPending,
    isArchiving: archiveMutation.isPending, isBulkArchiving: bulkArchiveMutation.isPending,
    isRestoring: restoreMutation.isPending, onRestore, closeRestore, handleRestore,
    lastAddedId: crud.lastAddedId, lastEditedId: crud.lastEditedId, lastDeletedIndex: crud.lastDeletedIndex, permissions,
  };
}

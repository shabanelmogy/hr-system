import { showToast } from "@/shared/components/feedback/transient";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";
import { useGridCrudController } from "@/shared/hooks/useGridCrudController";
import { useGridCrudMarkerCleanup } from "@/shared/hooks/useGridCrudMarkerCleanup";
import { useAdaptivePagination } from "@/shared/hooks/useAdaptivePagination";
import { getLastServerListPage, useServerListState } from "@/shared/hooks/useServerListState";
import { useDistrictsPermissions } from "@/shared/hooks/usePermissions";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { normalizeBulkSelection } from "@/shared/utils/bulkSelection";
import { useGridApiRef, type GridApi } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { DISTRICT_BULK_ARCHIVE_LIMIT } from "../types/District";
import type {
  CreateDistrictRequest,
  DistrictListFilters,
  DistrictListItem,
  DistrictSearchField,
  DistrictSearchOperator,
  DistrictSortColumn,
  DistrictStatus,
} from "../types/District";
import { toDistrictPageQuery } from "../utils/districtPageQuery";
import { canRunDistrictAction, type DistrictPermissionSet } from "../utils/districtPermissions";
import {
  districtKeys,
  useArchiveDistrict,
  useBulkArchiveDistricts,
  useCreateDistrict,
  useRestoreDistrict,
  useUpdateDistrict,
} from "./useDistrictQueries";
import DistrictService from "../services/districtService";

type DialogType = "add" | "edit" | "view" | "delete" | null;
const defaultDistrictFilters: DistrictListFilters = {
  status: "active",
  searchField: "all",
  searchOperator: "contains",
};

export interface UseDistrictGridLogicReturn {
  dialogType: DialogType;
  selectedDistrict: DistrictListItem | null;
  restoreDistrict: DistrictListItem | null;
  selectedDistrictIds: number[];
  bulkArchiveOpen: boolean;
  loading: boolean;
  districts: DistrictListItem[];
  gridDistricts: DistrictListItem[];
  paginationMode: "client" | "server";
  totalCount: number;
  apiRef: RefObject<GridApi | null>;
  error: Error | null;
  isFetching: boolean;
  page: number;
  pageSize: number;
  searchValue: string;
  searchField: DistrictSearchField;
  searchOperator: DistrictSearchOperator;
  sortColumn: DistrictSortColumn;
  sortDirection: "ASC" | "DESC";
  filter: DistrictStatus;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearchValue: (value: string) => void;
  setSearchField: (value: DistrictSearchField) => void;
  setSearchOperator: (value: DistrictSearchOperator) => void;
  setSort: (column: DistrictSortColumn, direction: "ASC" | "DESC") => void;
  setFilter: (value: DistrictStatus) => void;
  resetList: () => void;
  closeDialog: () => void;
  handleFormSubmit: (request: CreateDistrictRequest) => Promise<void>;
  handleDelete: () => Promise<void>;
  setSelectedDistrictIds: (ids: number[]) => void;
  onBulkArchive: () => void;
  closeBulkArchive: () => void;
  handleBulkArchive: () => Promise<void>;
  handleRefresh: () => void;
  onEdit: (state: DistrictListItem) => void;
  onView: (state: DistrictListItem) => void;
  onDelete: (state: DistrictListItem) => void;
  onAdd: () => void;
  isCreating: boolean;
  isUpdating: boolean;
  isArchiving: boolean;
  isBulkArchiving: boolean;
  isRestoring: boolean;
  onRestore: (state: DistrictListItem) => void;
  closeRestore: () => void;
  handleRestore: () => Promise<void>;
  lastAddedId: string | number | null;
  lastEditedId: string | number | null;
  lastDeletedIndex: number | null;
  permissions: DistrictPermissionSet;
}

export default function useDistrictGridLogic(): UseDistrictGridLogicReturn {
  const { t } = useTranslation();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const authorization = useDistrictsPermissions();
  const [restoreDistrict, setRestoreDistrict] = useState<DistrictListItem | null>(null);
  const [selectionIds, setSelectionIds] = useState<number[]>([]);
  const [bulkArchiveOpen, setBulkArchiveOpen] = useState(false);
  const list = useServerListState<DistrictSortColumn, DistrictListFilters>({
    defaultColumn: "createdOn",
    defaultSortDirection: "DESC",
    defaultFilters: defaultDistrictFilters,
    defaultPageSize: 10,
  });
  const pageQuery = useMemo(
    () => toDistrictPageQuery(list.state, list.debouncedSearchValue),
    [list.debouncedSearchValue, list.state],
  );
  const adaptivePagination = useAdaptivePagination({
    query: pageQuery,
    queryKey: districtKeys.page,
    queryFn: DistrictService.getPage,
  });
  const districts = adaptivePagination.pageItems;
  const gridDistricts = adaptivePagination.allItems;
  const totalCount = adaptivePagination.totalCount;
  const apiRef = useGridApiRef();
  const permissions = useMemo<DistrictPermissionSet>(() => ({
    canView: authorization.canView,
    canCreate: authorization.canCreate && !isReadOnly,
    canEdit: authorization.canEdit && !isReadOnly,
    canDelete: authorization.canDelete && !isReadOnly,
    canRestore: authorization.canDelete && !isReadOnly,
  }), [authorization, isReadOnly]);

  useEffect(() => {
    if (!adaptivePagination.isReady) return;
    const lastPage = getLastServerListPage(totalCount, list.state.pageSize);
    if (list.state.page > lastPage) list.setPage(lastPage);
  }, [adaptivePagination.isReady, list, totalCount]);

  const selectableIds = useMemo(
    () => new Set(gridDistricts.filter((state) => !state.isDeleted).map((state) => state.id)),
    [gridDistricts],
  );
  const selectedDistrictIds = useMemo(
    () => permissions.canDelete ? selectionIds.filter((id) => selectableIds.has(id)) : [],
    [permissions.canDelete, selectableIds, selectionIds],
  );
  const clearBulkSelection = useCallback(() => {
    setSelectionIds([]);
    setBulkArchiveOpen(false);
  }, []);
  const setSelectedDistrictIds = useCallback((ids: number[]) => {
    const selection = normalizeBulkSelection(
      ids,
      selectableIds,
      DISTRICT_BULK_ARCHIVE_LIMIT,
    );
    if (selection.exceedsLimit) {
      showToast.error(t("districts.bulkArchiveLimitExceeded", {
        max: DISTRICT_BULK_ARCHIVE_LIMIT,
      }));
      return;
    }
    setSelectionIds(selection.ids);
  }, [selectableIds, t]);
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
  const setSearchField = useCallback((searchField: DistrictSearchField) => {
    clearBulkSelection();
    list.setFilters({ ...list.state.filters, searchField });
  }, [clearBulkSelection, list]);
  const setSearchOperator = useCallback((searchOperator: DistrictSearchOperator) => {
    clearBulkSelection();
    list.setFilters({ ...list.state.filters, searchOperator });
  }, [clearBulkSelection, list]);
  const setSort = useCallback((column: DistrictSortColumn, direction: "ASC" | "DESC") => {
    clearBulkSelection();
    list.setSort(column, direction);
  }, [clearBulkSelection, list]);
  const setFilter = useCallback((status: DistrictStatus) => {
    clearBulkSelection();
    list.setFilters({ ...list.state.filters, status });
  }, [clearBulkSelection, list]);
  const resetList = useCallback(() => {
    clearBulkSelection();
    list.reset();
  }, [clearBulkSelection, list]);

  const createMutation = useCreateDistrict({
    onSuccess: (state) => showToast.success(t("districts.created", { name: state.nameEn })),
    onError: (error) => showToast.error(extractErrorMessage(error) || t("districts.createError")),
  });
  const updateMutation = useUpdateDistrict({
    onSuccess: (state) => showToast.success(t("districts.updated", { name: state.nameEn })),
    onError: (error) => showToast.error(extractErrorMessage(error) || t("districts.updateError")),
  });
  const archiveMutation = useArchiveDistrict({
    onSuccess: () => showToast.success(t("districts.archived")),
    onError: (error) => showToast.error(extractErrorMessage(error) || t("districts.archiveError")),
  });
  const restoreMutation = useRestoreDistrict({
    onSuccess: () => showToast.success(t("districts.restored")),
    onError: (error) => showToast.error(extractErrorMessage(error) || t("districts.restoreError")),
  });
  const bulkArchiveMutation = useBulkArchiveDistricts({
    onSuccess: (result) => showToast.success(t("districts.bulkArchived", { count: result.archivedCount })),
    onError: (error) => showToast.error(extractErrorMessage(error) || t("districts.bulkArchiveError")),
  });
  const crud = useGridCrudController<DistrictListItem, CreateDistrictRequest>({
    items: gridDistricts,
    create: async (request) => ({ ...(await createMutation.mutateAsync(request)), addressesCount: 0 }),
    update: (id, request) => {
      const districtId = Number(id);
      if (!Number.isInteger(districtId)) return Promise.reject(new Error("Invalid district identifier."));
      return updateMutation.mutateAsync({ id: districtId, request }).then((state) => ({
        ...state,
        addressesCount: gridDistricts.find((item) => item.id === districtId)?.addressesCount ?? 0,
      }));
    },
    remove: (id) => {
      const districtId = Number(id);
      return Number.isInteger(districtId)
        ? archiveMutation.mutateAsync(districtId)
        : Promise.reject(new Error("Invalid district identifier."));
    },
    refresh: adaptivePagination.refetch,
  });
  useGridCrudMarkerCleanup({
    lastAddedId: crud.lastAddedId,
    lastEditedId: crud.lastEditedId,
    lastDeletedIndex: crud.lastDeletedIndex,
    clearLastAdded: crud.clearLastAdded,
    clearLastEdited: crud.clearLastEdited,
    clearLastDeleted: crud.clearLastDeleted,
  });

  const notifyPermissionDenied = useCallback(() => showToast.error(t("districts.permissionDenied")), [t]);
  const onAdd = useCallback(() => {
    if (isReadOnly) notifyBlockedAction();
    else if (!canRunDistrictAction("create", permissions)) notifyPermissionDenied();
    else crud.onAdd();
  }, [crud, isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions]);
  const onEdit = useCallback((state: DistrictListItem) => {
    if (isReadOnly) notifyBlockedAction();
    else if (!canRunDistrictAction("edit", permissions, state)) notifyPermissionDenied();
    else crud.onEdit(state);
  }, [crud, isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions]);
  const onDelete = useCallback((state: DistrictListItem) => {
    if (isReadOnly) notifyBlockedAction();
    else if (!canRunDistrictAction("archive", permissions, state)) notifyPermissionDenied();
    else crud.onDelete(state);
  }, [crud, isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions]);
  const onView = useCallback((state: DistrictListItem) => {
    if (!canRunDistrictAction("view", permissions, state)) notifyPermissionDenied();
    else crud.onView(state);
  }, [crud, notifyPermissionDenied, permissions]);
  const handleFormSubmit = useCallback(async (request: CreateDistrictRequest) => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    const allowed = crud.dialogType === "add"
      ? canRunDistrictAction("create", permissions)
      : crud.dialogType === "edit" && canRunDistrictAction("edit", permissions, crud.selectedItem);
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
    if (!canRunDistrictAction("archive", permissions, crud.selectedItem)) {
      notifyPermissionDenied();
      return;
    }
    await crud.handleDelete();
  }, [crud, isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions]);
  const onBulkArchive = useCallback(() => {
    if (isReadOnly) notifyBlockedAction();
    else if (!permissions.canDelete) notifyPermissionDenied();
    else if (selectedDistrictIds.length === 0) showToast.error(t("districts.bulkArchiveSelectionRequired"));
    else if (selectedDistrictIds.length > DISTRICT_BULK_ARCHIVE_LIMIT) {
      showToast.error(t("districts.bulkArchiveLimitExceeded", {
        max: DISTRICT_BULK_ARCHIVE_LIMIT,
      }));
    }
    else setBulkArchiveOpen(true);
  }, [isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions.canDelete, selectedDistrictIds.length, t]);
  const closeBulkArchive = useCallback(() => {
    if (!bulkArchiveMutation.isPending) setBulkArchiveOpen(false);
  }, [bulkArchiveMutation.isPending]);
  const handleBulkArchive = useCallback(async () => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (!permissions.canDelete || selectedDistrictIds.length === 0) {
      notifyPermissionDenied();
      return;
    }
    if (selectedDistrictIds.length > DISTRICT_BULK_ARCHIVE_LIMIT) {
      showToast.error(t("districts.bulkArchiveLimitExceeded", {
        max: DISTRICT_BULK_ARCHIVE_LIMIT,
      }));
      return;
    }
    try {
      await bulkArchiveMutation.mutateAsync(selectedDistrictIds);
      clearBulkSelection();
    } catch { /* mutation callback keeps the dialog visible with an actionable error */ }
  }, [bulkArchiveMutation, clearBulkSelection, isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions.canDelete, selectedDistrictIds, t]);
  const onRestore = useCallback((state: DistrictListItem) => {
    if (isReadOnly) notifyBlockedAction();
    else if (!canRunDistrictAction("restore", permissions, state)) notifyPermissionDenied();
    else setRestoreDistrict(state);
  }, [isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions]);
  const closeRestore = useCallback(() => setRestoreDistrict(null), []);
  const handleRestore = useCallback(async () => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (!restoreDistrict || !canRunDistrictAction("restore", permissions, restoreDistrict)) {
      notifyPermissionDenied();
      return;
    }
    try {
      await restoreMutation.mutateAsync(restoreDistrict.id);
      closeRestore();
    } catch { /* mutation callback owns recoverable API feedback */ }
  }, [closeRestore, isReadOnly, notifyBlockedAction, notifyPermissionDenied, permissions, restoreMutation, restoreDistrict]);

  return {
    dialogType: crud.dialogType, selectedDistrict: crud.selectedItem, restoreDistrict, selectedDistrictIds, bulkArchiveOpen,
    loading: adaptivePagination.isLoading, districts, gridDistricts,
    paginationMode: adaptivePagination.mode,
    totalCount, apiRef, error: adaptivePagination.error,
    isFetching: adaptivePagination.isFetching || list.isSearchPending,
    page: list.state.page, pageSize: list.state.pageSize, searchValue: list.state.searchValue,
    searchField: list.state.filters.searchField ?? "all",
    searchOperator: list.state.filters.searchOperator ?? "contains",
    sortColumn: list.state.columnName, sortDirection: list.state.sortDirection, filter: list.state.filters.status,
    setPage, setPageSize, setSearchValue, setSearchField, setSearchOperator, setSort, setFilter, resetList,
    closeDialog: crud.closeDialog, handleFormSubmit, handleDelete, setSelectedDistrictIds,
    onBulkArchive, closeBulkArchive, handleBulkArchive, handleRefresh: crud.handleRefresh,
    onEdit, onView, onDelete, onAdd,
    isCreating: createMutation.isPending, isUpdating: updateMutation.isPending,
    isArchiving: archiveMutation.isPending, isBulkArchiving: bulkArchiveMutation.isPending,
    isRestoring: restoreMutation.isPending, onRestore, closeRestore, handleRestore,
    lastAddedId: crud.lastAddedId, lastEditedId: crud.lastEditedId, lastDeletedIndex: crud.lastDeletedIndex, permissions,
  };
}

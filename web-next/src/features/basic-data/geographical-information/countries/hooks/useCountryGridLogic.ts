import { showToast } from "@/shared/components/feedback/transient";
import { useGridCrudController } from "@/shared/hooks/useGridCrudController";
import { useGridCrudMarkerCleanup } from "@/shared/hooks/useGridCrudMarkerCleanup";
import {
  getLastServerListPage,
  useServerListState,
} from "@/shared/hooks/useServerListState";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";
import { useCountriesPermissions } from "@/shared/hooks/usePermissions";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { useGridApiRef, type GridApi } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import type {
  CountryListItem,
  CountryListFilters,
  CountryStatus,
  CountrySortColumn,
  CreateCountryRequest,
} from "../types/Country";
import { toCountryPageQuery } from "../utils/countryPageQuery";
import {
  canRunCountryAction,
  type CountryPermissionSet,
} from "../utils/countryPermissions";
import {
  useArchiveCountry,
  useCountryPage,
  useCreateCountry,
  useRestoreCountry,
  useUpdateCountry,
} from "./useCountryQueries";

type DialogType = "add" | "edit" | "view" | "delete" | null;
export type CountryFilter = CountryStatus;

const defaultCountryFilters: CountryListFilters = { status: "active" };

export interface UseCountryGridLogicReturn {
  dialogType: DialogType;
  selectedCountry: CountryListItem | null;
  restoreCountry: CountryListItem | null;
  loading: boolean;
  countries: CountryListItem[];
  totalCount: number;
  apiRef: RefObject<GridApi | null>;
  error: Error | null;
  isFetching: boolean;
  page: number;
  pageSize: number;
  searchValue: string;
  sortColumn: CountrySortColumn;
  sortDirection: "ASC" | "DESC";
  filter: CountryFilter;
  currencyCode: string;
  hasStatesFilter: "all" | "with" | "without";
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearchValue: (value: string) => void;
  setSort: (column: CountrySortColumn, direction: "ASC" | "DESC") => void;
  setFilter: (filter: CountryFilter) => void;
  setCurrencyCode: (currencyCode: string) => void;
  setHasStatesFilter: (filter: "all" | "with" | "without") => void;
  resetList: () => void;
  closeDialog: () => void;
  handleFormSubmit: (formdata: CreateCountryRequest) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleRefresh: () => void;
  onEdit: (country: CountryListItem) => void;
  onView: (country: CountryListItem) => void;
  onDelete: (country: CountryListItem) => void;
  onAdd: () => void;
  isCreating: boolean;
  isUpdating: boolean;
  isArchiving: boolean;
  isRestoring: boolean;
  onRestore: (country: CountryListItem) => void;
  closeRestore: () => void;
  handleRestore: () => Promise<void>;
  lastAddedId: string | number | null;
  lastEditedId: string | number | null;
  lastDeletedIndex: number | null;
  permissions: CountryPermissionSet;
}

export default function useCountryGridLogic(): UseCountryGridLogicReturn {
  const { t } = useTranslation();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const authorization = useCountriesPermissions();
  const [restoreCountry, setRestoreCountry] = useState<CountryListItem | null>(null);
  const list = useServerListState<CountrySortColumn, CountryListFilters>({
    defaultColumn: "createdOn",
    defaultSortDirection: "DESC",
    defaultFilters: defaultCountryFilters,
    defaultPageSize: 10,
  });
  const countryQuery = useMemo(
    () => toCountryPageQuery(list.state, list.debouncedSearchValue),
    [list.debouncedSearchValue, list.state],
  );
  const query = useCountryPage(countryQuery);
  const countries = query.data?.items ?? [];
  const totalCount = query.data?.metaData.totalCount ?? 0;
  const apiRef = useGridApiRef();
  const currentPage = list.state.page;
  const currentPageSize = list.state.pageSize;
  const setListPage = list.setPage;
  const permissions = useMemo<CountryPermissionSet>(() => ({
    canView: authorization.canView,
    canCreate: authorization.canCreate && !isReadOnly,
    canEdit: authorization.canEdit && !isReadOnly,
    canDelete: authorization.canDelete && !isReadOnly,
    canRestore: authorization.canRestore && !isReadOnly,
  }), [authorization, isReadOnly]);

  useEffect(() => {
    if (!query.data) return;
    const lastPage = getLastServerListPage(totalCount, currentPageSize);
    if (currentPage > lastPage) setListPage(lastPage);
  }, [currentPage, currentPageSize, query.data, setListPage, totalCount]);

  const createMutation = useCreateCountry({
    onSuccess: (country) => showToast.success(
      t("countries.created", { name: country.nameEn, defaultValue: `Country "${country.nameEn}" created successfully` }),
    ),
    onError: (error) => showToast.error(
      extractErrorMessage(error) || t("countries.createError", { defaultValue: "Failed to create country" }),
    ),
  });
  const updateMutation = useUpdateCountry({
    onSuccess: (country) => showToast.success(
      t("countries.updated", { name: country.nameEn, defaultValue: `Country "${country.nameEn}" updated successfully` }),
    ),
    onError: (error) => showToast.error(
      extractErrorMessage(error) || t("countries.updateError", { defaultValue: "Failed to update country" }),
    ),
  });
  const archiveMutation = useArchiveCountry({
    onSuccess: () => showToast.success(t("countries.archived")),
    onError: (error) => showToast.error(
      extractErrorMessage(error) || t("countries.deleteError", { defaultValue: "Failed to archive country" }),
    ),
  });
  const restoreMutation = useRestoreCountry({
    onSuccess: () => showToast.success(t("countries.restored")),
    onError: (error) => showToast.error(
      extractErrorMessage(error) || t("countries.restoreError", { defaultValue: "Failed to restore country" }),
    ),
  });

  const crud = useGridCrudController<CountryListItem, CreateCountryRequest>({
    items: countries,
    create: async (request) => ({
      ...(await createMutation.mutateAsync(request)),
      statesCount: 0,
    }),
    update: (id, request) => {
      const countryId = Number(id);
      if (!Number.isInteger(countryId)) {
        return Promise.reject(new Error("Invalid country identifier."));
      }
      return updateMutation.mutateAsync({ id: countryId, request }).then((country) => ({
        ...country,
        statesCount: countries.find((item) => item.id === countryId)?.statesCount ?? 0,
      }));
    },
    remove: (id) => {
      const countryId = Number(id);
      if (!Number.isInteger(countryId)) {
        return Promise.reject(new Error("Invalid country identifier."));
      }
      return archiveMutation.mutateAsync(countryId);
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

  const notifyPermissionDenied = useCallback(() => {
    showToast.error(t("countries.permissionDenied"));
  }, [t]);

  const onAdd = useCallback(() => {
    if (isReadOnly) notifyBlockedAction();
    else if (!canRunCountryAction("create", authorization)) notifyPermissionDenied();
    else crud.onAdd();
  }, [authorization, crud, isReadOnly, notifyBlockedAction, notifyPermissionDenied]);

  const onEdit = useCallback((country: CountryListItem) => {
    if (isReadOnly) notifyBlockedAction();
    else if (!canRunCountryAction("edit", authorization, country)) notifyPermissionDenied();
    else crud.onEdit(country);
  }, [authorization, crud, isReadOnly, notifyBlockedAction, notifyPermissionDenied]);

  const onDelete = useCallback((country: CountryListItem) => {
    if (isReadOnly) notifyBlockedAction();
    else if (!canRunCountryAction("archive", authorization, country)) notifyPermissionDenied();
    else crud.onDelete(country);
  }, [authorization, crud, isReadOnly, notifyBlockedAction, notifyPermissionDenied]);

  const onView = useCallback((country: CountryListItem) => {
    if (!canRunCountryAction("view", authorization, country)) notifyPermissionDenied();
    else crud.onView(country);
  }, [authorization, crud, notifyPermissionDenied]);

  const handleFormSubmit = useCallback(async (request: CreateCountryRequest) => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    const allowed = crud.dialogType === "add"
      ? canRunCountryAction("create", authorization)
      : crud.dialogType === "edit" && canRunCountryAction("edit", authorization, crud.selectedItem);
    if (!allowed) {
      notifyPermissionDenied();
      return;
    }
    await crud.handleFormSubmit(request);
  }, [authorization, crud, isReadOnly, notifyBlockedAction, notifyPermissionDenied]);

  const handleDelete = useCallback(async () => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (!canRunCountryAction("archive", authorization, crud.selectedItem)) {
      notifyPermissionDenied();
      return;
    }
    await crud.handleDelete();
  }, [authorization, crud, isReadOnly, notifyBlockedAction, notifyPermissionDenied]);

  const onRestore = useCallback((country: CountryListItem) => {
    if (isReadOnly) notifyBlockedAction();
    else if (!canRunCountryAction("restore", authorization, country)) notifyPermissionDenied();
    else setRestoreCountry(country);
  }, [authorization, isReadOnly, notifyBlockedAction, notifyPermissionDenied]);

  const closeRestore = useCallback(() => setRestoreCountry(null), []);
  const handleRestore = useCallback(async () => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (!restoreCountry || !canRunCountryAction("restore", authorization, restoreCountry)) {
      notifyPermissionDenied();
      return;
    }
    try {
      await restoreMutation.mutateAsync(restoreCountry.id);
      closeRestore();
    } catch {
      // The mutation callback owns user-facing API errors.
    }
  }, [authorization, closeRestore, isReadOnly, notifyBlockedAction, notifyPermissionDenied, restoreCountry, restoreMutation]);

  return {
    dialogType: crud.dialogType,
    selectedCountry: crud.selectedItem,
    restoreCountry,
    loading: query.isLoading,
    countries,
    totalCount,
    apiRef,
    error: query.error,
    isFetching: query.isFetching || list.isSearchPending,
    page: list.state.page,
    pageSize: list.state.pageSize,
    searchValue: list.state.searchValue,
    sortColumn: list.state.columnName,
    sortDirection: list.state.sortDirection,
    filter: list.state.filters.status,
    currencyCode: list.state.filters.currencyCode ?? "",
    hasStatesFilter: list.state.filters.hasStates === undefined
      ? "all"
      : list.state.filters.hasStates ? "with" : "without",
    setPage: list.setPage,
    setPageSize: list.setPageSize,
    setSearchValue: list.setSearchValue,
    setSort: list.setSort,
    setFilter: (status) => list.setFilters({ ...list.state.filters, status }),
    setCurrencyCode: (currencyCode) => list.setFilters({
      ...list.state.filters,
      currencyCode: currencyCode || undefined,
    }),
    setHasStatesFilter: (nextFilter) => list.setFilters({
      ...list.state.filters,
      hasStates: nextFilter === "all" ? undefined : nextFilter === "with",
    }),
    resetList: list.reset,
    closeDialog: crud.closeDialog,
    handleFormSubmit,
    handleDelete,
    handleRefresh: crud.handleRefresh,
    onEdit,
    onView,
    onDelete,
    onAdd,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isArchiving: archiveMutation.isPending,
    isRestoring: restoreMutation.isPending,
    onRestore,
    closeRestore,
    handleRestore,
    lastAddedId: crud.lastAddedId,
    lastEditedId: crud.lastEditedId,
    lastDeletedIndex: crud.lastDeletedIndex,
    permissions,
  };
}

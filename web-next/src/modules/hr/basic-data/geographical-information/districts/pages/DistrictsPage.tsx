"use client";

import { Alert, Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import DistrictArchiveDialog from "../components/DistrictArchiveDialog";
import DistrictBulkArchiveDialog from "../components/DistrictBulkArchiveDialog";
import DistrictForm from "../components/DistrictForm";
import DistrictRestoreDialog from "../components/DistrictRestoreDialog";
import DistrictsMultiView from "../components/DistrictsMultiView";
import useDistrictGridLogic from "../hooks/useDistrictGridLogic";
import { useDistrict } from "../hooks/useDistrictQueries";

const DistrictsPage = () => {
  const { t } = useTranslation();
  const logic = useDistrictGridLogic();
  const formDialogType = logic.dialogType === "add" || logic.dialogType === "edit" || logic.dialogType === "view" ? logic.dialogType : null;
  const details = useDistrict(logic.selectedDistrict?.id, { enabled: formDialogType === "edit" || formDialogType === "view" });
  const formDistrict = details.data ?? logic.selectedDistrict;
  if (logic.error) return <Box sx={{ p: 3 }}><Alert severity="error" action={<Button color="inherit" size="small" onClick={logic.handleRefresh}>{t("common.retry")}</Button>}>{extractErrorMessage(logic.error) || t("districts.fetchError")}</Alert></Box>;
  return <>
    <DistrictsMultiView districts={logic.districts} gridDistricts={logic.gridDistricts} paginationMode={logic.paginationMode} loading={logic.loading} isFetching={logic.isFetching} apiRef={logic.apiRef} onEdit={logic.onEdit} onDelete={logic.onDelete} onRestore={logic.onRestore} onView={logic.onView} onAdd={logic.onAdd} onRefresh={logic.handleRefresh} permissions={logic.permissions} totalCount={logic.totalCount} page={logic.page} pageSize={logic.pageSize} searchValue={logic.searchValue} searchField={logic.searchField} searchOperator={logic.searchOperator} sortColumn={logic.sortColumn} sortDirection={logic.sortDirection} filter={logic.filter} onPageChange={logic.setPage} onPageSizeChange={logic.setPageSize} onSearchChange={logic.setSearchValue} onSearchFieldChange={logic.setSearchField} onSearchOperatorChange={logic.setSearchOperator} onSortChange={logic.setSort} onFilterChange={logic.setFilter} onResetList={logic.resetList} selectedDistrictIds={logic.selectedDistrictIds} onSelectedDistrictIdsChange={logic.setSelectedDistrictIds} onBulkArchive={logic.onBulkArchive} isBulkArchiving={logic.isBulkArchiving} lastAddedId={logic.lastAddedId} lastEditedId={logic.lastEditedId} />
    {formDialogType ? <DistrictForm open dialogType={formDialogType} selectedDistrict={formDistrict} onClose={logic.closeDialog} onSubmit={logic.handleFormSubmit} loading={logic.isCreating || logic.isUpdating || details.isLoading} detailError={details.error ? extractErrorMessage(details.error) : undefined} onRetryDetails={() => void details.refetch()} /> : null}
    <DistrictArchiveDialog open={logic.dialogType === "delete"} selectedDistrict={logic.selectedDistrict} loading={logic.isArchiving} onClose={logic.closeDialog} onConfirm={logic.handleDelete} />
    <DistrictRestoreDialog state={logic.restoreDistrict} loading={logic.isRestoring} onClose={logic.closeRestore} onConfirm={() => void logic.handleRestore()} />
    <DistrictBulkArchiveDialog open={logic.bulkArchiveOpen} selectedCount={logic.selectedDistrictIds.length} loading={logic.isBulkArchiving} onClose={logic.closeBulkArchive} onConfirm={logic.handleBulkArchive} />
  </>;
};

export default DistrictsPage;

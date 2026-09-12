"use client";

import { Alert, Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import StateArchiveDialog from "../components/StateArchiveDialog";
import StateBulkArchiveDialog from "../components/StateBulkArchiveDialog";
import StateForm from "../components/StateForm";
import StateRestoreDialog from "../components/StateRestoreDialog";
import StatesMultiView from "../components/StatesMultiView";
import useStateGridLogic from "../hooks/useStateGridLogic";
import { useState } from "../hooks/useStateQueries";

const StatesPage = () => {
  const { t } = useTranslation();
  const logic = useStateGridLogic();
  const formDialogType = logic.dialogType === "add" || logic.dialogType === "edit" || logic.dialogType === "view" ? logic.dialogType : null;
  const details = useState(logic.selectedState?.id, { enabled: formDialogType === "edit" || formDialogType === "view" });
  const formState = details.data ?? logic.selectedState;
  if (logic.error) return <Box sx={{ p: 3 }}><Alert severity="error" action={<Button color="inherit" size="small" onClick={logic.handleRefresh}>{t("common.retry")}</Button>}>{extractErrorMessage(logic.error) || t("states.fetchError")}</Alert></Box>;
  return <>
    <StatesMultiView states={logic.states} gridStates={logic.gridStates} paginationMode={logic.paginationMode} loading={logic.loading} isFetching={logic.isFetching} apiRef={logic.apiRef} onEdit={logic.onEdit} onDelete={logic.onDelete} onRestore={logic.onRestore} onView={logic.onView} onAdd={logic.onAdd} onRefresh={logic.handleRefresh} permissions={logic.permissions} totalCount={logic.totalCount} page={logic.page} pageSize={logic.pageSize} searchValue={logic.searchValue} searchField={logic.searchField} searchOperator={logic.searchOperator} sortColumn={logic.sortColumn} sortDirection={logic.sortDirection} filter={logic.filter} onPageChange={logic.setPage} onPageSizeChange={logic.setPageSize} onSearchChange={logic.setSearchValue} onSearchFieldChange={logic.setSearchField} onSearchOperatorChange={logic.setSearchOperator} onSortChange={logic.setSort} onFilterChange={logic.setFilter} onResetList={logic.resetList} selectedStateIds={logic.selectedStateIds} onSelectedStateIdsChange={logic.setSelectedStateIds} onBulkArchive={logic.onBulkArchive} isBulkArchiving={logic.isBulkArchiving} lastAddedId={logic.lastAddedId} lastEditedId={logic.lastEditedId} lastDeletedIndex={logic.lastDeletedIndex} />
    {formDialogType ? <StateForm open dialogType={formDialogType} selectedState={formState} onClose={logic.closeDialog} onSubmit={logic.handleFormSubmit} loading={logic.isCreating || logic.isUpdating || details.isLoading} detailError={details.error ? extractErrorMessage(details.error) : undefined} onRetryDetails={() => void details.refetch()} /> : null}
    <StateArchiveDialog open={logic.dialogType === "delete"} selectedState={logic.selectedState} loading={logic.isArchiving} onClose={logic.closeDialog} onConfirm={logic.handleDelete} />
    <StateRestoreDialog state={logic.restoreState} loading={logic.isRestoring} onClose={logic.closeRestore} onConfirm={() => void logic.handleRestore()} />
    <StateBulkArchiveDialog open={logic.bulkArchiveOpen} selectedCount={logic.selectedStateIds.length} loading={logic.isBulkArchiving} onClose={logic.closeBulkArchive} onConfirm={logic.handleBulkArchive} />
  </>;
};

export default StatesPage;

"use client";

import { Alert, Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import AddressTypeDeleteDialog from "../components/AddressTypeDeleteDialog";
import AddressTypeForm from "../components/AddressTypeForm";
import AddressTypesMultiView from "../components/AddressTypesMultiView";
import useAddressTypeGridLogic from "../hooks/useAddressTypeGridLogic";

/** Thin feature composition, matching the States page ownership boundary. */
export default function AddressTypesPage() {
  const { t } = useTranslation();
  const logic = useAddressTypeGridLogic();
  if (logic.error) return <Box sx={{ p: 3 }}><Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void logic.refresh()}>{t("common.retry")}</Button>}>{extractErrorMessage(logic.error) || t("addressTypes.fetchError")}</Alert></Box>;
  return <>
    <AddressTypesMultiView
      items={logic.items}
      loading={logic.loading}
      isFetching={logic.isFetching}
      error={logic.error}
      totalCount={logic.totalCount}
      page={logic.page}
      pageSize={logic.pageSize}
      searchValue={logic.searchValue}
      searchField={logic.searchField}
      searchOperator={logic.searchOperator}
      sortColumn={logic.sortColumn}
      sortDirection={logic.sortDirection}
      status={logic.status}
      permissions={logic.permissions}
      selectedIds={logic.selectedAddressTypeIds}
      onAdd={logic.onAdd}
      onEdit={logic.onEdit}
      onDelete={logic.onDelete}
      onRestore={logic.onRestore}
      onView={logic.onView}
      onRefresh={() => void logic.refresh()}
      onPageChange={logic.setPage}
      onPageSizeChange={logic.setPageSize}
      onSearchChange={logic.setSearchValue}
      onSearchFieldChange={logic.setSearchField}
      onSearchOperatorChange={logic.setSearchOperator}
      onSortChange={logic.setSort}
      onStatusChange={logic.setStatus}
      onReset={logic.resetList}
      onSelectedIdsChange={logic.setSelectedAddressTypeIds}
      onBulkArchive={() => void logic.submitBulkArchive()}
      isBulkArchiving={logic.isBulkArchiving}
    />
    {logic.dialogType ? <AddressTypeForm open dialogType={logic.dialogType} selectedItem={logic.selectedItem} onClose={logic.closeDialog} onSubmit={logic.save} loading={logic.isSaving} /> : null}
    <AddressTypeDeleteDialog open={logic.archiveTarget !== null} selectedItem={logic.archiveTarget} onClose={logic.closeArchive} onConfirm={logic.confirmArchive} loading={logic.isArchiving} />
  </>;
}

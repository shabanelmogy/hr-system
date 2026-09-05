import React, { useMemo } from "react";
import { ListItemIcon, ListItemText, MenuItem, Radio } from "@mui/material";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { MyDataGrid } from "@/shared/components/data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";
import { useTranslation } from "react-i18next";
import { organizationalResourceSupportsParent, type OrganizationalResource, type OrganizationalSearchField, type OrganizationalSearchOperator, type OrganizationalStatus, type OrganizationalStructureItem } from "../../types/OrganizationalStructure";
import { makeOrganizationalStructureActions } from "./GridActions";
import { useOrganizationalStructureColumns } from "./Columns";

interface Props {
  resource: OrganizationalResource;
  items: OrganizationalStructureItem[];
  loading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  status: OrganizationalStatus;
  sortBy: "nameEn" | "nameAr" | "code" | "parent" | "createdOn";
  sortDirection: "asc" | "desc";
  searchField: OrganizationalSearchField;
  searchOperator: OrganizationalSearchOperator;
  permissions: { canCreate: boolean; canEdit: boolean; canDelete: boolean; canApprove: boolean };
  language: "ar" | "en";
  showFilterBar: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (search: string) => void;
  onSearchFieldChange: (field: OrganizationalSearchField) => void;
  onSearchOperatorChange: (operator: OrganizationalSearchOperator) => void;
  onStatusChange: (status: OrganizationalStatus) => void;
  onSortChange: (sortBy: Props["sortBy"], direction: Props["sortDirection"]) => void;
  onReset: () => void;
  onView: (item: OrganizationalStructureItem) => void;
  onEdit: (item: OrganizationalStructureItem) => void;
  onLifecycle: (item: OrganizationalStructureItem) => void;
  onApprove: (item: OrganizationalStructureItem) => void;
  onReject: (item: OrganizationalStructureItem) => void;
  onViewLogs?: (item: OrganizationalStructureItem) => void;
}

const operators: OrganizationalSearchOperator[] = ["contains", "doesNotContain", "equals", "doesNotEqual", "startsWith", "endsWith"];

export default function OrganizationalStructureDataGrid(props: Props) {
  const { t } = useTranslation();
  const getActions = useMemo(() => makeOrganizationalStructureActions({ t, resource: props.resource, canEdit: props.permissions.canEdit, canDelete: props.permissions.canDelete, canApprove: props.permissions.canApprove, onView: props.onView, onEdit: props.onEdit, onLifecycle: props.onLifecycle, onApprove: props.onApprove, onReject: props.onReject, onViewLogs: props.onViewLogs }), [props.onApprove, props.onEdit, props.onLifecycle, props.onReject, props.onView, props.onViewLogs, props.permissions.canApprove, props.permissions.canDelete, props.permissions.canEdit, props.resource, t]);
  const columns = useMemo(
    () => useOrganizationalStructureColumns({ t, resource: props.resource, language: props.language, getActions, onView: props.onView }),
    [getActions, props.language, props.onView, props.resource, t],
  );
  const statusOptions: OrganizationalStatus[] = props.resource === "job-descriptions" ? ["active", "archived", "all", "draft", "approved", "rejected", "expired"] : ["active", "archived", "all"];
  const searchOptions = [
    { value: "all", label: t("organizationalStructure.allColumns") },
    { value: "nameAr", label: t("organizationalStructure.fields.nameAr") },
    { value: "nameEn", label: t("organizationalStructure.fields.nameEn") },
    { value: "code", label: t("organizationalStructure.fields.code") },
    ...(organizationalResourceSupportsParent(props.resource) ? [{ value: "parent", label: t("organizationalStructure.fields.parent") }] : []),
  ];
  const handlePagination = (model: GridPaginationModel) => model.pageSize !== props.pageSize ? props.onPageSizeChange(model.pageSize) : props.onPageChange(model.page);
  const handleSort = (model: GridSortModel) => {
    const next = model[0];
    if (next?.sort && (["nameEn", "nameAr", "code", "createdOn"].includes(next.field) || (next.field === "parent" && organizationalResourceSupportsParent(props.resource)))) props.onSortChange(next.field as Props["sortBy"], next.sort);
  };

  return (
    <ContentWrapper>
      <MyDataGrid
        rows={props.items}
        columns={columns}
        getRowId={(row) => row.id}
        loading={props.loading}
        onRowDoubleClick={(params) => props.onView(params.row)}
        filterMode="server"
        sortingMode="server"
        sortModel={[{ field: props.sortBy, sort: props.sortDirection }]}
        onSortModelChange={handleSort}
        pagination
        paginationMode="server"
        paginationModel={{ page: props.page, pageSize: props.pageSize }}
        onPaginationModelChange={handlePagination}
        rowCount={props.totalCount}
        pageSizeOptions={[5, 10, 25, 50]}
        showToolbar={props.showFilterBar}
        showGridOptions
        toolbarSearch={{
          value: props.search,
          placeholder: t("organizationalStructure.search"),
          onChange: props.onSearchChange,
          onClear: () => props.onSearchChange(""),
          column: { label: t("organizationalStructure.searchColumn"), value: props.searchField, onChange: (value) => props.onSearchFieldChange(value as OrganizationalSearchField), options: searchOptions },
          operator: { label: t("organizationalStructure.searchCondition"), value: props.searchOperator, onChange: (value) => props.onSearchOperatorChange(value as OrganizationalSearchOperator), options: operators.map((value) => ({ value, label: t(`organizationalStructure.${value}`) })) },
        }}
        toolbarContent={<ResetButton onReset={props.onReset} fullWidth={false} height={40} />}
        gridOptionsContent={(closeMenu) => <>
          <MenuItem disabled><ListItemText primary={t("organizationalStructure.fields.status")} /></MenuItem>
          {statusOptions.map((value) => <MenuItem key={value} selected={props.status === value} onClick={() => { closeMenu(); props.onStatusChange(value); }}><ListItemIcon><Radio checked={props.status === value} size="small" /></ListItemIcon><ListItemText primary={t(`organizationalStructure.status.${value}`)} /></MenuItem>)}
        </>}
        checkboxSelection={false}
        autoSelectFirstRow={false}
        localeText={{ noRowsLabel: t("organizationalStructure.empty") }}
      />
    </ContentWrapper>
  );
}

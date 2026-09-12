import EditIcon from "@mui/icons-material/Edit";
import { Chip } from "@mui/material";
import {
  GridActionsCellItem,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from "@mui/x-data-grid";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { MyDataGrid, renderDate } from "@/shared/components/data-grid";
import { ContentWrapper } from "@/shared/components/layout";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";
import type {
  SubscriptionStatus,
  TenantManagementResponse,
  TenantSortColumn,
} from "../types";

interface TenantsDataGridProps {
  tenants: TenantManagementResponse[];
  loading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  searchValue: string;
  sortColumn: TenantSortColumn;
  sortDirection: "ASC" | "DESC";
  showFilterBar: boolean;
  onEdit: (tenant: TenantManagementResponse) => void;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  onPaginationChange: (model: GridPaginationModel) => void;
  onSortChange: (model: GridSortModel) => void;
}

export default function TenantsDataGrid({
  tenants,
  loading,
  page,
  pageSize,
  totalCount,
  searchValue,
  sortColumn,
  sortDirection,
  showFilterBar,
  onEdit,
  onSearchChange,
  onReset,
  onPaginationChange,
  onSortChange,
}: TenantsDataGridProps) {
  const { t } = useTranslation();
  const columns = useMemo<GridColDef<TenantManagementResponse>[]>(() => [
    {
      field: "identifier",
      headerName: t("tenantManagement.identifier"),
      flex: 1,
      minWidth: 140,
    },
    {
      field: "name",
      headerName: t("tenantManagement.name"),
      flex: 1.3,
      minWidth: 180,
    },
    {
      field: "planName",
      headerName: t("tenantManagement.plan"),
      flex: 0.9,
      minWidth: 120,
      sortable: false,
      valueFormatter: (value) => value || t("tenantManagement.noPlan"),
    },
    {
      field: "subscriptionStatus",
      headerName: t("tenantManagement.status"),
      flex: 0.95,
      minWidth: 135,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: ({ value }) => (
        <Chip
          size="small"
          color={getStatusColor(value as SubscriptionStatus)}
          label={t(`tenantManagement.statuses.${String(value)}`)}
        />
      ),
    },
    {
      field: "adminCount",
      headerName: t("tenantManagement.admins"),
      flex: 0.75,
      minWidth: 105,
      sortable: false,
      align: "center",
      headerAlign: "center",
      valueGetter: (_value, row) => `${row.adminCount}/${row.maxAdmins}`,
    },
    {
      field: "userCount",
      headerName: t("tenantManagement.users"),
      flex: 0.75,
      minWidth: 105,
      sortable: false,
      align: "center",
      headerAlign: "center",
      valueGetter: (_value, row) => `${row.userCount}/${row.maxUsers}`,
    },
    {
      field: "companyCount",
      headerName: t("tenantManagement.companies"),
      flex: 0.75,
      minWidth: 110,
      sortable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "isActive",
      headerName: t("tenantManagement.accessStatus"),
      flex: 0.8,
      minWidth: 115,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: ({ value }) => (
        <Chip
          size="small"
          color={value ? "success" : "default"}
          variant="outlined"
          label={value ? t("tenantManagement.enabled") : t("tenantManagement.disabled")}
        />
      ),
    },
    {
      field: "createdOn",
      headerName: t("general.createdOn"),
      flex: 1,
      minWidth: 145,
      align: "center",
      headerAlign: "center",
      valueFormatter: renderDate,
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("actions.buttons"),
      flex: 0.55,
      minWidth: 90,
      sortable: false,
      align: "center",
      headerAlign: "center",
      getActions: ({ row }) => [
        <GridActionsCellItem
          key={`edit-${row.id}`}
          icon={<EditIcon color="primary" />}
          label={t("actions.edit")}
          onClick={() => onEdit(row)}
        />,
      ],
    },
  ], [onEdit, t]);

  return (
    <ContentWrapper fillAvailable>
      <MyDataGrid
        rows={tenants}
        columns={columns}
        loading={loading}
        filterMode="server"
        sortingMode="server"
        sortModel={[{ field: sortColumn, sort: sortDirection.toLowerCase() as "asc" | "desc" }]}
        onSortModelChange={onSortChange}
        pagination
        paginationMode="server"
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={onPaginationChange}
        rowCount={totalCount}
        pageSizeOptions={[5, 10, 25, 50]}
        checkboxSelection={false}
        autoSelectFirstRow={false}
        showToolbar={showFilterBar}
        showGridOptions
        toolbarSearch={{
          value: searchValue,
          placeholder: t("tenantManagement.searchPlaceholder"),
          onChange: onSearchChange,
          onClear: () => onSearchChange(""),
        }}
        toolbarContent={<ResetButton onReset={onReset} fullWidth={false} height={40} />}
      />
    </ContentWrapper>
  );
}

function getStatusColor(
  status: SubscriptionStatus,
): "default" | "success" | "warning" | "error" | "info" {
  if (status === "active") return "success";
  if (status === "trial") return "info";
  if (status === "pastDue") return "warning";
  if (status === "suspended" || status === "expired" || status === "cancelled") return "error";
  return "default";
}

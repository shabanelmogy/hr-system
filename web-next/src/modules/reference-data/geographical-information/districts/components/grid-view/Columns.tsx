import React from "react";
import { LocationOn } from "@mui/icons-material";
import { AppChip } from "@/shared/components/cards";
import { renderCode, renderDate } from "@/shared/components/data-grid";
import type { GridActionsCellItemProps, GridColDef } from "@mui/x-data-grid";
import type { DistrictListItem } from "../../types/District";
import type { DistrictPermissionSet } from "../../utils/districtPermissions";
import { renderStateName } from "./DistrictCellRenderers";

interface ColumnsFactoryProps {
  t: (key: string) => string;
  permissions: DistrictPermissionSet;
  getActions: (params: { row: DistrictListItem }) => React.ReactElement<GridActionsCellItemProps>[];
}

export const useDistrictColumns = ({ t, permissions, getActions }: ColumnsFactoryProps): GridColDef[] => {
  const columns: GridColDef[] = [
    { field: "id", headerName: t("general.id"), flex: 0.45, align: "center", headerAlign: "center", sortable: false },
    { field: "nameAr", headerName: t("general.nameAr"), flex: 1.15, align: "center", headerAlign: "center", renderCell: renderStateName(true) },
    { field: "nameEn", headerName: t("general.nameEn"), flex: 1.15, align: "center", headerAlign: "center", renderCell: renderStateName(false) },
    { field: "code", headerName: t("districts.code"), flex: 0.75, align: "center", headerAlign: "center", renderCell: renderCode },
    {
      field: "state", headerName: t("districts.state"), flex: 1.2, align: "center", headerAlign: "center",
      renderCell: ({ row }) => <AppChip icon={<LocationOn sx={{ fontSize: 14 }} />} label={row.state.nameEn || row.state.nameAr} colorKey="primary" variant="outlined" size="small" />,
    },
    {
      field: "addressesCount", headerName: t("districts.addresses"), flex: 0.75, align: "center", headerAlign: "center", sortable: false,
      renderCell: ({ value }) => <AppChip label={String(value ?? 0)} colorKey={Number(value) > 0 ? "success" : "secondary"} variant="outlined" size="small" />,
    },
    { field: "createdOn", headerName: t("general.createdOn"), flex: 1, align: "center", headerAlign: "center", valueFormatter: renderDate },
    { field: "updatedOn", headerName: t("general.updatedOn"), flex: 1, align: "center", headerAlign: "center", sortable: false, valueFormatter: renderDate },
    {
      field: "isDeleted", headerName: t("districts.status.label"), flex: 0.8, align: "center", headerAlign: "center", sortable: false,
      renderCell: ({ value }) => <AppChip label={value ? t("districts.status.archived") : t("districts.status.active")} colorKey={value ? "error" : "success"} variant="soft" size="small" />,
    },
  ];
  if (permissions.canView || permissions.canEdit || permissions.canDelete || permissions.canRestore) {
    columns.push({ field: "actions", type: "actions", headerName: t("actions.buttons"), flex: 0.9, align: "center", headerAlign: "center", sortable: false, getActions });
  }
  return columns;
};

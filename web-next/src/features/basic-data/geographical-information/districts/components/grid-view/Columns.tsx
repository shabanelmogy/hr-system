import React from "react";
import { GridActionsCellItemProps, GridColDef } from "@mui/x-data-grid";
import { renderCode, renderDate } from "@/shared/components/data-grid";
import { useTranslation } from "react-i18next";
import type { District } from "../../types/District";
import { useTheme } from "@mui/material";

export interface ColumnsFactoryProps {
  permissions: { canView: boolean; canEdit: boolean; canDelete: boolean };
  getActions: (params: {
    row: District;
  }) => React.ReactElement<GridActionsCellItemProps>[];
}

export const useDistrictColumns = ({
  permissions,
  getActions,
}: ColumnsFactoryProps): GridColDef[] => {
  const { t } = useTranslation();
  const theme = useTheme();
  const baseColumns: GridColDef[] = [
    {
      field: "id",
      headerName: t("general.id"),
      flex: 0.5,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "nameAr",
      headerName: t("general.nameAr"),
      flex: 1.2,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div style={{ fontWeight: 500, textAlign: "center" }}>
          {params.row?.nameAr || "-"}
        </div>
      ),
    },
    {
      field: "nameEn",
      headerName: t("general.nameEn"),
      flex: 1.5,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div style={{ fontWeight: 500, textAlign: "center" }}>
          {params.row?.nameEn || "-"}
        </div>
      ),
    },
    {
      field: "code",
      headerName: t("districts.code") || "Code",
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      renderCell: renderCode,
    },
    {
      field: "state",
      headerName: t("districts.state") || "State",
      flex: 1.5,
      align: "center",
      headerAlign: "center",
      valueGetter: (state: District["state"]) => {
        if (!state) return "";
        return theme.direction === "rtl" ? state.nameAr || state.nameEn || "" : state.nameEn || state.nameAr || "";
      },
      sortable: false,
    },
    {
      field: "createdOn",
      headerName: t("general.createdOn"),
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: renderDate,
    },
    {
      field: "updatedOn",
      headerName: t("general.updatedOn"),
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: renderDate,
    },
  ];

  if (permissions.canView || permissions.canEdit || permissions.canDelete) {
    baseColumns.push({
      field: "actions",
      type: "actions",
      headerName: t("actions.buttons"),
      flex: 1,
      align: "center",
      headerAlign: "center",
      getActions,
    });
  }

  return baseColumns;
};

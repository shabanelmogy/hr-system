import React from "react";
import { GridActionsCellItemProps, GridColDef } from "@mui/x-data-grid";
import { renderCode, renderDate } from "@/shared/components/data-grid";
import { useTranslation } from "react-i18next";
import type { State } from "../../types/State";
import { renderCountryInfo } from "../../../countries/components/grid-view/CountryCellRenderers";
import { renderStateName } from "./StateCellRenderers";

export interface ColumnsFactoryProps {
  permissions: { canView: boolean; canEdit: boolean; canDelete: boolean };
  getActions: (params: { row: State }) => React.ReactElement<GridActionsCellItemProps>[];
}

export const useStateColumns = ({ permissions, getActions }: ColumnsFactoryProps): GridColDef[] => {
  const { t } = useTranslation();
  const baseColumns: GridColDef[] = [
    {
      field: "id",
      headerName: t("general.id"),
      flex: 0.5,
      align: "center",
      headerAlign: "center"
    },
    {
      field: "nameAr",
      headerName: t("general.nameAr"),
      flex: 1.2,
      align: "center",
      headerAlign: "center",
      renderCell: renderStateName(true),
    },
    {
      field: "nameEn",
      headerName: t("general.nameEn"),
      flex: 1.5,
      align: "center",
      headerAlign: "center",
      renderCell: renderStateName(false),
    },
    {
      field: "code",
      headerName: t("states.code"),
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      renderCell: renderCode,
    },
    {
      field: "country",
      headerName: t("states.country"),
      flex: 1.5,
      align: "center",
      headerAlign: "center",
      renderCell: renderCountryInfo,
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

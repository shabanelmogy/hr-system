import React from "react";
import { LocationOn } from "@mui/icons-material";
import { GridColDef, GridActionsCellItemProps } from "@mui/x-data-grid";
import { renderCode, renderDate } from "@/shared/components/data-grid";
import { AppChip } from "@/shared/components/cards";
import type { CountryListItem } from "../../types/Country";
import {
  renderCountryName,
  renderCurrencyCode,
  renderPhoneCode,
} from "./CountryCellRenderers";

export interface ColumnsFactoryProps {
  t: (key: string) => string;
  permissions: { canView: boolean; canEdit: boolean; canDelete: boolean; canRestore: boolean };
  getActions: (params: { row: CountryListItem }) => React.ReactElement<GridActionsCellItemProps>[];
}

export const useCountryColumns = ({ t, permissions, getActions }: ColumnsFactoryProps): GridColDef[] => {
  const baseColumns: GridColDef[] = [
    {
      field: "id",
      headerName: t("general.id"),
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "nameAr",
      headerName: t("general.nameAr"),
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderCell: renderCountryName(true),
    },
    {
      field: "nameEn",
      headerName: t("general.nameEn"),
      flex: 1.5,
      align: "center",
      headerAlign: "center",
      renderCell: renderCountryName(true),
    },
    {
      field: "alpha2Code",
      headerName: t("countries.alpha2Code"),
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      renderCell: renderCode,
    },
    {
      field: "alpha3Code",
      headerName: t("countries.alpha3Code"),
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      renderCell: renderCode,
    },
    {
      field: "phoneCode",
      headerName: t("countries.phoneCode"),
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: renderPhoneCode,
    },
    {
      field: "currencyCode",
      headerName: t("countries.currencyCode"),
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      renderCell: renderCurrencyCode,
    },
    {
      field: "statesCount",
      headerName: t("countries.states"),
      flex: 1.2,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: ({ value }) => (
        <AppChip
          icon={<LocationOn sx={{ fontSize: 14 }} />}
          label={String(value ?? 0)}
          colorKey={Number(value) > 0 ? "success" : "secondary"}
          variant="outlined"
          size="small"
        />
      ),
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
      sortable: false,
      valueFormatter: renderDate,
    },
    {
      field: "isDeleted",
      headerName: t("countries.status.label"),
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: ({ value }) => (
        <AppChip
          label={value ? t("countries.status.archived") : t("countries.status.active")}
          colorKey={value ? "error" : "success"}
          variant="soft"
          size="small"
        />
      ),
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
      sortable: false,
      getActions,
    });
  }

  return baseColumns;
};

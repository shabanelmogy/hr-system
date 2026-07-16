import React from "react";
import { LocationOn } from "@mui/icons-material";
import { useTheme } from "@mui/material";
import { GridColDef, GridActionsCellItemProps } from "@mui/x-data-grid";
import { renderCode, renderDate, renderList } from "@/shared/components/data-grid";
import type { Country } from "../../types/Country";
import {
  renderCountryName,
  renderCurrencyCode,
  renderPhoneCode,
} from "./CountryCellRenderers";

export interface ColumnsFactoryProps {
  t: (key: string) => string;
  permissions: { canView: boolean; canEdit: boolean; canDelete: boolean };
  getActions: (params: { row: Country }) => React.ReactElement<GridActionsCellItemProps>[];
}

export const useCountryColumns = ({ t, permissions, getActions }: ColumnsFactoryProps): GridColDef[] => {
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
      field: "states",
      headerName: t("countries.states") || "States",
      flex: 1.2,
      align: "center",
      headerAlign: "center",
      sortable: false,
      valueGetter: (value: Country["states"]) => {
        return Array.isArray(value)
          ? value
              .filter((state) => !state.isDeleted)
              .map((state) =>
                theme.direction === "rtl" ? state.nameAr : state.nameEn
              )
          : [];
      },
      renderCell: renderList({
        displayType: "chips",
        maxItems: 2,
        defaultColor: "primary",
        variant: "outlined",
        size: "small",
        showCount: true,
        emptyText: t("countries.noStates") || "No states",
        chipProps: {
          icon: <LocationOn sx={{ fontSize: 14 }} />,
          sx: { fontSize: "0.75rem" },
        },
      }),
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

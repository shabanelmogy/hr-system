import { GridColDef, GridActionsCellItemProps } from "@mui/x-data-grid";
import { renderDate } from "@/shared/components/common/datagrid/DataGridCellRenderers";
import { useTranslation } from "react-i18next";
import type { AddressType } from "../../types/AddressType";

export interface AddressTypeColumnsFactoryProps {
  permissions: { canView: boolean; canEdit: boolean; canDelete: boolean };
  getActions: (params: { row: AddressType }) => React.ReactElement<GridActionsCellItemProps>[];
}

export const useAddressTypeColumns = ({ permissions, getActions }: AddressTypeColumnsFactoryProps): GridColDef[] => {
  const { t } = useTranslation();
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
    },
    {
      field: "nameEn",
      headerName: t("general.nameEn"),
      flex: 1.5,
      align: "center",
      headerAlign: "center",
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

import { LocationOn } from "@mui/icons-material";
import { type GridActionsCellItemProps, type GridColDef } from "@mui/x-data-grid";
import { AppChip } from "@/shared/components/cards";
import { renderDate } from "@/shared/components/data-grid";
import type { AddressType } from "../../types/AddressType";
import type { AddressTypePermissionSet } from "../../utils/addressTypePermissions";

interface AddressTypeColumnsProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  permissions: AddressTypePermissionSet;
  getActions: (params: { row: AddressType }) => React.ReactElement<GridActionsCellItemProps>[];
}

export const useAddressTypeColumns = ({ t, permissions, getActions }: AddressTypeColumnsProps): GridColDef[] => {
  const columns: GridColDef[] = [
    { field: "id", headerName: t("general.id"), flex: 0.45, align: "center", headerAlign: "center", sortable: false },
    { field: "nameAr", headerName: t("general.nameAr"), flex: 1.2, align: "center", headerAlign: "center" },
    { field: "nameEn", headerName: t("general.nameEn"), flex: 1.4, align: "center", headerAlign: "center" },
    { field: "addressesCount", headerName: t("addressTypes.addresses"), flex: 0.85, align: "center", headerAlign: "center", sortable: false, renderCell: ({ value }) => <AppChip icon={<LocationOn sx={{ fontSize: 14 }} />} label={String(value ?? 0)} colorKey={Number(value) > 0 ? "success" : "secondary"} variant="outlined" size="small" /> },
    { field: "createdOn", headerName: t("general.createdOn"), flex: 0.9, align: "center", headerAlign: "center", valueFormatter: renderDate },
    { field: "updatedOn", headerName: t("general.updatedOn"), flex: 0.9, align: "center", headerAlign: "center", sortable: false, valueFormatter: renderDate },
    { field: "isDeleted", headerName: t("addressTypes.status.label"), flex: 0.75, align: "center", headerAlign: "center", sortable: false, renderCell: ({ value }) => <AppChip label={value ? t("addressTypes.status.archived") : t("addressTypes.status.active")} colorKey={value ? "error" : "success"} variant="soft" size="small" /> },
  ];
  if (permissions.canView || permissions.canEdit || permissions.canDelete || permissions.canRestore) columns.push({ field: "actions", type: "actions", headerName: t("actions.buttons"), flex: 0.9, align: "center", headerAlign: "center", sortable: false, getActions });
  return columns;
};

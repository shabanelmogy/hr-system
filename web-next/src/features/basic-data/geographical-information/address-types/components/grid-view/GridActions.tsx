import { Archive, Edit, Restore, Visibility } from "@mui/icons-material";
import { GridActionsCellItem, type GridActionsCellItemProps } from "@mui/x-data-grid";
import type { AddressType } from "../../types/AddressType";
import type { AddressTypePermissionSet } from "../../utils/addressTypePermissions";

interface AddressTypeActionFactoryProps {
  t: (key: string) => string;
  permissions: AddressTypePermissionSet;
  onView: (item: AddressType) => void;
  onEdit: (item: AddressType) => void;
  onDelete: (item: AddressType) => void;
  onRestore: (item: AddressType) => void;
}

export const makeAddressTypeActions = ({ t, permissions, onView, onEdit, onDelete, onRestore }: AddressTypeActionFactoryProps) =>
  ({ row }: { row: AddressType }): React.ReactElement<GridActionsCellItemProps>[] => {
    const actions: React.ReactElement<GridActionsCellItemProps>[] = [];
    if (permissions.canView) actions.push(<GridActionsCellItem key={`view-${row.id}`} icon={<Visibility sx={{ color: "info.main" }} />} label={t("actions.view")} onClick={() => onView(row)} />);
    if (permissions.canEdit && !row.isDeleted) actions.push(<GridActionsCellItem key={`edit-${row.id}`} icon={<Edit />} label={t("actions.edit")} color="primary" onClick={() => onEdit(row)} />);
    if (permissions.canDelete && !row.isDeleted) actions.push(<GridActionsCellItem key={`archive-${row.id}`} icon={<Archive sx={{ color: "warning.main" }} />} label={t("actions.archive")} onClick={() => onDelete(row)} />);
    if (permissions.canRestore && row.isDeleted) actions.push(<GridActionsCellItem key={`restore-${row.id}`} icon={<Restore sx={{ color: "success.main" }} />} label={t("actions.restore")} onClick={() => onRestore(row)} />);
    return actions;
  };

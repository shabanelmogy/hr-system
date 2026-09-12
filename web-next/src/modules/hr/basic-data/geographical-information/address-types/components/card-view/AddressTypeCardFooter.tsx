import { Archive, Edit, Restore, Visibility } from "@mui/icons-material";
import { CardActionButtons, type CardActionItem } from "@/shared/components/cards";
import type { AddressType } from "../../types/AddressType";
import type { AddressTypePermissionSet } from "../../utils/addressTypePermissions";

export default function AddressTypeCardFooter({ addressType, onView, onEdit, onDelete, onRestore, permissions, t }: { addressType: AddressType; onView: (item: AddressType) => void; onEdit: (item: AddressType) => void; onDelete: (item: AddressType) => void; onRestore: (item: AddressType) => void; permissions: AddressTypePermissionSet; t: (key: string) => string }) {
  const actions: CardActionItem[] = [];
  if (permissions.canView) actions.push({ key: "view", title: t("actions.view"), color: "info", icon: <Visibility sx={{ fontSize: 16 }} />, onClick: () => onView(addressType) });
  if (permissions.canEdit && !addressType.isDeleted) actions.push({ key: "edit", title: t("actions.edit"), color: "primary", icon: <Edit sx={{ fontSize: 16 }} />, onClick: () => onEdit(addressType) });
  if (permissions.canDelete && !addressType.isDeleted) actions.push({ key: "archive", title: t("actions.archive"), color: "warning", icon: <Archive sx={{ fontSize: 16 }} />, onClick: () => onDelete(addressType) });
  if (permissions.canRestore && addressType.isDeleted) actions.push({ key: "restore", title: t("actions.restore"), color: "success", icon: <Restore sx={{ fontSize: 16 }} />, onClick: () => onRestore(addressType) });
  return <CardActionButtons actions={actions} />;
}

import type { AddressType } from "../types/AddressType";

export interface AddressTypePermissionSet {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
}

export type AddressTypeAction = "view" | "create" | "edit" | "archive" | "restore";

export function canRunAddressTypeAction(
  action: AddressTypeAction,
  permissions: AddressTypePermissionSet,
  item?: Pick<AddressType, "isDeleted"> | null,
) {
  switch (action) {
    case "view": return permissions.canView;
    case "create": return permissions.canCreate;
    case "edit": return permissions.canEdit && item?.isDeleted === false;
    case "archive": return permissions.canDelete && item?.isDeleted === false;
    case "restore": return permissions.canRestore && item?.isDeleted === true;
  }
}

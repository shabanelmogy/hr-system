import type { DistrictListItem } from "../types/District";

export interface DistrictPermissionSet {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
}

export type DistrictAction = "view" | "create" | "edit" | "archive" | "restore";

export function canRunDistrictAction(
  action: DistrictAction,
  permissions: DistrictPermissionSet,
  district?: Pick<DistrictListItem, "isDeleted"> | null,
) {
  switch (action) {
    case "view": return permissions.canView;
    case "create": return permissions.canCreate;
    case "edit": return permissions.canEdit && district?.isDeleted === false;
    case "archive": return permissions.canDelete && district?.isDeleted === false;
    case "restore": return permissions.canRestore && district?.isDeleted === true;
  }
}

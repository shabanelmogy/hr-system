import type { StateListItem } from "../types/State";

export interface StatePermissionSet {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
}

export type StateAction = "view" | "create" | "edit" | "archive" | "restore";

export function canRunStateAction(
  action: StateAction,
  permissions: StatePermissionSet,
  state?: Pick<StateListItem, "isDeleted"> | null,
) {
  switch (action) {
    case "view": return permissions.canView;
    case "create": return permissions.canCreate;
    case "edit": return permissions.canEdit && state?.isDeleted === false;
    case "archive": return permissions.canDelete && state?.isDeleted === false;
    case "restore": return permissions.canRestore && state?.isDeleted === true;
  }
}

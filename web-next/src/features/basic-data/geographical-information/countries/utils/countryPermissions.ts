import type { CountryListItem } from "../types/Country";

export interface CountryPermissionSet {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
}

export type CountryAction = "view" | "create" | "edit" | "archive" | "restore";

export function canRunCountryAction(
  action: CountryAction,
  permissions: CountryPermissionSet,
  country?: Pick<CountryListItem, "isDeleted"> | null,
) {
  switch (action) {
    case "view":
      return permissions.canView;
    case "create":
      return permissions.canCreate;
    case "edit":
      return permissions.canEdit && country?.isDeleted === false;
    case "archive":
      return permissions.canDelete && country?.isDeleted === false;
    case "restore":
      return permissions.canRestore && country?.isDeleted === true;
  }
}


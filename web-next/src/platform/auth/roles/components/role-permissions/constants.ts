import { getAllPermissionModules } from "@/lib/auth/permissions";
import type { Theme } from "@mui/material/styles";

export const ROLE_MODULES = getAllPermissionModules();
export const PERMISSION_TYPES = ["View", "Create", "Edit", "Delete"] as const;

export type PermissionType = (typeof PERMISSION_TYPES)[number];

export function getPermissionColors(theme: Theme): Record<PermissionType, string> {
  return {
    View: theme.palette.success.main,
    Create: theme.palette.info.main,
    Edit: theme.palette.warning.main,
    Delete: theme.palette.error.main,
  };
}

import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { createColoredIcon, createNavItem, createNavSection } from "@/shared/components/layout/navigation";
const workforcePlanningViewPermissions = [
  permissions.ViewWorkforcePlans,
  permissions.ViewWorkforceBudgets,
  permissions.ViewPositionEnvelopes,
  permissions.ViewStaffingRequests,
  permissions.ViewEnvelopeAmendments,
  permissions.ViewWorkforceTrace,
];

export const getWorkforcePlanningConfig = () => createNavSection(
  "workforcePlanning",
  "menu.workforcePlanning",
  createColoredIcon(<AccountTreeRoundedIcon />, "#2e7d32"),
  [createNavItem(
    "menu.workforcePlanning",
    createColoredIcon(<AccountTreeRoundedIcon />, "#388e3c"),
    appRoutes.workforcePlanning.index,
    undefined,
    workforcePlanningViewPermissions,
  )],
  undefined,
  workforcePlanningViewPermissions,
);

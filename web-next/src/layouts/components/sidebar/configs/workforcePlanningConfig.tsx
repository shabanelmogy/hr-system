import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { createColoredIcon, createNavItem, createNavSection } from "../navigationUtils";
import { NavigationColors, NavigationSectionId, NavigationTitles } from "../navigationTypes";

const workforcePlanningViewPermissions = [
  permissions.ViewWorkforcePlans,
  permissions.ViewWorkforceBudgets,
  permissions.ViewPositionEnvelopes,
  permissions.ViewStaffingRequests,
  permissions.ViewEnvelopeAmendments,
  permissions.ViewWorkforceTrace,
];

export const getWorkforcePlanningConfig = () => createNavSection(
  NavigationSectionId.WORKFORCE_PLANNING,
  NavigationTitles.WORKFORCE_PLANNING,
  createColoredIcon(<AccountTreeRoundedIcon />, NavigationColors.GREEN),
  [createNavItem(
    NavigationTitles.WORKFORCE_PLANNING,
    createColoredIcon(<AccountTreeRoundedIcon />, NavigationColors.LIGHT_GREEN),
    appRoutes.workforcePlanning.index,
    undefined,
    workforcePlanningViewPermissions,
  )],
  undefined,
  workforcePlanningViewPermissions,
);

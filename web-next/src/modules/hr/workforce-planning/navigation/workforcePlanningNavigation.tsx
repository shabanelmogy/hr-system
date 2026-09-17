import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import AllInboxRoundedIcon from "@mui/icons-material/AllInboxRounded";
import AddBoxRoundedIcon from "@mui/icons-material/AddBoxRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import type { ReactNode } from "react";
import { appRoutes, type AppPath } from "@/config/routes";
import { isAuthorized } from "@/lib/auth/authorization";
import { permissions, type PermissionString } from "@/lib/auth/permissions";
import type { SessionClaims } from "@/lib/auth/session";

export interface WorkforcePlanningNavigationItem {
  id: string;
  titleKey: string;
  descriptionKey?: string;
  href?: AppPath;
  icon: ReactNode;
  permissions: readonly PermissionString[];
  children?: readonly WorkforcePlanningNavigationItem[];
}

const view = (permission: PermissionString) => [permission] as const;

const planningItems: readonly WorkforcePlanningNavigationItem[] = [
  {
    id: "workforce-plans",
    titleKey: "menu.workforcePlans",
    descriptionKey: "menu.workforcePlansDescription",
    href: appRoutes.modules.hr.workforcePlanning.plans,
    icon: <AccountTreeRoundedIcon fontSize="small" />,
    permissions: view(permissions.ViewWorkforcePlans),
  },
  {
    id: "workforce-budgets",
    titleKey: "menu.workforceBudgets",
    descriptionKey: "menu.workforceBudgetsDescription",
    href: appRoutes.modules.hr.workforcePlanning.budgets,
    icon: <RequestQuoteRoundedIcon fontSize="small" />,
    permissions: view(permissions.ViewWorkforceBudgets),
  },
];

const capacityItems: readonly WorkforcePlanningNavigationItem[] = [
  {
    id: "position-envelopes",
    titleKey: "menu.authorizedPositionCapacity",
    descriptionKey: "menu.positionEnvelopesDescription",
    href: appRoutes.modules.hr.workforcePlanning.positionEnvelopes,
    icon: <AllInboxRoundedIcon fontSize="small" />,
    permissions: view(permissions.ViewPositionEnvelopes),
  },
  {
    id: "staffing-requests",
    titleKey: "menu.staffingRequests",
    descriptionKey: "menu.staffingRequestsDescription",
    href: appRoutes.modules.hr.workforcePlanning.staffingRequests,
    icon: <PersonAddAltRoundedIcon fontSize="small" />,
    permissions: view(permissions.ViewStaffingRequests),
  },
  {
    id: "envelope-amendments",
    titleKey: "menu.capacityAmendments",
    descriptionKey: "menu.envelopeAmendmentsDescription",
    href: appRoutes.modules.hr.workforcePlanning.envelopeAmendments,
    icon: <AddBoxRoundedIcon fontSize="small" />,
    permissions: view(permissions.ViewEnvelopeAmendments),
  },
];

const monitoringItems: readonly WorkforcePlanningNavigationItem[] = [
  {
    id: "workforce-trace",
    titleKey: "menu.planningTraceCommitments",
    descriptionKey: "menu.workforceTraceDescription",
    href: appRoutes.modules.hr.workforcePlanning.trace,
    icon: <TimelineRoundedIcon fontSize="small" />,
    permissions: view(permissions.ViewWorkforceTrace),
  },
];

export const getWorkforcePlanningNavigation = (): readonly WorkforcePlanningNavigationItem[] => [
  {
    id: "planning-approval",
    titleKey: "workforcePlanning.navigation.planningApproval",
    descriptionKey: "workforcePlanning.navigation.planningApprovalDescription",
    icon: <AssessmentRoundedIcon fontSize="small" />,
    permissions: [],
    children: planningItems,
  },
  {
    id: "capacity-demand",
    titleKey: "workforcePlanning.navigation.capacityDemand",
    descriptionKey: "workforcePlanning.navigation.capacityDemandDescription",
    icon: <AllInboxRoundedIcon fontSize="small" />,
    permissions: [],
    children: capacityItems,
  },
  {
    id: "monitoring-analysis",
    titleKey: "workforcePlanning.navigation.monitoringAnalysis",
    descriptionKey: "workforcePlanning.navigation.monitoringAnalysisDescription",
    icon: <TimelineRoundedIcon fontSize="small" />,
    permissions: [],
    children: monitoringItems,
  },
];

export function getAuthorizedWorkforcePlanningNavigation(
  user: SessionClaims | null,
  items: readonly WorkforcePlanningNavigationItem[] = getWorkforcePlanningNavigation(),
): WorkforcePlanningNavigationItem[] {
  const visibleItems: WorkforcePlanningNavigationItem[] = [];

  for (const item of items) {
    const children = item.children
      ? getAuthorizedWorkforcePlanningNavigation(user, item.children)
      : [];
    const itemAllowed = item.permissions.length === 0 || isAuthorized(user, { permissions: item.permissions });

    if (item.children && children.length > 0) visibleItems.push({ ...item, children });
    if (!item.children && itemAllowed) visibleItems.push(item);
  }

  return visibleItems;
}

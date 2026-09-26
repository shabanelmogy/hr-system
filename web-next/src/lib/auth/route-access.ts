import { appRoutes } from "@/config/routes";
import type { SessionClaims } from "./session";
import { permissions, type PermissionString } from "./permissions";
import { isAuthorized } from "./authorization";

export const UNAVAILABLE_ROUTE = appRoutes.shell.routeUnavailable;
export const HANGFIRE_PROXY_ROUTE = "/hangfire";
export const APPS_ROUTE = appRoutes.platform.apps.index;

export type RoutePolicy = {
  path: string;
  roles?: readonly string[];
  permissions?: readonly PermissionString[];
  anyOf?: readonly {
    roles?: readonly string[];
    permissions?: readonly PermissionString[];
  }[];
  deny?: boolean;
};

const adminRole = "admin";
const superAdminRole = "super_admin";
const rolePermissionsBase = appRoutes.platform.administration.rolePermissions("").replace(/\/$/, "");
const superAdminAllowedRoutes = [
  appRoutes.shell.home,
  appRoutes.platform.profile,
  appRoutes.auth.changePassword,
  appRoutes.platform.superAdmin.dashboard,
  appRoutes.platform.superAdmin.tenants,
  appRoutes.platform.superAdmin.tenantAdmins,
  appRoutes.modules.referenceData.geography.countries,
  appRoutes.modules.referenceData.geography.states,
  appRoutes.modules.referenceData.geography.districts,
  UNAVAILABLE_ROUTE,
] as const;

export const routePolicies: readonly RoutePolicy[] = [
  { path: appRoutes.shell.home },
  { path: APPS_ROUTE },
  { path: appRoutes.platform.profile },
  { path: appRoutes.auth.changePassword },
  { path: appRoutes.platform.superAdmin.tenants, roles: [superAdminRole] },
  { path: appRoutes.platform.superAdmin.tenantAdmins, roles: [superAdminRole] },
  { path: appRoutes.platform.superAdmin.dashboard, roles: [superAdminRole] },
  { path: appRoutes.modules.referenceData.geography.countries, roles: [superAdminRole], permissions: [permissions.ViewCountries] },
  { path: appRoutes.modules.referenceData.geography.states, roles: [superAdminRole], permissions: [permissions.ViewStates] },
  { path: appRoutes.modules.referenceData.geography.districts, roles: [superAdminRole], permissions: [permissions.ViewDistricts] },
  {
    path: rolePermissionsBase,
    permissions: [permissions.ViewRolePermissions],
  },
  { path: appRoutes.platform.administration.roles, permissions: [permissions.ViewRoles] },
  { path: appRoutes.platform.administration.users, permissions: [permissions.ViewUsers] },
  { path: appRoutes.platform.administration.invitations, permissions: [permissions.ViewUsers] },
  { path: appRoutes.platform.administration.offlineOperations },
  {
    path: appRoutes.modules.reporting.crystalReports,
    permissions: [permissions.ViewCrystalReports],
  },
  {
    path: appRoutes.modules.referenceData.addressTypes,
    permissions: [permissions.ViewAddressTypes],
  },
  {
    path: appRoutes.platform.companyGeographicScope,
    permissions: [permissions.ViewCompanyGeographicScope],
  },
  {
    path: appRoutes.modules.hr.organizationalStructure.branches,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    path: appRoutes.modules.hr.organizationalStructure.departments,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    path: appRoutes.modules.hr.organizationalStructure.divisions,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    path: appRoutes.modules.hr.organizationalStructure.jobTitles,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    path: appRoutes.modules.hr.organizationalStructure.jobLevels,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    path: appRoutes.modules.hr.organizationalStructure.positions,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    path: appRoutes.modules.hr.organizationalStructure.jobDescriptions,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    path: appRoutes.modules.hr.organizationalStructure.index,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    path: appRoutes.shell.basicData,
    permissions: [
      permissions.ViewAddressTypes,
      permissions.ViewCompanyGeographicScope,
      permissions.ViewOrganizationalStructure,
    ],
  },
  { path: appRoutes.platform.files.manager },
  {
    path: appRoutes.modules.crm.appointments,
    permissions: [permissions.ViewAppointments],
  },
  {
    path: appRoutes.platform.advancedTools.localizationApi,
    permissions: [permissions.ViewLocalizations],
  },
  { path: appRoutes.platform.advancedTools.healthCheck, roles: [adminRole] },
  { path: appRoutes.platform.advancedTools.apiEndpoints, roles: [adminRole] },
  {
    path: appRoutes.platform.advancedTools.hangfireDashboard,
    permissions: [permissions.ViewHangfireDashboard],
  },
  {
    path: HANGFIRE_PROXY_ROUTE,
    permissions: [permissions.ViewHangfireDashboard],
  },
  {
    path: appRoutes.modules.hr.attendanceDevices.users,
    permissions: [permissions.ViewRawAttendanceDevices],
  },
  {
    path: appRoutes.modules.hr.attendanceDevices.punches,
    permissions: [permissions.ViewRawAttendanceDevices],
  },
  {
    path: appRoutes.modules.hr.attendanceDevices.pullRuns,
    permissions: [permissions.ViewRawAttendanceDevices],
  },
  {
    path: appRoutes.modules.hr.attendanceDevices.index,
    permissions: [permissions.ViewAttendanceDevices],
  },
  {
    path: appRoutes.modules.hr.recruitment,
    anyOf: [
      { roles: [adminRole] },
      { permissions: [permissions.ViewRecruitment] },
    ],
  },
  {
    path: appRoutes.modules.accounting.ledgerSetup.fiscalYears,
    permissions: [permissions.ViewFiscalYears],
  },
  {
    path: appRoutes.modules.accounting.ledgerSetup.currencies,
    permissions: [permissions.ViewCurrencies],
  },
  {
    path: appRoutes.modules.accounting.ledgerSetup.accountingSettings,
    permissions: [permissions.ViewAccountingSettings],
  },
  {
    path: appRoutes.modules.accounting.ledgerSetup.accounts,
    permissions: [permissions.ViewAccountHierarchyLevels],
  },
  {
    path: appRoutes.modules.accounting.ledgerSetup.hierarchyLevels,
    permissions: [permissions.ViewAccounts],
  },
  {
    path: appRoutes.modules.accounting.ledgerSetup.dimensions,
    permissions: [permissions.ViewDimensionDefinitions],
  },
  { path: appRoutes.modules.accounting.ledgerSetup.books, permissions: [permissions.ViewBooks] },
  { path: appRoutes.modules.accounting.ledgerSetup.journals, permissions: [permissions.ViewJournalDefinitions] },
  { path: appRoutes.modules.accounting.ledgerSetup.exchangeRates, permissions: [permissions.ViewExchangeRateTypes] },
  { path: appRoutes.modules.accounting.ledgerSetup.accountDetermination, permissions: [permissions.ViewAccountMappings] },
  {
    path: appRoutes.modules.accounting.ledgerSetup.index,
    anyOf: [
      { permissions: [permissions.ViewFiscalYears] },
      { permissions: [permissions.ViewCurrencies] },
      { permissions: [permissions.ViewAccountingSettings] },
      { permissions: [permissions.ViewAccounts] },
      { permissions: [permissions.ViewAccountHierarchyLevels] },
      { permissions: [permissions.ViewDimensionDefinitions] },
      { permissions: [permissions.ViewBooks] },
      { permissions: [permissions.ViewJournalDefinitions] },
      { permissions: [permissions.ViewExchangeRateTypes] },
      { permissions: [permissions.ViewAccountMappings] },
    ],
  },
  {
    path: appRoutes.modules.hr.workforcePlanning.plans,
    permissions: [permissions.ViewWorkforcePlans],
  },
  {
    path: appRoutes.modules.hr.workforcePlanning.budgets,
    permissions: [permissions.ViewWorkforceBudgets],
  },
  {
    path: appRoutes.modules.hr.workforcePlanning.positionEnvelopes,
    permissions: [permissions.ViewPositionEnvelopes],
  },
  {
    path: appRoutes.modules.hr.workforcePlanning.staffingRequests,
    permissions: [permissions.ViewStaffingRequests],
  },
  {
    path: appRoutes.modules.hr.workforcePlanning.envelopeAmendments,
    permissions: [permissions.ViewEnvelopeAmendments],
  },
  {
    path: appRoutes.modules.hr.workforcePlanning.trace,
    permissions: [permissions.ViewWorkforceTrace],
  },
  {
    path: appRoutes.modules.hr.workforcePlanning.index,
    anyOf: [
      { permissions: [permissions.ViewWorkforcePlans] },
      { permissions: [permissions.ViewWorkforceBudgets] },
      { permissions: [permissions.ViewPositionEnvelopes] },
      { permissions: [permissions.ViewStaffingRequests] },
      { permissions: [permissions.ViewEnvelopeAmendments] },
      { permissions: [permissions.ViewWorkforceTrace] },
    ],
  },
  { path: UNAVAILABLE_ROUTE },
];

const matchesRoute = (pathname: string, routePath: string) =>
  pathname === routePath ||
  (routePath !== appRoutes.shell.home && pathname.startsWith(`${routePath}/`));

export function canAccessRoute(pathname: string, session: SessionClaims): boolean {
  const isSuperAdmin = session.roles.some(
    (role) => role.trim().toLowerCase() === superAdminRole,
  );
  if (
    isSuperAdmin &&
    !superAdminAllowedRoutes.some((path) => matchesRoute(pathname, path))
  ) {
    return false;
  }

  const rule = routePolicies
    .filter(({ path }) => matchesRoute(pathname, path))
    .sort((left, right) => right.path.length - left.path.length)[0];
  if (!rule) return false;
  if (rule.deny) return false;

  if (rule.anyOf?.length) {
    return rule.anyOf.some((requirement) => isAuthorized(session, requirement));
  }

  return isAuthorized(session, {
    roles: rule.roles,
    permissions: rule.permissions,
  });
}

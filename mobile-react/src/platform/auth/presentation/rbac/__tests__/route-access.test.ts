import { describe, expect, it } from '@jest/globals';

import { ROUTES } from '@/src/core/constants/routes';
import { getAuthorizationState, type AuthorizationClaims } from '../authorization';
import { permissions } from '../permissions';
import { canAccessRoute, getRoutePolicy, requiredModuleForPath } from '../route-access';
import { MAIN_DRAWER_ROUTES } from '../route-manifest';
import { appRoles } from '../roles';

const userWith = ({
  roles = [appRoles.user],
  permissionClaims = [],
}: {
  roles?: readonly string[];
  permissionClaims?: readonly string[];
} = {}): AuthorizationClaims => ({ roles, permissions: permissionClaims });

describe('route access manifest', () => {
  it('permits company email preview only with its exact View grant and excludes global sessions', () => {
    expect(canAccessRoute(ROUTES.emailTemplates, userWith())).toBe(false);
    expect(canAccessRoute(ROUTES.emailTemplates, userWith({ permissionClaims: [permissions.ViewCompanyEmailTemplates] }))).toBe(true);
    expect(canAccessRoute(ROUTES.emailTemplates, userWith({ permissionClaims: [permissions.EditCompanyEmailTemplates] }))).toBe(false);
    expect(canAccessRoute(ROUTES.emailTemplates, userWith({ roles: [appRoles.superAdmin], permissionClaims: [permissions.ViewCompanyEmailTemplates] }))).toBe(false);
    expect(requiredModuleForPath(ROUTES.emailTemplates)).toEqual({ moduleCode: 'platform', submoduleCode: 'tenant-administration' });
  });
  it('requires the specific global grant for each SuperAdmin tool', () => {
    for (const [path, permission] of [
      [ROUTES.systemAuditTrail, permissions.ViewSystemAuditTrail],
      [ROUTES.advancedTools.healthCheck, permissions.ViewSystemHealth],
      [ROUTES.advancedTools.apiEndpoints, permissions.ViewSystemApiDocs],
      [ROUTES.advancedTools.hangfireDashboard, permissions.ViewHangfireDashboard],
    ]) {
      expect(canAccessRoute(path, userWith({ roles: [appRoles.superAdmin] }))).toBe(false);
      expect(canAccessRoute(path, userWith({ roles: [appRoles.superAdmin], permissionClaims: [permission] }))).toBe(true);
    }
    expect(canAccessRoute(ROUTES.systemAuditTrail, userWith({ permissionClaims: [permissions.ViewSystemAuditTrail] }))).toBe(false);
    expect(canAccessRoute(ROUTES.advancedTools.auditTrail, userWith({ roles: [appRoles.superAdmin], permissionClaims: [permissions.ViewAuditTrail] }))).toBe(false);
  });
  it('keeps the Settings parent reachable for permitted company configuration without granting children', () => {
    const user = userWith({ permissionClaims: [permissions.ViewCompanyLocalizations] });
    expect(canAccessRoute(ROUTES.settings, user)).toBe(true);
    expect(canAccessRoute(ROUTES.administration.companyLocalizations, user)).toBe(true);
    expect(canAccessRoute(ROUTES.errorLogSettings, user)).toBe(false);
    expect(canAccessRoute(ROUTES.settings, userWith())).toBe(false);
    expect(MAIN_DRAWER_ROUTES.find((entry) => entry.name === 'system-error-logs')?.hidden).toBe(true);
    expect(MAIN_DRAWER_ROUTES.find((entry) => entry.name === 'administration')?.hidden).toBe(true);
  });
  it('keeps Error Logs company and global permissions independent', () => {
    expect(MAIN_DRAWER_ROUTES.find((entry) => entry.name === 'error-log-settings')?.hidden).toBe(true);
    const company = userWith({ permissionClaims: [permissions.ViewErrorLogs] });
    expect(canAccessRoute(ROUTES.advancedTools.errorLogs, company)).toBe(true);
    expect(canAccessRoute(ROUTES.systemErrorLogs, company)).toBe(false);
    expect(canAccessRoute(ROUTES.errorLogSettings, company)).toBe(false);
    const system = userWith({ roles: [appRoles.superAdmin], permissionClaims: [permissions.ViewSystemErrorLogs] });
    expect(canAccessRoute(ROUTES.systemErrorLogs, system)).toBe(true);
    expect(canAccessRoute(ROUTES.errorLogSettings, system)).toBe(false);
    expect(canAccessRoute(ROUTES.advancedTools.errorLogs, system)).toBe(false);
    expect(canAccessRoute(ROUTES.systemErrorLogs, userWith({ roles: [appRoles.superAdmin] }))).toBe(false);
    expect(canAccessRoute(ROUTES.errorLogSettings, userWith({ roles: [appRoles.superAdmin], permissionClaims: [permissions.ViewErrorLogSettings] }))).toBe(true);
  });
  it('maps business routes to the matching commercial submodule', () => {
    expect(requiredModuleForPath('/apps/hr/recruitment')).toEqual({
      moduleCode: 'hr',
      submoduleCode: 'recruitment',
    });
    expect(requiredModuleForPath(ROUTES.advancedTools.localizationApi)).toEqual({
      moduleCode: 'platform',
      submoduleCode: 'tenant-administration',
    });
    expect(requiredModuleForPath(ROUTES.advancedTools.auditTrail)).toEqual({
      moduleCode: 'platform',
      submoduleCode: 'tenant-administration',
    });
    expect(requiredModuleForPath(ROUTES.administration.roles)).toEqual({
      moduleCode: 'platform',
      submoduleCode: 'tenant-administration',
    });
    expect(requiredModuleForPath(ROUTES.administration.offlineOperations)).toEqual({
      moduleCode: 'platform',
      submoduleCode: 'tenant-administration',
    });
    expect(requiredModuleForPath(ROUTES.basicData.countries)).toEqual({ moduleCode: 'reference-data', submoduleCode: 'geography' });
    expect(requiredModuleForPath(ROUTES.basicData.addressTypes)).toEqual({ moduleCode: 'reference-data', submoduleCode: 'addresses' });
    expect(requiredModuleForPath(ROUTES.basicData.companyGeographicScope)).toEqual({ moduleCode: 'platform', submoduleCode: 'tenant-administration' });
    expect(requiredModuleForPath(ROUTES.extras.appointments)).toEqual({ moduleCode: 'crm', submoduleCode: 'appointments' });
    expect(requiredModuleForPath(ROUTES.advancedTools.healthCheck)).toEqual({ moduleCode: 'platform', submoduleCode: 'operations' });
    expect(requiredModuleForPath(ROUTES.finance.ledgerSetup.currencies)).toEqual({ moduleCode: 'acc', submoduleCode: 'ledger-setup' });
  });

  it('defaults unknown routes to denied', () => {
    expect(canAccessRoute('/not-registered', userWith())).toBe(false);
  });
  it('requires the exact company-localization view grant and exposes its administration entry', () => {
    const viewer = userWith({ permissionClaims: [permissions.ViewCompanyLocalizations] });
    expect(getRoutePolicy(ROUTES.administration.companyLocalizations)?.path).toBe(ROUTES.administration.companyLocalizations);
    expect(canAccessRoute(ROUTES.administration.companyLocalizations, viewer)).toBe(true);
    expect(canAccessRoute(ROUTES.administration.root, viewer)).toBe(true);
    expect(canAccessRoute(ROUTES.administration.companyLocalizations, userWith({ permissionClaims: [permissions.ViewUsers] }))).toBe(false);
    expect(requiredModuleForPath(ROUTES.administration.companyLocalizations)).toEqual({ moduleCode: 'platform', submoduleCode: 'tenant-administration' });
  });

  it('uses the specific role-permissions policy before administration root', () => {
    const session = userWith({ permissionClaims: [permissions.ViewRolePermissions] });

    expect(getRoutePolicy('/administration/role-permissions/role-1')?.path)
      .toBe(ROUTES.administration.rolePermissionsRoot);
    expect(canAccessRoute('/administration/role-permissions/role-1', session)).toBe(true);
  });

  it('keeps Offline Operations behind its canonical view permission', () => {
    const usersViewer = userWith({ permissionClaims: [permissions.ViewUsers] });
    const rolesViewer = userWith({ permissionClaims: [permissions.ViewRoles] });
    const manager = userWith({ permissionClaims: [permissions.ViewOfflineOperations] });
    const roleOnlyAdmin = userWith({ roles: [appRoles.admin] });

    expect(getRoutePolicy(ROUTES.administration.offlineOperations)?.path)
      .toBe(ROUTES.administration.offlineOperations);
    expect(canAccessRoute(ROUTES.administration.offlineOperations, usersViewer)).toBe(false);
    expect(canAccessRoute(ROUTES.administration.offlineOperations, rolesViewer)).toBe(false);
    expect(canAccessRoute(ROUTES.administration.offlineOperations, roleOnlyAdmin)).toBe(false);
    expect(canAccessRoute(ROUTES.administration.offlineOperations, manager)).toBe(true);
    expect(canAccessRoute(ROUTES.administration.root, manager)).toBe(true);
  });

  it('keeps Invitations behind its dedicated view permission', () => {
    const usersViewer = userWith({ permissionClaims: [permissions.ViewUsers] });
    const invitationViewer = userWith({
      permissionClaims: [permissions.ViewUserInvitations],
    });

    expect(canAccessRoute(ROUTES.administration.invitations, usersViewer)).toBe(false);
    expect(canAccessRoute(ROUTES.administration.invitations, invitationViewer)).toBe(true);
    expect(canAccessRoute(ROUTES.administration.root, invitationViewer)).toBe(true);
  });

  it('reserves the global Countries catalog for super administrators with Countries:View', () => {
    expect(canAccessRoute(ROUTES.basicData.countries, userWith({
      roles: [appRoles.superAdmin],
      permissionClaims: [permissions.ViewCountries],
    }))).toBe(true);
    // Same contract as the web route policy: the role alone is not enough.
    expect(canAccessRoute(ROUTES.basicData.countries, userWith({
      roles: [appRoles.superAdmin],
    }))).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.countries, userWith())).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.countries, userWith({
      permissionClaims: [permissions.ViewStates],
    }))).toBe(false);
  });

  it('keeps managed report access independent from Countries view access', () => {
    const countriesOnly = userWith({ permissionClaims: [permissions.ViewCountries] });
    const reportViewer = userWith({
      permissionClaims: [permissions.ViewCountries, permissions.ViewCrystalReports],
    });

    expect(getAuthorizationState(countriesOnly, false, {
      permissions: [permissions.ViewCrystalReports],
    })).toBe('forbidden');
    expect(getAuthorizationState(reportViewer, false, {
      permissions: [permissions.ViewCrystalReports],
    })).toBe('authorized');
  });

  it('reserves States and Districts catalog routes for super administrators with View permission', () => {
    const superAdmin = userWith({
      roles: [appRoles.superAdmin],
      permissionClaims: [permissions.ViewStates, permissions.ViewDistricts],
    });

    expect(canAccessRoute(ROUTES.basicData.states, userWith({ roles: [appRoles.superAdmin] }))).toBe(false);

    expect(canAccessRoute(ROUTES.basicData.states, superAdmin)).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.districts, superAdmin)).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.states, userWith())).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.states, userWith({ permissionClaims: [permissions.ViewCountries] }))).toBe(false);
  });

  it('allows tenant administrators to use operating countries but not the global catalog', () => {
    const tenantAdmin = userWith({
      roles: [appRoles.admin],
      permissionClaims: [
        permissions.ViewCompanyGeographicScope,
        permissions.EditCompanyGeographicScope,
        permissions.ViewCountries,
        permissions.ViewStates,
        permissions.ViewDistricts,
      ],
    });

    expect(canAccessRoute(ROUTES.basicData.companyGeographicScope, tenantAdmin)).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.organizationalStructure, tenantAdmin)).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.organizationalStructureManagement, tenantAdmin)).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.countries, tenantAdmin)).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.states, tenantAdmin)).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.districts, tenantAdmin)).toBe(false);
  });

  it('requires the organizational structure view permission for its management route', () => {
    expect(canAccessRoute(
      ROUTES.basicData.organizationalStructureManagement,
      userWith({ permissionClaims: [permissions.ViewOrganizationalStructure] }),
    )).toBe(true);
    expect(canAccessRoute(
      ROUTES.basicData.organizationalStructureManagement,
      userWith({ permissionClaims: [permissions.ViewCompanyGeographicScope] }),
    )).toBe(false);
  });

  it('allows only the global geography branch of Basic Data for super administrators', () => {
    const superAdmin = userWith({ roles: [appRoles.superAdmin] });

    expect(canAccessRoute(ROUTES.basicData.root, superAdmin)).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.geographicalInformation, superAdmin)).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.organizationalStructure, superAdmin)).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.addressTypes, userWith({
      roles: [appRoles.superAdmin],
      permissionClaims: [permissions.ViewAddressTypes],
    }))).toBe(false);
  });

  it('keeps super administrators outside tenant-owned modules', () => {
    const session = userWith({
      roles: [appRoles.superAdmin],
      permissionClaims: [permissions.ViewRoles],
    });

    expect(canAccessRoute(ROUTES.tenantManagement, session)).toBe(true);
    expect(canAccessRoute(ROUTES.administration.roles, session)).toBe(false);
    expect(canAccessRoute(ROUTES.apps, session)).toBe(false);
  });

  it('gives every drawer destination a registered policy', () => {
    for (const definition of MAIN_DRAWER_ROUTES) {
      expect(getRoutePolicy(definition.path)).toBeDefined();
    }
  });

  it('opens Finance for either implemented Accounting submodule and isolates leaf permissions', () => {
    const fiscalYearViewer = userWith({
      permissionClaims: [permissions.ViewFiscalYears],
    });
    const currencyViewer = userWith({
      permissionClaims: [permissions.ViewCurrencies],
    });

    expect(canAccessRoute(ROUTES.finance.root, userWith())).toBe(false);
    expect(canAccessRoute(ROUTES.finance.ledgerSetup.fiscalYears, userWith())).toBe(false);
    expect(canAccessRoute(ROUTES.finance.ledgerSetup.currencies, userWith())).toBe(false);
    expect(canAccessRoute(ROUTES.finance.root, fiscalYearViewer)).toBe(true);
    expect(canAccessRoute(ROUTES.finance.ledgerSetup.fiscalYears, fiscalYearViewer)).toBe(true);
    expect(canAccessRoute(ROUTES.finance.ledgerSetup.currencies, fiscalYearViewer)).toBe(false);
    expect(canAccessRoute(ROUTES.finance.root, currencyViewer)).toBe(true);
    expect(canAccessRoute(ROUTES.finance.ledgerSetup.currencies, currencyViewer)).toBe(true);
    expect(canAccessRoute(ROUTES.finance.ledgerSetup.fiscalYears, currencyViewer)).toBe(false);
  });

  it('keeps Chart of Accounts and hierarchy levels isolated', () => {
    const accountViewer = userWith({ permissionClaims: [permissions.ViewAccounts] });
    const hierarchyViewer = userWith({
      permissionClaims: [permissions.ViewAccountHierarchyLevels],
    });

    expect(canAccessRoute(ROUTES.finance.ledgerSetup.accounts, accountViewer)).toBe(true);
    expect(canAccessRoute(ROUTES.finance.ledgerSetup.hierarchyLevels, accountViewer)).toBe(false);
    expect(canAccessRoute(ROUTES.finance.ledgerSetup.accounts, hierarchyViewer)).toBe(false);
    expect(canAccessRoute(ROUTES.finance.ledgerSetup.hierarchyLevels, hierarchyViewer)).toBe(true);
  });

  it('opens composite Ledger Setup routes for any permitted child screen', () => {
    expect(canAccessRoute(
      ROUTES.finance.ledgerSetup.dimensions,
      userWith({ permissionClaims: [permissions.ViewDimensionValues] }),
    )).toBe(true);
    expect(canAccessRoute(
      ROUTES.finance.ledgerSetup.exchangeRates,
      userWith({ permissionClaims: [permissions.ViewExchangeRates] }),
    )).toBe(true);
    expect(canAccessRoute(
      ROUTES.finance.ledgerSetup.accountDetermination,
      userWith({ permissionClaims: [permissions.ViewPostingProfiles] }),
    )).toBe(true);
  });

  it('allows the Workforce Planning workspace for any module view permission', () => {
    const staffingViewer = userWith({
      permissionClaims: [permissions.ViewStaffingRequests],
    });

    expect(canAccessRoute(ROUTES.workforcePlanning.index, userWith())).toBe(false);
    expect(canAccessRoute(ROUTES.workforcePlanning.index, staffingViewer)).toBe(true);
    expect(canAccessRoute(ROUTES.workforcePlanning.staffingRequests, staffingViewer)).toBe(true);
  });

  it('keeps Workforce Planning leaf permissions isolated', () => {
    const planViewer = userWith({
      permissionClaims: [permissions.ViewWorkforcePlans],
    });

    expect(canAccessRoute(ROUTES.workforcePlanning.plans, planViewer)).toBe(true);
    expect(canAccessRoute(ROUTES.workforcePlanning.budgets, planViewer)).toBe(false);
    expect(canAccessRoute(ROUTES.workforcePlanning.trace, planViewer)).toBe(false);
  });

  it('registers Workforce Planning as a standalone drawer module', () => {
    const workforceRoute = MAIN_DRAWER_ROUTES.find(
      (definition) => definition.name === 'workforce-planning',
    );

    expect(workforceRoute?.path).toBe(ROUTES.workforcePlanning.index);
    expect(workforceRoute?.headerShown).toBe(false);
  });
});

it('isolates the global text editor from company actors and requires its exact grant',()=>{
 const global=userWith({roles:[appRoles.superAdmin],permissionClaims:[permissions.ViewSystemUiTexts]});
 expect(canAccessRoute(ROUTES.systemUiTexts,global)).toBe(true);
 expect(canAccessRoute(ROUTES.systemUiTexts,userWith({roles:[appRoles.superAdmin],permissionClaims:[]}))).toBe(false);
 expect(canAccessRoute(ROUTES.systemUiTexts,userWith({roles:[appRoles.admin],permissionClaims:[permissions.ViewSystemUiTexts]}))).toBe(false);
});

import { beforeEach, describe, expect, it } from "vitest";

import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { accountingModuleDefinition } from "@/modules/accounting";
import { crmModuleDefinition } from "@/modules/crm";
import { hrModuleDefinition } from "@/modules/hr";
import { referenceDataModuleDefinition } from "@/modules/reference-data";
import { reportingModuleDefinition } from "@/modules/reporting";
import {
  registerFrontendModule,
  resetFrontendModuleRegistryForTests,
} from "@/platform/modules";
import { getNavigationConfig } from "@/shell/components/sidebar/navigationConfig";
import { NavigationSectionId } from "@/shell/components/sidebar/navigationTypes";
import {
  filterItems,
  filterNavigationConfig,
  filterNavigationConfigByModules,
} from "@/shell/components/sidebar/navigationUtils";

const paths = (config: ReturnType<typeof getNavigationConfig>) =>
  config.flatMap((section) => section.items ?? []).flatMap(function collect(item): string[] {
    return [item.path, ...(item.items ?? []).flatMap(collect)].filter(
      (path): path is string => Boolean(path),
    );
  });

describe("application navigation configuration", () => {
  beforeEach(() => {
    resetFrontendModuleRegistryForTests();
    registerFrontendModule(hrModuleDefinition);
    registerFrontendModule(accountingModuleDefinition);
    registerFrontendModule(crmModuleDefinition);
    registerFrontendModule(referenceDataModuleDefinition);
    registerFrontendModule(reportingModuleDefinition);
  });

  it("keeps authorized direct destinations with an empty items array", () => {
    const section = { id: "direct", title: "Direct", icon: <span />, path: "/direct", items: [] };
    expect(filterNavigationConfig([section], [], [])).toEqual([{ ...section, items: undefined }]);
    expect(filterNavigationConfig([{ ...section, path: undefined }], [], [])).toEqual([]);
  });

  it("derives HR workforce and organizational-structure entry navigation from HR", () => {
    const workforce = hrModuleDefinition.submodules.find((item) => item.code === "workforce");
    expect(workforce?.navigation.flatMap((section) => section.entries).find(
      (entry) => entry.path === appRoutes.modules.hr.workforcePlanning.index,
    )?.requiredPermissions).toContain(permissions.ViewEnvelopeAmendments);

    const basicData = hrModuleDefinition.submodules.find((item) => item.code === "basic-data");
    expect(basicData?.navigation.flatMap((section) => section.entries).map((entry) => entry.path)).toEqual([
      appRoutes.modules.hr.organizationalStructure.index,
    ]);
  });

  it("exposes Workforce Planning for any of its view permissions", () => {
    const config = getNavigationConfig([], [permissions.ViewEnvelopeAmendments]);
    const workforceSection = config.find(
      (section) => section.id === NavigationSectionId.WORKFORCE_PLANNING,
    );
    expect(workforceSection?.items).toHaveLength(1);
    expect(workforceSection?.items?.[0]?.path).toBe(appRoutes.modules.hr.workforcePlanning.index);
  });

  it("gets Fiscal Years from Accounting, not HR", () => {
    const config = getNavigationConfig([], [permissions.ViewFiscalYears]);
    const financeSection = config.find(
      (section) => section.id === NavigationSectionId.FINANCE,
    );
    expect(financeSection?.items?.map((item) => item.path)).toEqual([
      appRoutes.modules.accounting.fiscalYears,
    ]);
  });

  it("gets Ledger Setup currencies from Accounting, not Basic Data", () => {
    const config = getNavigationConfig([], [permissions.ViewAccountingSetup]);
    const pathsForAccounting = paths(config);
    expect(pathsForAccounting).toContain(appRoutes.modules.accounting.ledgerSetup.currencies);
    expect(pathsForAccounting).not.toContain("/basic-data/organizational-structure/currencies");
  });

  it("scopes the sidebar to the module that owns the active business route", () => {
    const config = getNavigationConfig([], [
      permissions.ViewFiscalYears,
      permissions.ViewAccountingSetup,
      permissions.ViewOrganizationalStructure,
      permissions.ViewRecruitment,
    ], "acc");

    expect(paths(config)).toEqual([
      appRoutes.modules.accounting.fiscalYears,
      appRoutes.modules.accounting.ledgerSetup.currencies,
    ]);
    expect(config).toHaveLength(2);
  });

  it("keeps Crystal Reports only when Reporting analytics is accessible", () => {
    const permissionFiltered = getNavigationConfig([], [permissions.ManageCrystalReportAccess]);
    expect(paths(permissionFiltered)).toContain(appRoutes.modules.reporting.crystalReports);

    expect(paths(filterNavigationConfigByModules(permissionFiltered, [{
      code: "reporting",
      submodules: [{ code: "analytics" }],
    }]))).toContain(appRoutes.modules.reporting.crystalReports);

    expect(paths(filterNavigationConfigByModules(permissionFiltered, [{
      code: "hr",
      submodules: [{ code: "basic-data" }],
    }]))).not.toContain(appRoutes.modules.reporting.crystalReports);
  });

  it("keeps authorized Platform links without tenant module entitlements", () => {
    const permissionFiltered = getNavigationConfig([], [
      permissions.ViewRoles,
      permissions.ViewLocalizations,
      permissions.ViewCompanyGeographicScope,
    ]);
    const moduleFiltered = filterNavigationConfigByModules(permissionFiltered, []);
    expect(paths(moduleFiltered)).toEqual(expect.arrayContaining([
      appRoutes.platform.administration.roles,
      appRoutes.platform.advancedTools.localizationApi,
      appRoutes.platform.companyGeographicScope,
    ]));
  });

  it("fails closed for business links when accessible modules are unavailable", () => {
    const permissionFiltered = getNavigationConfig([], [
      permissions.ViewFiscalYears,
      permissions.ViewAppointments,
      permissions.ViewAddressTypes,
      permissions.ManageCrystalReportAccess,
    ]);
    const moduleFiltered = filterNavigationConfigByModules(permissionFiltered, []);
    expect(paths(moduleFiltered)).not.toContain(appRoutes.modules.accounting.fiscalYears);
    expect(paths(moduleFiltered)).not.toContain(appRoutes.modules.crm.appointments);
    expect(paths(moduleFiltered)).not.toContain(appRoutes.modules.referenceData.addressTypes);
    expect(paths(moduleFiltered)).not.toContain(appRoutes.modules.reporting.crystalReports);
  });

  it("removes empty permissioned groups instead of rendering blank sections", () => {
    const filtered = filterItems([
      {
        title: "Empty group",
        icon: <span />,
        permissions: [permissions.ViewUsers],
        items: [{ title: "Hidden child", icon: <span />, permissions: [permissions.ViewRoles] }],
      },
    ], [], []);
    expect(filtered).toEqual([]);
  });

  it("keeps an allowed child while removing a restricted parent destination", () => {
    const filtered = filterItems([
      {
        title: "Parent",
        icon: <span />,
        path: "/restricted-parent",
        permissions: [permissions.ViewUsers],
        items: [{ title: "Child", icon: <span />, path: "/child", permissions: [permissions.ViewRoles] }],
      },
    ], [], [permissions.ViewRoles]);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].path).toBeUndefined();
    expect(filtered[0].items?.[0]?.path).toBe("/child");
  });
});

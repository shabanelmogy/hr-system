import { hrModuleDefinition } from "@/modules/hr/moduleDefinition";
import { beforeEach, describe, expect, it } from "vitest";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import {
  registerFrontendModule,
  resetFrontendModuleRegistryForTests,
} from "@/platform/modules";
import { getNavigationConfig } from "@/shell/components/sidebar/navigationConfig";
import { NavigationSectionId } from "@/shell/components/sidebar/navigationTypes";
import { filterItems, filterNavigationConfig, filterNavigationConfigByModules } from "@/shell/components/sidebar/navigationUtils";

const paths = (config: ReturnType<typeof getNavigationConfig>) =>
  config.flatMap((section) => section.items ?? []).flatMap(function collect(item): string[] {
    return [item.path, ...(item.items ?? []).flatMap(collect)].filter(
      (path): path is string => Boolean(path),
    );
  });

describe("application navigation configuration", () => {
  it("keeps authorized direct destinations with an empty items array", () => {
    const section = { id: "direct", title: "Direct", icon: <span />, path: "/direct", items: [] };
    expect(filterNavigationConfig([section], [], [])).toEqual([{ ...section, items: undefined }]);
    expect(filterNavigationConfig([{ ...section, path: undefined }], [], [])).toEqual([]);
  });

  it("derives submodule navigation from the registered canonical sidebar links", () => {
    const workforce = hrModuleDefinition.submodules.find(item => item.code === "workforce");
    expect(workforce?.navigation.flatMap(section => section.entries).find(entry => entry.path === appRoutes.workforcePlanning.index)?.requiredPermissions).toContain(permissions.ViewEnvelopeAmendments);
    const basicData = hrModuleDefinition.submodules.find(item => item.code === "basic-data");
    const basicDataPaths = basicData?.navigation.flatMap(section => section.entries).map(entry => entry.path);
    expect(basicDataPaths).toContain(appRoutes.basicData.organizationalStructure.costCenters);
    expect(basicDataPaths).toContain(appRoutes.basicData.organizationalStructure.currencies);
  });
  beforeEach(() => {
    resetFrontendModuleRegistryForTests();
    registerFrontendModule({
      code: "hr",
      name: "HR",
      navigation: hrModuleDefinition.navigation,
      requiredDependencies: [],
      optionalDependencies: [],
      submodules: [
        {
          code: "analytics",
          name: "Analytics",
          requiredPermissions: [],
          entryCandidates: [],
          navigation: [],
          routePrefixes: [appRoutes.auth.crystalReportsPage],
        },
        {
          code: "administration",
          name: "Administration",
          requiredPermissions: [],
          entryCandidates: [],
          navigation: [],
          routePrefixes: ["/administration"],
        },
      ],
    });
  });

  it("exposes Workforce Planning as its own module for any module view permission", () => {
    const config = getNavigationConfig([], [permissions.ViewEnvelopeAmendments]);
    const workforceSection = config.find(
      (section) => section.id === NavigationSectionId.WORKFORCE_PLANNING,
    );

    expect(workforceSection?.items).toHaveLength(1);
    expect(workforceSection?.items?.[0]?.path).toBe(appRoutes.workforcePlanning.index);
  });

  it("keeps Finance limited to Fiscal Years", () => {
    const config = getNavigationConfig([], [
      permissions.ViewFiscalYears,
      permissions.ViewWorkforcePlans,
    ]);
    const financeSection = config.find(
      (section) => section.id === NavigationSectionId.FINANCE,
    );

    expect(financeSection?.items?.map((item) => item.path)).toEqual([
      appRoutes.finance.fiscalYears,
    ]);
  });

  it("keeps an allowed Crystal Reports link when Analytics is accessible", () => {
    const permissionFiltered = getNavigationConfig([], [permissions.ManageCrystalReportAccess]);
    expect(paths(permissionFiltered)).toContain(appRoutes.auth.crystalReportsPage);
    const moduleFiltered = filterNavigationConfigByModules(permissionFiltered, [{
      code: "hr",
      submodules: [{ code: "analytics" }],
    }]);

    expect(paths(moduleFiltered)).toContain(appRoutes.auth.crystalReportsPage);
  });

  it("removes Crystal Reports when only Administration is accessible", () => {
    const permissionFiltered = getNavigationConfig([], [permissions.ManageCrystalReportAccess]);
    const moduleFiltered = filterNavigationConfigByModules(permissionFiltered, [{
      code: "hr",
      submodules: [{ code: "administration" }],
    }]);

    expect(paths(moduleFiltered)).not.toContain(appRoutes.auth.crystalReportsPage);
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

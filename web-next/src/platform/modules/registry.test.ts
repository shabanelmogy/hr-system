import { beforeEach, describe, expect, it } from "vitest";
import {
  getFrontendModuleDefinitions,
  intersectAccessibleModulesWithFrontendRegistry,
  registerFrontendModule,
  replaceFrontendModuleRegistry,
  resetFrontendModuleRegistryForTests,
  validateFrontendModuleRegistry,
  type FrontendModuleDefinition,
} from ".";

const moduleDefinition = (
  code: string,
  requiredDependencies: readonly string[] = [],
): FrontendModuleDefinition => ({
  code,
  name: code.toUpperCase(),
  requiredDependencies,
  optionalDependencies: [],
  submodules: [],
});

describe("frontend module registry", () => {
  beforeEach(resetFrontendModuleRegistryForTests);

  it("rejects equal route ownership while allowing more specific child prefixes", () => {
    const child = { code: "one", name: "One", requiredPermissions: [], entryCandidates: [], navigation: [], routePrefixes: ["/shared/"] };
    registerFrontendModule({ ...moduleDefinition("hr"), submodules: [child, { ...child, code: "two", routePrefixes: ["/shared"] }] });
    expect(() => validateFrontendModuleRegistry()).toThrow(/Ambiguous module route/);
  });

  it("registers definitions deterministically", () => {
    registerFrontendModule(moduleDefinition("zeta"));
    registerFrontendModule(moduleDefinition("alpha"));
    expect(getFrontendModuleDefinitions().map((item) => item.code)).toEqual(["alpha", "zeta"]);
  });

  it("replaces the application composition when a refresh creates new definition objects", () => {
    const initial = moduleDefinition("hr");
    const refreshed = moduleDefinition("hr");

    replaceFrontendModuleRegistry([initial]);
    expect(() => replaceFrontendModuleRegistry([refreshed])).not.toThrow();
    expect(getFrontendModuleDefinitions()).toEqual([refreshed]);
  });

  it("rejects duplicate module codes within one replacement composition", () => {
    const definition = moduleDefinition("hr");

    expect(() => replaceFrontendModuleRegistry([
      definition,
      definition,
    ])).toThrow(/already registered/);
  });

  it("preserves the active registry when replacement validation fails", () => {
    replaceFrontendModuleRegistry([moduleDefinition("stable")]);

    expect(() => replaceFrontendModuleRegistry([
      moduleDefinition("hr", ["core"]),
    ])).toThrow(/hr -> core/);
    expect(getFrontendModuleDefinitions().map((item) => item.code)).toEqual(["stable"]);
  });

  it("rejects missing required dependencies", () => {
    registerFrontendModule(moduleDefinition("hr", ["core"]));
    expect(() => validateFrontendModuleRegistry()).toThrow(/hr -> core/);
  });

  it("rejects required dependency cycles", () => {
    registerFrontendModule(moduleDefinition("a", ["b"]));
    registerFrontendModule(moduleDefinition("b", ["a"]));
    expect(() => validateFrontendModuleRegistry()).toThrow(/dependency cycle/i);
  });

  it("intersects server entitlements with definitions without granting access", () => {
    registerFrontendModule({
      ...moduleDefinition("hr"),
      submodules: [{
        code: "attendance",
        name: "Attendance",
        requiredPermissions: [],
        entryCandidates: [],
        navigation: [],
        routePrefixes: [],
      }],
    });

    const result = intersectAccessibleModulesWithFrontendRegistry([
      { code: "hr", name: "HR", submodules: [
        { code: "attendance", name: "Attendance", requiredPermissions: [], entryPath: null },
        { code: "unknown", name: "Unknown", requiredPermissions: [], entryPath: null },
      ], isDefault: true },
      { code: "not-in-build", name: "Not in build", submodules: [], isDefault: false },
    ]);

    expect(result).toEqual([{ code: "hr", name: "HR", submodules: [
      { code: "attendance", name: "Attendance", requiredPermissions: [], entryPath: null },
    ], isDefault: true }]);
  });
});

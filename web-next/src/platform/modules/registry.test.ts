import { beforeEach, describe, expect, it } from "vitest";
import {
  getFrontendModuleDefinitions,
  intersectAccessibleModulesWithFrontendRegistry,
  registerFrontendModule,
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
  it("rejects equal route ownership while allowing more specific child prefixes", () => {
    const child = { code: "one", name: "One", requiredPermissions: [], entryCandidates: [], navigation: [], routePrefixes: ["/shared/"] };
    registerFrontendModule({ ...moduleDefinition("hr"), submodules: [child, { ...child, code: "two", routePrefixes: ["/shared"] }] });
    expect(() => validateFrontendModuleRegistry()).toThrow(/Ambiguous module route/);
  });
  beforeEach(resetFrontendModuleRegistryForTests);

  it("registers definitions deterministically", () => {
    registerFrontendModule(moduleDefinition("zeta"));
    registerFrontendModule(moduleDefinition("alpha"));
    expect(getFrontendModuleDefinitions().map((item) => item.code)).toEqual(["alpha", "zeta"]);
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
        { code: "attendance", name: "Attendance", requiredPermissions: [] },
        { code: "unknown", name: "Unknown", requiredPermissions: [] },
      ] },
      { code: "not-in-build", name: "Not in build", submodules: [] },
    ]);

    expect(result).toEqual([{ code: "hr", name: "HR", submodules: [
      { code: "attendance", name: "Attendance", requiredPermissions: [] },
    ] }]);
  });
});

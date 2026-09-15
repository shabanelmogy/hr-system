import { beforeEach, describe, expect, it } from "vitest";
import {
  registerFrontendModule,
  resetFrontendModuleRegistryForTests,
} from "./registry";
import { requiredModuleForPath } from "./routeRequirements";

describe("module route requirements", () => {
  beforeEach(() => {
    resetFrontendModuleRegistryForTests();
    registerFrontendModule({
      code: "test-module",
      name: "Test module",
      requiredDependencies: [],
      optionalDependencies: [],
      submodules: [
        {
          code: "parent",
          name: "Parent",
          requiredPermissions: [],
          entryCandidates: [],
          navigation: [],
          routePrefixes: ["/attendance", "/attendance-trends"],
        },
        {
          code: "nested",
          name: "Nested",
          requiredPermissions: [],
          entryCandidates: [],
          navigation: [],
          routePrefixes: ["/attendance/devices"],
        },
      ],
    });
  });

  it("assigns overlapping routes to the longest registered prefix", () => {
    expect(requiredModuleForPath("/attendance/devices/42")).toEqual({
      moduleCode: "test-module",
      submoduleCode: "nested",
    });
    expect(requiredModuleForPath("/attendance-trends/")).toEqual({
      moduleCode: "test-module",
      submoduleCode: "parent",
    });
  });

  it("does not classify a similarly named sibling route", () => {
    expect(requiredModuleForPath("/attendance-devices")).toBeNull();
  });
});

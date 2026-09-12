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
      code: "hr",
      name: "HR",
      requiredDependencies: [],
      optionalDependencies: [],
      submodules: [
        {
          code: "analytics",
          name: "Analytics",
          requiredPermissions: [],
          entryCandidates: [],
          navigation: [],
          routePrefixes: ["/attendance", "/attendance-trends"],
        },
        {
          code: "attendance",
          name: "Attendance",
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
      moduleCode: "hr",
      submoduleCode: "attendance",
    });
    expect(requiredModuleForPath("/attendance-trends/")).toEqual({
      moduleCode: "hr",
      submoduleCode: "analytics",
    });
  });

  it("does not classify a similarly named sibling route", () => {
    expect(requiredModuleForPath("/attendance-devices")).toBeNull();
  });
});

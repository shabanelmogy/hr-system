import { describe, expect, it } from "vitest";
import { moduleAccents, resolveModuleAccent } from "./moduleAccents";

describe("resolveModuleAccent", () => {
  it("resolves a module key for the current mode", () => {
    expect(resolveModuleAccent("hr", "light")).toBe(moduleAccents.hr.light);
    expect(resolveModuleAccent("hr", "dark")).toBe(moduleAccents.hr.dark);
  });

  it("passes other colors through and keeps undefined", () => {
    expect(resolveModuleAccent("#123456", "dark")).toBe("#123456");
    expect(resolveModuleAccent(undefined, "light")).toBeUndefined();
  });
});

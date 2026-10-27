import { describe, expect, it } from "vitest";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { canAccessRoute } from "@/lib/auth/route-access";
import type { SessionClaims } from "@/lib/auth/session";
import { getAllowedSettingsTabs } from "./settingsTabs";

function actor(roles: string[], grants: string[]) {
  return { roles, permissions: grants } as SessionClaims;
}
describe("Settings workspace authority", () => {
 it("admits a global text viewer without retention permission and isolates company tabs",()=>{
  const global=actor(["super_admin"],[permissions.ViewSystemUiTexts]);
  expect(canAccessRoute(appRoutes.platform.settings,global)).toBe(true);
  expect(getAllowedSettingsTabs(global).map(x=>x.id)).toEqual(["system-ui-texts"]);
  expect(canAccessRoute(appRoutes.platform.superAdmin.systemUiTexts,actor(["admin"],[permissions.ViewSystemUiTexts]))).toBe(false);
 });
  it("requires an existing child grant and never exposes a company tab to SuperAdmin", () => {
    const user = actor(["super_admin"], [permissions.ViewErrorLogSettings, permissions.ViewCompanyLocalizations]);
    expect(canAccessRoute(appRoutes.platform.settings, user)).toBe(true);
    expect(getAllowedSettingsTabs(user).map((tab) => tab.id)).toEqual(["error-logs"]);
  });
  it("admits company configuration holders without global settings authority", () => {
    const user = actor(["user"], [permissions.ViewCompanyLocalizations, permissions.ViewErrorLogSettings]);
    expect(canAccessRoute(appRoutes.platform.settings, user)).toBe(true);
    expect(getAllowedSettingsTabs(user).map((tab) => tab.id)).toEqual(["company-localizations"]);
  });
  it("denies an empty entry and mounts nothing without session/grants", () => {
    expect(getAllowedSettingsTabs(null)).toEqual([]);
    expect(getAllowedSettingsTabs(actor(["admin"], []))).toEqual([]);
    expect(canAccessRoute(appRoutes.platform.settings, actor(["admin"], []))).toBe(false);
  });
});

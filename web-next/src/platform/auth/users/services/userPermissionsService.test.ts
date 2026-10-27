import { beforeEach, describe, expect, it, vi } from "vitest";
const transport = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock("@/shared/services", () => ({ apiService: transport }));
import { getUserCompanyPermissions, replaceUserCompanyPermissions } from "./userPermissionsService";
const response = { userId: "user/a", userName: "Test", companyId: 7, companyName: "Seven", revision: 2,
  permissions: [{ permission: "Invoices:View", moduleCode: "accounting", submoduleCode: "", isDirect: false,
    inheritedFrom: ["Accountant"], isEffective: true, canGrant: true }] };
beforeEach(() => vi.resetAllMocks());
describe("company user permission transport", () => {
  it("encodes identity and validates the active company before returning", async () => {
    transport.get.mockResolvedValue(response);
    await expect(getUserCompanyPermissions("user/a", 7)).resolves.toEqual(response);
    expect(transport.get).toHaveBeenCalledWith("/api/v1/user-permissions/user%2Fa");
    await expect(getUserCompanyPermissions("user/a", 8)).rejects.toThrow("scope mismatch");
    await expect(getUserCompanyPermissions("someone-else", 7)).rejects.toThrow("scope mismatch");
  });
  it("fails closed on malformed authority metadata", async () => {
    transport.get.mockResolvedValue({ ...response, permissions: [{ ...response.permissions[0], canGrant: "yes" }] });
    await expect(getUserCompanyPermissions("user/a", 7)).rejects.toThrow();
  });
  it("writes only additive selection and expected revision without a scope override", async () => {
    await replaceUserCompanyPermissions("user/a", { permissions: ["Invoices:View"], expectedRevision: 2 });
    expect(transport.put).toHaveBeenCalledWith("/api/v1/user-permissions/user%2Fa", {
      permissions: ["Invoices:View"], expectedRevision: 2,
    });
  });
});
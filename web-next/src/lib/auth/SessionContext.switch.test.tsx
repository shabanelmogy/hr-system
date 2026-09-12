import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  beginContextTransition: vi.fn(),
  endContextTransition: vi.fn(),
  rotateRequestContext: vi.fn(),
  resetLogoutGuard: vi.fn(),
}));
// Exercise the provider's real async callbacks and refs without a DOM renderer.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useEffect: () => undefined, useRef: (value: unknown) => ({ current: value }),
    useState: (value: unknown) => [value, () => undefined],
    useMemo: (fn: () => unknown) => fn(), useCallback: (fn: unknown) => fn };
});
vi.mock("next/navigation", () => ({ usePathname: () => "/basic-data", useRouter: () => ({ replace: mocks.replace }) }));
vi.mock("@/lib/api/client", () => ({ default: mocks }));
import { SessionProvider } from "./SessionContext";
const user = (companyId: number) => ({
  userId: "u", tenantId: "t", tenantName: "Tenant", tenantPlanName: "Pro", companyId,
  companyCode: `C${companyId}`, companyNameAr: "شركة", companyNameEn: "Company",
  companies: [1, 2].map(id => ({ id, companyCode: `C${id}`, nameAr: "شركة", nameEn: "Company" })),
  userName: "user", email: "u@example.test", firstName: "", lastName: "", roles: [], permissions: [],
  tenantSubscriptionStatus: "active", tenantSubscriptionEndsOn: null, tenantReadOnly: false, expiresAt: Date.now() + 60000,
});
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
function setup(responses: Array<Response | Promise<Response>>) {
  vi.stubGlobal("window", { location: { pathname: "/basic-data", search: "" }, matchMedia: () => ({ matches: true }), setTimeout, dispatchEvent: vi.fn() });
  const fetchMock = vi.fn().mockImplementation(async () => responses.shift()!);
  vi.stubGlobal("fetch", fetchMock);
  const element = SessionProvider({ children: null });
  return { value: element.props.value as { refresh(): Promise<void>; logout(): Promise<void>; switchCompany(id: number): Promise<void> }, fetchMock };
}
describe("company switch provider callbacks", () => {
  it("does not redirect on invalid first session followed by verified retry", async () => {
    const { value, fetchMock } = setup([response({ user: user(1) }), response({}), response({ user: null }), response({ user: user(2) })]);
    await value.refresh(); await value.switchCompany(2);
    expect(mocks.replace).not.toHaveBeenCalled(); expect(fetchMock).toHaveBeenCalledTimes(4);
  });
  it("redirects only after both verification attempts fail", async () => {
    const { value, fetchMock } = setup([response({ user: user(1) }), response({}), response({ user: null }), response({ user: null })]);
    await value.refresh(); await expect(value.switchCompany(2)).rejects.toThrow("Unable to verify");
    expect(mocks.replace).toHaveBeenCalledTimes(1); expect(fetchMock).toHaveBeenCalledTimes(4);
  });
  it("terminates verification on session 401 with login only", async () => {
    const { value, fetchMock } = setup([response({ user: user(1) }), response({}), response({}, 401), response({})]);
    await value.refresh(); await expect(value.switchCompany(2)).rejects.toThrow("expired");
    expect(mocks.replace.mock.calls).toEqual([["/login"]]); expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("releases one context transition per overlapping switch and logout", async () => {
    let resolveSwitch!: (response: Response) => void;
    const pendingSwitch = new Promise<Response>((resolve) => { resolveSwitch = resolve; });
    const { value } = setup([response({ user: user(1) }), pendingSwitch, response({})]);

    await value.refresh();
    const switchPromise = value.switchCompany(2);
    const logoutPromise = value.logout();
    resolveSwitch(response({}));

    await expect(switchPromise).rejects.toThrow("Session is logging out");
    await logoutPromise;
    expect(mocks.beginContextTransition).toHaveBeenCalledTimes(2);
    expect(mocks.endContextTransition).toHaveBeenCalledTimes(2);
  });
});

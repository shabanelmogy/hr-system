import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { LocalizationService } from '../../localization/public-api';
import { sessionFixture } from '../auth.fixture';
import { BrowserAuthService } from '../services/browser-auth-service';
import { SessionContextEvents, type ContextHint } from '../services/session-context-events';
import { AuthSession } from './auth-session';

describe('Verified authentication session owner', () => {
  const unauthorized = () => new HttpErrorResponse({ status: 401 });
  const authenticated = { isAuthenticated: true, user: sessionFixture };
  let state: AuthSession;
  let transport: { session: ReturnType<typeof vi.fn>; refresh: ReturnType<typeof vi.fn>; login: ReturnType<typeof vi.fn>; selectTenant: ReturnType<typeof vi.fn>; selectCompany: ReturnType<typeof vi.fn>; switchCompany: ReturnType<typeof vi.fn>; csrf: ReturnType<typeof vi.fn>; resetCsrf: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let localization: { connect: ReturnType<typeof vi.fn> };
  let hint: (value: ContextHint) => void;
  let publish: ReturnType<typeof vi.fn>;
  const first = { ...sessionFixture, companies: [
    { id: 1, companyCode: 'ONE', nameAr: 'الأولى', nameEn: 'First' },
    { id: 2, companyCode: 'TWO', nameAr: 'الثانية', nameEn: 'Second' },
  ] };
  const second = { ...first, companyId: 2, companyCode: 'TWO', companyNameEn: 'Second', companyNameAr: 'الثانية' };
  beforeEach(() => {
    transport = { session: vi.fn().mockRejectedValue(unauthorized()), refresh: vi.fn().mockRejectedValue(unauthorized()),
      login: vi.fn().mockResolvedValue(authenticated), selectTenant: vi.fn(), selectCompany: vi.fn(), switchCompany: vi.fn().mockResolvedValue(second), csrf: vi.fn().mockResolvedValue('synthetic'), resetCsrf: vi.fn(), logout: vi.fn().mockResolvedValue(undefined) };
    localization = { connect: vi.fn().mockResolvedValue(true) };
    publish = vi.fn();
    TestBed.configureTestingModule({ providers: [{ provide: BrowserAuthService, useValue: transport }, { provide: LocalizationService, useValue: localization },
      { provide: SessionContextEvents, useValue: { publish, subscribe: (callback: typeof hint) => { hint = callback; return vi.fn(); } } }] });
    state = TestBed.inject(AuthSession);
  });

  it('deduplicates bootstrap and treats an absent session as normal anonymous state', async () => {
    await Promise.all([state.restore(), state.restore()]);
    expect(transport.session).toHaveBeenCalledTimes(1); expect(transport.refresh).toHaveBeenCalledTimes(1);
    expect(state.user()).toBeNull(); expect(state.error()).toBeNull(); expect(state.restoring()).toBe(false);
  });

  it('restores through refresh and renews CSRF before exposing a verified scope', async () => {
    transport.refresh.mockResolvedValue(sessionFixture); await state.restore();
    expect(transport.resetCsrf).toHaveBeenCalledOnce(); expect(state.user()).toEqual(sessionFixture);
    expect(localization.connect).toHaveBeenLastCalledWith(expect.objectContaining({ userId: sessionFixture.userId, companyId: 1 }));
  });

  it('clears old translations and waits for the verified localization context before exposing identity', async () => {
    let resolve: (value: boolean) => void = () => {};
    localization.connect.mockImplementation((identity: unknown) => identity ? new Promise<boolean>(done => { resolve = done; }) : Promise.resolve(true));
    const pending = state.login({ userName: 'fixture', password: 'synthetic' });
    await vi.waitFor(() => expect(localization.connect).toHaveBeenCalledTimes(2));
    expect(localization.connect).toHaveBeenNthCalledWith(1, null); expect(state.user()).toBeNull();
    resolve(true); expect(await pending).toBe(true); expect(state.user()).toEqual(sessionFixture);
  });

  it('blocks duplicate operations while the actual request is in progress', async () => {
    let resolve: (value: typeof authenticated) => void = () => {};
    transport.login.mockImplementation(() => new Promise<typeof authenticated>(done => { resolve = done; }));
    const first = state.login({ userName: 'fixture', password: 'synthetic' });
    expect(await state.login({ userName: 'fixture', password: 'synthetic' })).toBe(false);
    await Promise.resolve(); resolve(authenticated); expect(await first).toBe(true); expect(transport.login).toHaveBeenCalledOnce();
  });

  it('keeps challenges in memory, cancels them, and refuses an expired selection', async () => {
    transport.login.mockResolvedValue({ isAuthenticated: false, requiresTenantSelection: true, tenantSelectionToken: 'synthetic-challenge',
      tenantSelectionTokenExpiration: new Date(Date.now() - 1_000).toISOString(), tenants: [{ id: 'tenant', identifier: 'TEST', name: 'Fixture' }] });
    expect(await state.login({ userName: 'fixture', password: 'synthetic' })).toBe(false);
    expect(state.user()).toBeNull(); expect(await state.select('tenant')).toBe(false);
    expect(state.error()).toBe('angularAuth.selectionExpired'); expect(state.challenge()).toBeNull(); expect(transport.selectTenant).not.toHaveBeenCalled();
  });

  it('maps API failures to bilingual keys and releases the pending guard', async () => {
    transport.login.mockRejectedValue(unauthorized());
    expect(await state.login({ userName: 'fixture', password: 'synthetic' })).toBe(false);
    expect(state.error()).toBe('angularAuth.invalidCredentials'); expect(state.pending()).toBe(false); expect(state.user()).toBeNull();
  });

  it('clears identity and scoped text on a failed logout while keeping the failure truthful', async () => {
    await state.login({ userName: 'fixture', password: 'synthetic' }); transport.logout.mockRejectedValue(new Error('offline'));
    expect(await state.logout()).toBe(false); expect(state.user()).toBeNull(); expect(state.challenge()).toBeNull();
    expect(state.error()).toBe('angularAuth.logoutFailed'); expect(localization.connect).toHaveBeenLastCalledWith(null);
  });

  it('masks read identity immediately and keeps the last verified header until CSRF and localization commit', async () => {
    state.user.set(first);
    let complete: (value: boolean) => void = () => {};
    localization.connect.mockImplementation((identity: unknown) => identity ? new Promise<boolean>(resolve => complete = resolve) : Promise.resolve(true));
    const pending = state.switchCompany(2);
    expect(state.readIdentity()).toBeNull(); expect(state.user()).toEqual(first); expect(state.contextChanging()).toBe(true);
    expect(await state.switchCompany(2)).toBe(false); expect(await state.logout()).toBe(false);
    await vi.waitFor(() => expect(localization.connect).toHaveBeenCalledTimes(2));
    expect(state.user()).toEqual(first); expect(transport.csrf).toHaveBeenCalledOnce();
    complete(true); expect(await pending).toBe(true);
    expect(state.readIdentity()).toEqual(second); expect(state.pending()).toBe(false);
    expect(transport.switchCompany).toHaveBeenCalledExactlyOnceWith(2); expect(publish).toHaveBeenCalledOnce();
  });

  it('rejects current, unknown, nonpositive, fractional and global choices without a request', async () => {
    state.user.set(first);
    for (const id of [1, 3, 0, -1, 1.5, Number.NaN]) expect(await state.switchCompany(id)).toBe(false);
    state.user.set({ ...first, roles: ['super_admin'] }); expect(await state.switchCompany(2)).toBe(false);
    expect(transport.switchCompany).not.toHaveBeenCalled(); expect(localization.connect).not.toHaveBeenCalled();
  });

  it('recovers an uncertain mutation through session verification without repeating the write', async () => {
    state.user.set(first); transport.switchCompany.mockRejectedValue(new Error('response lost'));
    transport.session.mockRejectedValue(unauthorized()); transport.refresh.mockResolvedValue(second);
    expect(await state.switchCompany(2)).toBe(true); expect(state.user()).toEqual(second);
    expect(transport.switchCompany).toHaveBeenCalledOnce(); expect(transport.refresh).toHaveBeenCalledOnce();
    expect(state.contextError()).toBeNull();
  });

  it('restores authoritative old scope with actionable feedback after a rejected mutation', async () => {
    state.user.set(first); transport.switchCompany.mockRejectedValue(new Error('denied')); transport.session.mockResolvedValue(first);
    expect(await state.switchCompany(2)).toBe(false); expect(state.readIdentity()).toEqual(first);
    expect(state.contextError()).toBe('auth.companySwitchFailed'); expect(state.pending()).toBe(false);
  });

  it('clears protected identity and overrides when mutation outcome cannot be verified', async () => {
    state.user.set(first); transport.switchCompany.mockRejectedValue(new Error('offline')); transport.session.mockRejectedValue(new Error('offline'));
    expect(await state.switchCompany(2)).toBe(false); expect(state.readIdentity()).toBeNull(); expect(state.user()).toBeNull();
    expect(state.error()).toBe('angularAuth.unavailable'); expect(localization.connect).toHaveBeenLastCalledWith(null);
  });

  it('accepts server truth without reporting success for a different actor', async () => {
    state.user.set(first); transport.switchCompany.mockRejectedValue(new Error('raced'));
    transport.session.mockResolvedValue({ ...second, userId: 'other-verified-actor' });
    expect(await state.switchCompany(2)).toBe(false); expect(state.user()?.userId).toBe('other-verified-actor');
    expect(state.contextError()).toBe('auth.companySwitchFailed');
  });

  it('coalesces external hints during a transition and verifies afterward without rebroadcasting', async () => {
    state.user.set(first);
    let resolve: (value: typeof second) => void = () => {};
    transport.switchCompany.mockImplementation(() => new Promise<typeof second>(done => resolve = done));
    transport.session.mockResolvedValue(second);
    const pending = state.switchCompany(2); hint('external'); hint('external'); hint('visible');
    expect(transport.session).not.toHaveBeenCalled(); resolve(second); await pending;
    await vi.waitFor(() => expect(state.pending()).toBe(false));
    expect(transport.session).toHaveBeenCalledOnce(); expect(publish).toHaveBeenCalledOnce();
    expect(state.readIdentity()).toEqual(second);
  });

  it('verifies cross-tab login and logout while ignoring anonymous visibility events', async () => {
    hint('visible'); expect(transport.session).not.toHaveBeenCalled();
    transport.session.mockResolvedValue(first); hint('external');
    await vi.waitFor(() => expect(state.user()).toEqual(first));
    transport.session.mockRejectedValue(unauthorized()); hint('external');
    await vi.waitFor(() => expect(state.user()).toBeNull()); expect(state.readIdentity()).toBeNull();
    expect(publish).not.toHaveBeenCalled();
  });

  it('serializes a module context update with company/logout and independently revalidates identity',async()=>{
    state.user.set(first);transport.session.mockResolvedValue(first);
    let release:(value:boolean)=>void=()=>{};const action=vi.fn(()=>new Promise<boolean>(done=>release=done));
    const pending=state.runScopedContextUpdate(action);expect(state.readIdentity()).toBeNull();expect(state.user()).toEqual(first);
    expect(await state.switchCompany(2)).toBe(false);expect(await state.logout()).toBe(false);expect(await state.runScopedContextUpdate(action)).toBe(false);
    release(true);expect(await pending).toBe(true);expect(transport.session).toHaveBeenCalledOnce();expect(state.readIdentity()).toEqual(first);expect(publish).toHaveBeenCalledOnce();
  });
  it('restores a verified rejected domain outcome but clears an unverified context',async()=>{
    state.user.set(first);transport.session.mockResolvedValue(first);
    expect(await state.runScopedContextUpdate(async()=>false)).toBe(false);expect(state.user()).toEqual(first);
    expect(await state.runScopedContextUpdate(async()=>{throw Error('Unverifiable domain context');})).toBe(false);expect(state.user()).toBeNull();expect(state.error()).toBe('angularAuth.unavailable');
  });
  it('uses server truth after another actor/company wins instead of accepting a stale domain success',async()=>{
    state.user.set(first);transport.session.mockResolvedValue(second);
    expect(await state.runScopedContextUpdate(async()=>true)).toBe(false);expect(state.user()).toEqual(second);
  });
});

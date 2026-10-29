// Drives the real API transport in an isolated migrated SQL fixture. Never prints credentials.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const [root, appOrigin, apiOrigin, firstId, secondId] = process.argv.slice(2);
const { chromium, expect } = createRequire(path.join(root, 'web-next/package.json'))('@playwright/test');
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext(); // TLS validation intentionally enabled.
  const page = await context.newPage();
  await page.goto(appOrigin);
  const result = await page.evaluate(async ({ api, first, second }) => {
    const base = `${api}/api/v1/browser-auth`;
    let csrf;
    const call = async (url, method = 'GET', data, extra = {}) => {
      const response = await fetch(url.startsWith('/') ? `${api}${url}` : `${base}/${url}`, {
        credentials: 'include', method,
        headers: { ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...(csrf ? { 'X-ERP-XSRF': csrf } : {}), ...extra },
        ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
      });
      const text = await response.text();
      return { status: response.status, text, body: text ? JSON.parse(text) : null, cache: response.headers.get('Cache-Control') };
    };
    const check = (condition, label) => { if (!condition) throw new Error(label); };
    const sanitized = response => {
      check(response.status === 200 && response.body.isAuthenticated === true, 'authenticated response');
      check(!/"(?:refreshToken|token|tokenExpiration|refreshTokenExpiration)"\s*:/i.test(response.text), 'credential JSON leak');
      check(response.body.user?.userId && Array.isArray(response.body.user.permissions), 'verified SessionContext');
      check(response.cache?.includes('no-store'), 'private response caching');
    };
    const getCsrf = async () => { const response = await call('csrf'); check(response.status === 200, 'csrf bootstrap'); csrf = response.body.requestToken; };
    const login = async () => {
      await getCsrf();
      const tenant = await call('login', 'POST', { userName: 'browser-user', password: 'BrowserFixture123!' });
      check(tenant.status === 200 && tenant.body.requiresTenantSelection, 'real tenant challenge');
      const tenantRequest = { tenantSelectionToken: tenant.body.tenantSelectionToken, tenantId: 'browser-tenant' };
      const company = await call('select-tenant', 'POST', tenantRequest);
      check(company.status === 200 && company.body.requiresCompanySelection, 'real company challenge');
      check((await call('select-tenant', 'POST', tenantRequest)).status === 401, 'one-use tenant selection');
      const selected = await call('select-company', 'POST', { companySelectionToken: company.body.companySelectionToken, companyId: first });
      sanitized(selected); await getCsrf();
      return selected;
    };
    const missing = await call('login', 'POST', { userName: 'browser-user', password: 'BrowserFixture123!' });
    check(missing.status === 400, 'anonymous login CSRF');
    await login();
    check(!document.cookie.includes('__Host-erp-angular'), 'HttpOnly unavailable to JavaScript');
    sanitized(await call('session'));
    check((await call('/test/read', 'GET', undefined, { Authorization: 'Bearer invalid' })).status === 401, 'invalid header downgrade');
    check((await call('session', 'GET', undefined, { Authorization: 'Bearer invalid' })).status === 401, 'browser mixed identity');
    check((await call('/api/v1/Auth/SwitchCompany', 'POST', { companyId: second })).status === 401, 'legacy credential route Cookie isolation');
    check((await call('/test/write', 'POST')).status === 204, 'permitted Cookie write');
    check((await call('/test/denied', 'POST')).status === 403, 'permission denial');
    const savedCsrf = csrf; csrf = undefined;
    check((await call('/test/write', 'POST')).status === 400, 'business mutation CSRF'); csrf = savedCsrf;
    check((await call('/test/expire', 'POST')).status === 200, 'expiry fixture');
    check((await call('session')).status === 401, 'JWT expiry enforced');
    sanitized(await call('refresh', 'POST')); // Existing identity-bound CSRF survives access expiry.
    await getCsrf();
    const before = (await call('session')).body.user.companyId;
    check((await call('/test/oversize?enabled=true', 'POST')).status === 204, 'capacity fixture');
    const oversized = await call('switch-company', 'POST', { companyId: second });
    check(oversized.status === 400 && oversized.body.title === 'Authentication.BrowserSessionTooLarge', 'precommit capacity admission');
    const retained = await call('session'); sanitized(retained);
    check(retained.body.user.companyId === before, 'capacity rejection preserves old session');
    check((await call('/test/oversize?enabled=false', 'POST')).status === 204, 'capacity reset');
    const switched = await call('switch-company', 'POST', { companyId: second }); sanitized(switched);
    check(switched.body.user.companyId === second, 'verified company switch'); await getCsrf();
    const realtime = await call('realtime-token');
    check(realtime.status === 200 && realtime.body.token.length < 2048, 'bounded realtime token');
    const reload = await call('session'); sanitized(reload);
    return { anonymousCsrf: missing.status, loginAndSelections: true, oneUseSelection: true,
      sanitizedJson: true, expiredJwtSession: 401, expiredJwtRefreshWithCsrf: 200,
      invalidHeaderDenied: true, legacyCookieDenied: true, businessCsrf: 400, permissionDenied: 403,
      oversizeBeforeCommit: 400, companySwitch: second, readonlyDenied: 423, logout: 204, realtimeBounded: true };
  }, { api: apiOrigin, first: Number(firstId), second: Number(secondId) });
  const own = (await context.cookies(apiOrigin)).filter(cookie => cookie.name.startsWith('__Host-erp-angular'));
  assert.ok(own.length >= 3 && own.every(cookie => cookie.httpOnly && cookie.secure && cookie.sameSite === 'Lax' && cookie.path === '/'));
  const access = own.find(cookie => cookie.name === '__Host-erp-angular-access').value;
  const deniedWrite = await context.request.post(`${apiOrigin}/test/write`, { headers: { Origin: 'https://unapproved.invalid' } });
  assert.equal(deniedWrite.status(), 403, 'unapproved Origin cannot write through Cookies');
  const partial = await context.request.get(`${apiOrigin}/test/read`, { headers: {
    Cookie: '__Host-erp-angular-access=chunks-2; __Host-erp-angular-accessC1=partial',
  } });
  assert.equal(partial.status(), 401, 'partial access chunks cannot authenticate');
  const sharedAntiforgery = await context.request.get(`${apiOrigin}/test/global-csrf`);
  assert.equal(sharedAntiforgery.status(), 200);
  assert.ok((await context.cookies(apiOrigin)).some(cookie => cookie.name.startsWith('.AspNetCore.Antiforgery.')));
  const headerWrite = await context.request.post(`${apiOrigin}/test/write`, { headers: { Authorization: `Bearer ${access}` } });
  assert.equal(headerWrite.status(), 204, 'retained header client needs no browser Origin/CSRF');
  const headerSession = await context.request.get(`${apiOrigin}/api/v1/Auth/Session`, { headers: { Authorization: `Bearer ${access}` } });
  assert.equal(headerSession.status(), 200, 'retained legacy header session');
  await page.reload();
  const completed = await page.evaluate(async api => {
    const get = async route => fetch(`${api}/api/v1/browser-auth/${route}`, { credentials: 'include' });
    if ((await get('session')).status !== 200) throw new Error('real page reload continuity');
    let csrf = (await (await get('csrf')).json()).requestToken;
    const post = async route => fetch(`${api}${route}`, { method: 'POST', credentials: 'include', headers: { 'X-ERP-XSRF': csrf } });
    if ((await post('/test/readonly')).status !== 204) throw new Error('readonly fixture');
    if ((await post('/test/write')).status !== 423) throw new Error('readonly mutation denial');
    if ((await post('/api/v1/browser-auth/refresh')).status !== 200) throw new Error('readonly refresh allowed');
    csrf = (await (await get('csrf')).json()).requestToken;
    if ((await post('/api/v1/browser-auth/logout')).status !== 204) throw new Error('actual logout');
    if ((await get('session')).status !== 401) throw new Error('revoked session denied');
    return true;
  }, apiOrigin);
  assert.equal(completed, true);
  assert.equal((await context.cookies(apiOrigin)).filter(cookie => cookie.name.startsWith('__Host-erp-angular')).length, 0);
  const denied = await context.request.get(`${apiOrigin}/api/v1/browser-auth/csrf`, { headers: { Origin: 'https://unapproved.invalid' } });
  assert.equal(denied.status(), 403);
  const absent = await context.request.get(`${apiOrigin}/api/v1/browser-auth/csrf`);
  assert.equal(absent.status(), 403);

  let angularProof={};
  if(process.env.ERPSYSTEM_TEST_ANGULAR_COMPANY_CONTEXT==='1'){
    const {verifyCompanyLive}=await import(pathToFileURL(path.join(root,'web-angular/scripts/verify-company-live-probe.mjs')));
    angularProof=await verifyCompanyLive({browser,expect,root,appOrigin,apiOrigin,first:Number(firstId),second:Number(secondId)});
  }

  // Real reload and retained header wire with a second isolated session.
  await page.reload();
  const failure = await page.evaluate(async ({ api, first }) => {
    let csrf;
    const send = async (route, method = 'GET', body, headers = {}) => fetch(`${api}${route}`, {
      method, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-ERP-XSRF': csrf } : {}), ...headers },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const base = '/api/v1/browser-auth';
    csrf = (await (await send(`${base}/csrf`)).json()).requestToken;
    const challenge = await (await send(`${base}/login`, 'POST', { userName: 'browser-user', password: 'BrowserFixture123!' })).json();
    const company = await (await send(`${base}/select-tenant`, 'POST', { tenantSelectionToken: challenge.tenantSelectionToken, tenantId: 'browser-tenant' })).json();
    const loggedIn = await send(`${base}/select-company`, 'POST', { companySelectionToken: company.companySelectionToken, companyId: first });
    if (loggedIn.status !== 200) throw new Error('second login');
    csrf = (await (await send(`${base}/csrf`)).json()).requestToken;
    if ((await send('/test/fail-logout', 'POST')).status !== 204) throw new Error('failure fixture');
    return (await send(`${base}/logout`, 'POST')).status;
  }, { api: apiOrigin, first: Number(firstId) });
  assert.equal(failure, 503);
  assert.equal((await context.cookies(apiOrigin)).filter(cookie => cookie.name.startsWith('__Host-erp-angular')).length, 0);
  process.stdout.write(JSON.stringify({ ...result, ...angularProof, wrongOrigin: 403, missingOrigin: 403, revocationFailure: failure,
    logoutCookiesCleared: true, httpsValidationEnabled: true, realPasswordAndSqlSelection: true,
    retainedHeaderWithoutCsrf: true, globalHangfireAntiforgeryPreserved: true,
    wrongOriginWrite: 403, partialCookieRejected: 401 }));
} catch (error) {
  // Playwright API failures include request headers in their full message.
  // Preserve the failure/step without emitting Cookie or Authorization material.
  process.stderr.write(String(error).split('\n')[0].replace(/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[redacted token]'));
  process.exitCode = 1;
} finally { await browser.close(); }

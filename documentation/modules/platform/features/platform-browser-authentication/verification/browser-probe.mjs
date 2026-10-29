// Isolated framework probe: no ERP account, session secret or business endpoint.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
const [root, appOrigin, apiOrigin] = process.argv.slice(2);
const require = createRequire(path.join(root, 'web-next/package.json'));
const { chromium } = require('@playwright/test');
const browser = await chromium.launch({ headless: true });
try {
  // HTTPS validation remains enabled; this checks the installed development trust.
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(appOrigin);
  const results = await page.evaluate(async api => {
    const csrf = await fetch(`${api}/csrf`, { credentials: 'include' });
    const { requestToken } = await csrf.json();
    const send = headers => fetch(`${api}/write`, { method: 'POST', credentials: 'include', headers });
    const missing = (await send({})).status;
    const invalid = (await send({ 'X-ERP-XSRF': 'invalid-test-value' })).status;
    const valid = (await send({ 'X-ERP-XSRF': requestToken })).status;
    return { missing, invalid, valid, csrfStatus: csrf.status };
  }, apiOrigin);
  assert.deepEqual(results, { missing: 400, invalid: 400, valid: 204, csrfStatus: 200 });
  const cookies = await context.cookies(apiOrigin);
  const antiforgery = cookies.find(cookie => cookie.name === '__Host-erp-preflight-antiforgery');
  assert.ok(antiforgery?.httpOnly && antiforgery.secure && antiforgery.sameSite === 'Lax');
  assert.equal(await page.evaluate(() => document.cookie.includes('__Host-erp-preflight-antiforgery')), false);
  const unapproved = await context.newPage();
  await unapproved.goto(apiOrigin);
  const wrongOrigin = await unapproved.evaluate(async api => (await fetch(`${api}/write`, { method: 'POST', credentials: 'include' })).status, apiOrigin);
  assert.equal(wrongOrigin, 403);
  const corsDenied = await unapproved.evaluate(async app => {
    try { await fetch(`${app}/csrf`, { credentials: 'include' }); return false; }
    catch { return true; }
  }, appOrigin);
  assert.equal(corsDenied, true);
  const capacity = await page.evaluate(async api => {
    await fetch(`${api}/capacity`, { credentials: 'include' });
    const normal = await fetch(`${api}/cookie-count`, { credentials: 'include' });
    const { cookieHeaderBytes } = await normal.json();
    await fetch(`${api}/over-capacity`, { credentials: 'include' });
    return { normalStatus: normal.status, simultaneousClientCookieBytes: cookieHeaderBytes };
  }, apiOrigin);
  // Kestrel rejects oversized headers before CORS runs. Read that status from
  // the API origin so a CORS network error cannot obscure the server's 431.
  capacity.overflowStatus = await unapproved.evaluate(async () => (await fetch('/cookie-count')).status);
  assert.equal(capacity.normalStatus, 200);
  assert.ok(capacity.simultaneousClientCookieBytes > 28 * 1024 && capacity.simultaneousClientCookieBytes < 32 * 1024);
  assert.equal(capacity.overflowStatus, 431);
  process.stdout.write(JSON.stringify({ ...results, wrongOrigin, corsDenied, ...capacity, httpsValidationEnabled: true, httpOnlySecureCookie: true }));
} finally {
  await browser.close();
}

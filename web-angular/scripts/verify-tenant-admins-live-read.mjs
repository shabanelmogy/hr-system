import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import {
  parseTenantAdmin,
  parseTenantAdmins,
} from '../src/app/platform/tenant-admins/types/tenant-admin.ts';
const origin = process.env.ANGULAR_LIVE_ORIGIN ?? 'https://localhost:4210';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(
  import.meta.dirname,
  '../../.codex-tmp/angular-tenant-admins/live-read-results.json',
);
fs.mkdirSync(path.dirname(output), { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  ignoreHTTPSErrors: true,
  viewport: { width: 1440, height: 1050 },
});
const blocked = [],
  results = [];
await context.route(api + '/**', async (route) => {
  const request = route.request(),
    endpoint = new URL(request.url()).pathname;
  if (
    ['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ||
    endpoint.startsWith('/api/v1/browser-auth/') ||
    endpoint.startsWith('/hubs/')
  )
    return route.continue();
  blocked.push(endpoint);
  await route.abort();
});
const page = await context.newPage();
try {
  await page.goto(origin + '/login');
  await page.locator('.demo-superadmin button').click();
  await expect(page).toHaveURL(origin + '/home', { timeout: 45000 });
  const read = (pathname) =>
    page.evaluate(
      async ({ api, pathname }) => {
        const response = await fetch(api + pathname, { credentials: 'include' });
        return { status: response.status, body: await response.json() };
      },
      { api, pathname },
    );
  const accounts = await read('/api/v1/tenantAdmins/getAll');
  assert.equal(accounts.status, 200);
  const admins = parseTenantAdmins(accounts.body);
  results.push({
    check: 'Authoritative Tenant administrator collection and nested DTO',
    status: accounts.status,
    rows: admins.length,
  });
  if (admins[0]) {
    const detail = await read('/api/v1/tenantAdmins/get/' + encodeURIComponent(admins[0].id));
    assert.equal(detail.status, 200);
    assert.equal(parseTenantAdmin(detail.body).id, admins[0].id);
    results.push({
      check: 'Fresh administrator detail identity',
      status: detail.status,
      hasAssignments: Array.isArray(detail.body.tenants),
    });
  }
  const tenants = await read('/api/v1/tenants/getAll');
  assert.equal(tenants.status, 200);
  assert.ok(Array.isArray(tenants.body));
  results.push({
    check: 'Complete Tenant assignment lookup',
    status: tenants.status,
    rows: tenants.body.length,
  });
  assert.deepEqual(blocked, []);
} finally {
  const logout = await page
    .evaluate(async (api) => {
      const response = await fetch(api + '/api/v1/browser-auth/csrf', { credentials: 'include' });
      if (!response.ok) return response.status;
      const csrf = await response.json();
      return (
        await fetch(api + '/api/v1/browser-auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: { 'X-ERP-XSRF': csrf.requestToken },
        })
      ).status;
    }, api)
    .catch(() => null);
  results.push({ check: 'Owned test-session logout', status: logout });
  fs.writeFileSync(
    output,
    JSON.stringify(
      { origin, api, businessWrites: 0, blockedWrites: blocked.length, results },
      null,
      2,
    ),
  );
  await context.close();
  await browser.close();
}
console.log('Tenant Admins live read passed; no business mutations.');

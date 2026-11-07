import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';

// Existing trusted login only. Business writes are blocked before network dispatch.
const origin = process.env.ANGULAR_LIVE_ORIGIN ?? 'https://localhost:4210';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(
  import.meta.dirname,
  '../../.codex-tmp/angular-tenant-management/live-read-results.json',
);
fs.mkdirSync(path.dirname(output), { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  ignoreHTTPSErrors: true,
  viewport: { width: 1440, height: 1050 },
});
const blockedWrites = [];
const results = [];
await context.route(api + '/**', async (route) => {
  const request = route.request();
  const endpoint = new URL(request.url()).pathname;
  if (
    ['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ||
    endpoint.startsWith('/api/v1/browser-auth/') ||
    endpoint.startsWith('/hubs/')
  )
    return route.continue();
  blockedWrites.push(endpoint);
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
  const list = await read(
    '/api/v1/tenants/getPage?pageNumber=1&pageSize=10&columnName=name&operation=Contains&sortDirection=ASC&includeArchived=false',
  );
  assert.equal(list.status, 200);
  assert.ok(Array.isArray(list.body.items));
  assert.equal(list.body.metaData.pageSize, 10);
  for (const tenant of list.body.items) {
    assert.equal(typeof tenant.id, 'string');
    assert.equal(typeof tenant.rowVersion, 'string');
    assert.equal(tenant.lifecycleStatus, 'active');
    assert.equal(typeof tenant.adminCount, 'number');
    assert.equal(typeof tenant.maxAdmins, 'number');
    assert.ok(tenant.entitlements == null || Array.isArray(tenant.entitlements));
  }
  results.push({
    check: 'Tenant server page and real concurrency/usage DTO',
    status: 200,
    rows: list.body.items.length,
    total: list.body.metaData.totalCount,
  });
  const first = list.body.items[0];
  if (first) {
    const detail = await read('/api/v1/tenants/get/' + encodeURIComponent(first.id));
    assert.equal(detail.status, 200);
    assert.equal(detail.body.id, first.id);
    assert.ok(detail.body.rowVersion);
    results.push({
      check: 'fresh Tenant detail with rowVersion',
      status: 200,
      hasEntitlements: Array.isArray(detail.body.entitlements),
    });
  }
  const catalog = await read('/api/v1/modules/tenant-entitlements');
  assert.equal(catalog.status, 200);
  assert.ok(Array.isArray(catalog.body));
  assert.ok(
    catalog.body.every(
      (module) =>
        typeof module.code === 'string' &&
        typeof module.isDefault === 'boolean' &&
        Array.isArray(module.submodules),
    ),
  );
  results.push({
    check: 'independent assignable module/submodule catalog',
    status: 200,
    modules: catalog.body.length,
  });
  assert.deepEqual(blockedWrites, []);
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
  results.push({ check: 'owned test session logout', status: logout });
  fs.writeFileSync(
    output,
    JSON.stringify({ origin, api, businessWrites: blockedWrites.length, results }, null, 2),
  );
  await context.close();
  await browser.close();
}
console.log(
  `Tenant Management read-only contract checks passed: ${results.length - 1}; no business writes.`,
);

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import {
  parseAuditPage,
  parseAuditFilters,
  parseAuditDetails,
} from '../src/app/platform/system-audit/types/audit-trail.ts';

const origin = process.env.ANGULAR_LIVE_ORIGIN ?? 'https://localhost:4210';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(
  import.meta.dirname,
  '../../.codex-tmp/angular-system-audit/live-read-results.json',
);
fs.mkdirSync(path.dirname(output), { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  ignoreHTTPSErrors: true,
  viewport: { width: 1440, height: 1050 },
});
const results = [],
  blocked = [];
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
  const list = await read('/api/v1/system-audit-trail?pageSize=50');
  assert.equal(list.status, 200);
  const entries = parseAuditPage(list.body);
  results.push({
    check: 'Authoritative system audit cursor page',
    status: list.status,
    rows: entries.items.length,
    hasNextCursor: entries.nextCursor !== null,
  });
  const options = await read('/api/v1/system-audit-trail/filters');
  assert.equal(options.status, 200);
  const modules = parseAuditFilters(options.body);
  results.push({
    check: 'Authoritative module/entity filter choices',
    status: options.status,
    modules: modules.length,
  });
  if (entries.items[0]) {
    const entry = entries.items[0];
    const detail = await read(
      '/api/v1/system-audit-trail/' + encodeURIComponent(entry.moduleCode) + '/' + entry.id,
    );
    assert.equal(detail.status, 200);
    const parsed = parseAuditDetails(detail.body, entry);
    results.push({
      check: 'Fresh module and entry identity with structured field changes',
      status: detail.status,
      changes: parsed.changes.length,
    });
  }
  if (entries.nextCursor) {
    const next = await read(
      '/api/v1/system-audit-trail?pageSize=50&cursor=' + encodeURIComponent(entries.nextCursor),
    );
    assert.equal(next.status, 200);
    const parsed = parseAuditPage(next.body);
    results.push({
      check: 'Opaque next-cursor request',
      status: next.status,
      rows: parsed.items.length,
    });
  }
  await page.goto(origin + '/super-admin/audit-trail');
  await expect(page.getByTestId('system-audit')).toHaveAttribute('data-kind', 'ready', {
    timeout: 45000,
  });
  results.push({ check: 'Actual Angular rendered authorized system audit route', passed: true });
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
  results.push({ check: 'Owned test session logout', status: logout });
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
console.log('System Audit hosted read passed; no business mutations.');

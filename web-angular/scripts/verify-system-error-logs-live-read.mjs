import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import {
  parseErrorLogPage,
  parseErrorLogDetail,
  parseErrorLogSettings,
} from '../src/app/platform/system-error-logs/types/error-log.ts';

const origin = process.env.ANGULAR_LIVE_ORIGIN ?? 'https://localhost:4210';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(
  import.meta.dirname,
  '../../.codex-tmp/angular-system-error-logs/live-read-results.json',
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
const transport = [];
page.on('requestfailed', (request) =>
  transport.push({ path: new URL(request.url()).pathname, error: request.failure()?.errorText }),
);
page.on('response', (response) => {
  if (response.url().startsWith(api + '/') && response.status() >= 400)
    transport.push({ path: new URL(response.url()).pathname, status: response.status() });
});
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
  const list = await read('/api/v1/system-error-logs?page=1&pageSize=25');
  assert.equal(list.status, 200);
  const logs = parseErrorLogPage(list.body);
  results.push({
    check: 'Authoritative system error-log server page',
    status: list.status,
    rows: logs.items.length,
    total: logs.totalCount,
  });
  const row = logs.items[0];
  if (row) {
    const detail = await read('/api/v1/system-error-logs/' + row.id);
    assert.equal(detail.status, 200);
    const parsed = parseErrorLogDetail(detail.body, row.id);
    results.push({
      check: 'Fresh requested detail identity and authorized diagnostics',
      status: detail.status,
      diagnosticEntries: parsed.diagnostics.length,
    });
  }
  const settings = await read('/api/v1/system-error-logs/settings');
  assert.equal(settings.status, 200);
  const parsedSettings = parseErrorLogSettings(settings.body);
  results.push({
    check: 'Independent singleton settings GET; no retention PUT',
    status: settings.status,
    retentionDays: parsedSettings.retentionDays,
    revision: parsedSettings.revision,
  });
  await page.goto(origin + '/super-admin/error-logs');
  await expect(page.getByTestId('system-error-logs')).toHaveAttribute('data-kind', 'ready', {
    timeout: 45000,
  });
  results.push({
    check: 'Actual authorized Angular system-error-log route rendered',
    passed: true,
  });
  await page.goto(origin + '/super-admin/error-log-settings');
  await expect(page.locator('erp-error-log-settings-page erp-metric-card')).toHaveCount(5, {
    timeout: 45000,
  });
  results.push({
    check: 'Actual Angular settings counters rendered read-only verification',
    passed: true,
  });
  assert.deepEqual(blocked, []);
} finally {
  const logout = await page
    .evaluate(async (api) => {
      const response = await fetch(api + '/api/v1/browser-auth/csrf', { credentials: 'include' });
      if (!response.ok) return response.status;
      const token = await response.json();
      return (
        await fetch(api + '/api/v1/browser-auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: { 'X-ERP-XSRF': token.requestToken },
        })
      ).status;
    }, api)
    .catch(() => null);
  results.push({ check: 'Owned verification session logout', status: logout });
  fs.writeFileSync(
    output,
    JSON.stringify(
      {
        verifiedAt: new Date().toISOString(),
        results,
        transport,
        blockedBusinessWrites: blocked,
        businessWrites: 0,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ results, transport, businessWrites: 0 }));
  await context.close();
  await browser.close();
}

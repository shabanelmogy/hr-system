import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';

// Uses the existing demo login on an already running trusted origin. No business writes.
const origin = process.env.ANGULAR_LIVE_ORIGIN ?? 'https://localhost:4210';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(
  import.meta.dirname,
  '../../.codex-tmp/angular-states/live-read-results.json',
);
fs.mkdirSync(path.dirname(output), { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  ignoreHTTPSErrors: true,
  viewport: { width: 1440, height: 1050 },
});
const blockedWrites = [],
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
        const body = await response.json();
        return { status: response.status, body };
      },
      { api, pathname },
    );
  const pageResult = await read(
    '/api/v1/states?pageNumber=1&pageSize=10&status=active&searchField=all&searchOperator=contains&sortBy=createdOn&sortDirection=desc',
  );
  assert.equal(pageResult.status, 200);
  assert.ok(Array.isArray(pageResult.body.items));
  assert.equal(pageResult.body.metaData.pageSize, 10);
  for (const row of pageResult.body.items) {
    assert.equal(row.country.id, row.countryId);
    assert.equal(row.isDeleted, false);
    assert.equal(typeof row.districtsCount, 'number');
  }
  results.push({
    check: 'authenticated State page and actual parent/count DTO',
    status: 200,
    pageRows: pageResult.body.items.length,
    total: pageResult.body.metaData.totalCount,
  });
  const parents = await read('/api/v1/countries/lookup');
  assert.equal(parents.status, 200);
  assert.ok(Array.isArray(parents.body));
  assert.ok(
    parents.body.every((country) => country.isDeleted === false && Number.isInteger(country.id)),
  );
  results.push({ check: 'active Country lookup', status: 200, rows: parents.body.length });
  const first = pageResult.body.items[0];
  if (first) {
    const detail = await read('/api/v1/states/' + first.id);
    assert.equal(detail.status, 200);
    assert.equal(detail.body.id, first.id);
    assert.equal(detail.body.country.id, detail.body.countryId);
    results.push({ check: 'actual State detail', status: 200, parentMatches: true });
    const filtered = await read(
      '/api/v1/states?pageNumber=1&pageSize=10&status=active&countryId=' +
        first.countryId +
        '&hasDistricts=false&searchField=all&searchOperator=contains&sortBy=nameEn&sortDirection=asc',
    );
    assert.equal(filtered.status, 200);
    assert.ok(
      filtered.body.items.every(
        (row) => row.countryId === first.countryId && row.districtsCount === 0,
      ),
    );
    results.push({
      check: 'actual parent and District dependency criteria',
      status: 200,
      rows: filtered.body.items.length,
    });
  }
  assert.deepEqual(blockedWrites, []);
  const catalog = await read('/api/v1/global-crystal-reports?entityKey=states');
  results.push({
    check: 'hosted States report catalog availability (release evidence)',
    status: catalog.status,
    rows: Array.isArray(catalog.body) ? catalog.body.length : null,
  });
} finally {
  const logout = await page
    .evaluate(async (api) => {
      const csrf = await fetch(api + '/api/v1/browser-auth/csrf', { credentials: 'include' });
      if (!csrf.ok) return csrf.status;
      const token = await csrf.json();
      return (
        await fetch(api + '/api/v1/browser-auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: { 'X-ERP-XSRF': token.requestToken },
        })
      ).status;
    }, api)
    .catch(() => null);
  results.push({ check: 'own test session logout', status: logout });
  fs.writeFileSync(
    output,
    JSON.stringify({ origin, api, businessWrites: blockedWrites.length, results }, null, 2),
  );
  await context.close();
  await browser.close();
}
console.log(
  `States live read passed: ${results.length - 1} authenticated read checks; no business writes.`,
);

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { readApiEnvironment, resolveApiOrigin } from './configure-api.mjs';

// Isolated existing demo session. Only authentication/cleanup POSTs are allowed;
// no hosted Country, permission, report publication or business-data mutation.
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4210';
const api = process.env.ANGULAR_API_ORIGIN ?? resolveApiOrigin(readApiEnvironment()).origin;
const output = path.resolve(import.meta.dirname, '../../.codex-tmp/angular-country-live');
fs.mkdirSync(output, { recursive: true });
const core = JSON.parse(
  fs.readFileSync(path.resolve(import.meta.dirname, '../src/locales/generated/core.json'), 'utf8'),
).en;
const browser = await chromium.launch({ channel: 'chrome' }),
  context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
const page = await context.newPage(),
  statuses = [];
let stage = 'login',
  authenticated = false,
  loggedOut = false;
await context.route(api + '/**', async (route) => {
  const request = route.request(),
    url = new URL(request.url());
  assert.ok(
    ['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ||
      url.pathname.startsWith('/api/v1/browser-auth/') ||
      url.pathname.startsWith('/hubs/company') ||
      /^\/api\/v1\/global-crystal-reports\/[a-f\d]{64}\/render$/.test(url.pathname),
    'No hosted business write',
  );
  await route.continue();
});
page.on('response', (response) => {
  const url = new URL(response.url());
  if (url.origin !== api) return;
  if (
    url.pathname.startsWith('/api/v1/browser-auth/') ||
    url.pathname === '/api/v1/countries' ||
    url.pathname.startsWith('/hubs/company') ||
    url.pathname.startsWith('/api/v1/global-crystal-reports')
  )
    statuses.push({
      method: response.request().method(),
      path: url.pathname.replace(/[a-f\d]{64}/g, '[report]'),
      status: response.status(),
    });
  if (url.pathname.endsWith('/browser-auth/login') && response.ok()) authenticated = true;
});
async function logout() {
  return page.evaluate(async (api) => {
    const base = api + '/api/v1/browser-auth',
      csrf = await fetch(base + '/csrf', { credentials: 'include' });
    if (!csrf.ok) return csrf.status;
    const token = (await csrf.json()).requestToken;
    return (
      await fetch(base + '/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-ERP-XSRF': token },
      })
    ).status;
  }, api);
}
try {
  await context.addCookies([{ name: 'i18next', value: 'en', url: origin }]);
  await page.goto(origin + '/login');
  await page.locator('.demo-superadmin button').click();
  await expect(page).toHaveURL(origin + '/home', { timeout: 45000 });
  authenticated = true;
  stage = 'countries-read';
  const before = performance.now();
  await page.goto(origin + '/dev/countries');
  const region = page.getByTestId('countries');
  await expect(region).toHaveAttribute('data-kind', 'ready', { timeout: 45000 });
  const initialReadyMs = Math.round(performance.now() - before);
  assert.ok(statuses.some((x) => x.path === '/api/v1/countries' && x.status === 200));
  stage = 'realtime';
  const live = () =>
    page.evaluate(() =>
      ng.getComponent(document.querySelector('erp-countries-read-page'))?.state.liveStatus(),
    );
  await expect.poll(live, { timeout: 30000 }).toBe('connected');
  const readCount = statuses.filter((x) => x.path === '/api/v1/countries').length;
  await expect
    .poll(() => statuses.filter((x) => x.path === '/api/v1/countries').length)
    .toBeGreaterThanOrEqual(2);
  // Actual dropped-transport/missed-event reconciliation is verified separately
  // with the real SignalR client against deterministic negotiated fixtures.
  stage = 'reload';
  await page.reload();
  await expect(region).toHaveAttribute('data-kind', 'ready', { timeout: 45000 });
  await expect.poll(live, { timeout: 30000 }).toBe('connected');
  stage = 'report-catalog';
  const reports = {
    authorized: await page.evaluate(() =>
      ng.getComponent(document.querySelector('erp-countries-read-page')).canReport(),
    ),
    catalogStatus: null,
    catalogCount: null,
    pdfRendered: false,
    errorVisible: false,
    errorCodes: [],
  };
  if (reports.authorized) {
    const response = page.waitForResponse(
      (r) =>
        new URL(r.url()).pathname === '/api/v1/global-crystal-reports' &&
        r.request().method() === 'GET',
    );
    const header = page.locator('erp-page-header'),
      direct = header.locator('[data-view=report] button');
    if ((await direct.count()) && (await direct.isVisible())) await direct.click();
    else {
      await header.getByRole('button', { name: core['navigation.moreViews'], exact: true }).click();
      await page
        .locator('.overflow-views')
        .getByRole('button', { name: core['views.report'], exact: true })
        .click();
    }
    const catalog = await response;
    reports.catalogStatus = catalog.status();
    if (catalog.status() === 503) {
      const problem = await catalog.json().catch(() => null);
      if (problem?.errors && typeof problem.errors === 'object')
        reports.errorCodes = Object.keys(problem.errors).filter((key) =>
          /^CrystalReport\.[A-Za-z]+$/.test(key),
        );
      await expect(page.locator('erp-global-report-view').getByRole('heading')).toContainText(
        'report',
      );
      reports.errorVisible = true;
    } else {
      assert.equal(catalog.status(), 200);
      const body = await catalog.json();
      assert.ok(Array.isArray(body));
      reports.catalogCount = body.length;
      if (body.length) {
        await expect(page.locator('erp-global-report-view erp-pdf-viewer a[download]')).toBeVisible(
          { timeout: 45000 },
        );
        reports.pdfRendered = true;
      }
    }
  }
  stage = 'logout';
  assert.equal(await logout(), 204);
  loggedOut = true;
  const anonymous = await page.evaluate(
    async (api) =>
      (await fetch(api + '/api/v1/countries?pageNumber=1&pageSize=5', { credentials: 'include' }))
        .status,
    api,
  );
  assert.equal(anonymous, 401);
  stage = 'normal-account-denial';
  await page.goto(origin + '/login');
  loggedOut = false;
  authenticated = false;
  await page.locator('.demo-admin button').click();
  await expect(page).toHaveURL(origin + '/apps', { timeout: 45000 });
  authenticated = true;
  const beforeDenied = statuses.filter((x) => x.path === '/api/v1/countries').length;
  await page.goto(origin + '/dev/countries');
  await expect(region).toHaveAttribute('data-kind', 'forbidden', { timeout: 45000 });
  assert.equal(statuses.filter((x) => x.path === '/api/v1/countries').length, beforeDenied);
  const denied = await page.evaluate(
    async (api) =>
      (await fetch(api + '/api/v1/countries?pageNumber=1&pageSize=5', { credentials: 'include' }))
        .status,
    api,
  );
  assert.equal(denied, 403);
  assert.equal(await logout(), 204);
  loggedOut = true;
  const blocked = reports.catalogStatus === 503 || !reports.pdfRendered;
  fs.writeFileSync(
    path.join(output, 'extended-results.json'),
    JSON.stringify(
      {
        date: new Date().toISOString(),
        frontend: origin,
        api,
        actualApi: true,
        normalTlsValidation: true,
        read200: true,
        initialReadyMs,
        developmentServerTiming: true,
        initialReadCount: readCount,
        realtimeConnected: true,
        reload: true,
        reports,
        logout204: true,
        anonymous401: true,
        normalActor403: true,
        normalActorNoPageRequest: true,
        businessWrites: false,
        missedEventJobDeliveryVerified: false,
        statuses,
        readSecurityPassed: true,
        passed: !blocked,
        blocked,
      },
      null,
      2,
    ),
  );
  console.log(
    'Hosted Countries read, realtime, reload, logout, normal403 and anonymous401 passed. Report acceptance: ' +
      (blocked ? 'BLOCKED by hosted catalog/render availability.' : 'passed.'),
  );
  if (blocked) process.exitCode = 2;
} catch (error) {
  fs.writeFileSync(
    path.join(output, 'failure.json'),
    JSON.stringify(
      {
        date: new Date().toISOString(),
        stage,
        errorType: error?.name ?? 'Error',
        statuses,
        businessWrites: false,
        passed: false,
      },
      null,
      2,
    ),
  );
  throw new Error(
    'Hosted Countries verification failed at ' + stage + '; sanitized status receipt recorded.',
  );
} finally {
  try {
    await context.setOffline(false);
    if (authenticated && !loggedOut) await logout();
  } finally {
    await context.close();
    await browser.close();
  }
}

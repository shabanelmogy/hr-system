import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import {
  parseGlobalReports,
  renderBody,
} from '../src/app/modules/reporting/global-reports/types/global-report.ts';

// One existing demo sign-in, read-only diagnostics/rendering, then owned logout.
// No business mutations, publication, job actions, tokens, report data or file bytes are recorded.
const origin = 'https://localhost:4210';
const api = 'https://shabanhrms.runasp.net';
const output =
  process.env.ERP_PROBE_OUTPUT ??
  path.resolve(
    import.meta.dirname,
    '../../documentation/modules/platform/features/angular-super-admin-final-review/hosted-read-2026-11-07.json',
  );
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ ignoreHTTPSErrors: true });
const page = await context.newPage();
const results = [];
let authenticated = false;
let countryContractFingerprint = null;
await context.route(origin + '/__read-only-verification', (route) =>
  route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><title>Read-only verification</title>',
  }),
);
await page.goto(origin + '/__read-only-verification');
async function request(endpoint, method = 'GET', body) {
  return page.evaluate(
    async ({ api, endpoint, method, body }) => {
      const headers = {};
      if (method === 'POST') {
        const csrfResponse = await fetch(api + '/api/v1/browser-auth/csrf', {
          credentials: 'include',
        });
        if (!csrfResponse.ok) throw Error('CSRF status ' + csrfResponse.status);
        headers['X-ERP-XSRF'] = (await csrfResponse.json()).requestToken;
        headers['Content-Type'] = 'application/json';
      }
      const response = await fetch(api + endpoint, {
        method,
        credentials: 'include',
        headers,
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(120000),
      });
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/pdf')) {
        const bytes = new Uint8Array(await response.arrayBuffer());
        return {
          status: response.status,
          contentType,
          bytes: bytes.length,
          pdfSignature: new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-',
        };
      }
      const text = await response.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {}
      return {
        status: response.status,
        contentType,
        correlationId: response.headers.get('x-correlation-id'),
        json,
        hangfireDocument: /Hangfire/i.test(text) && contentType.includes('text/html'),
      };
    },
    { api, endpoint, method, body },
  );
}
try {
  const login = await request('/api/v1/browser-auth/login', 'POST', {
    userName: process.env.ERP_PROBE_USER ?? 'superadmin',
    password: process.env.ERP_PROBE_PASSWORD ?? 'P@ssword123',
  });
  results.push({ operation: 'single-demo-login', status: login.status });
  assert.equal(login.status, 200, 'One existing demo login; no retry on rejection');
  const session = await request('/api/v1/browser-auth/session');
  authenticated = session.status === 200 && session.json?.isAuthenticated === true;
  results.push({
    operation: 'credentialed-browser-session',
    status: session.status,
    authenticated,
    canExportGlobalData:
      session.json?.user?.permissions?.includes('GlobalDataExports:Export') ?? false,
  });
  assert.ok(authenticated, 'The owned browser session must be authenticated');
  for (const endpoint of [
    '/health',
    '/hangfire',
    '/api/v1/global-crystal-reports/manage/design-sources',
    '/api/v1/global-crystal-reports/manage/entities',
    '/api/v1/global-crystal-reports/manage?entityKey=countries&search=&page=1&pageSize=100&status=',
    '/api/v1/global-crystal-reports/manage/deployment-candidates?entityKey=countries&search=&page=1&pageSize=100',
  ]) {
    const result = await request(endpoint);
    if (endpoint.endsWith('/entities') && Array.isArray(result.json)) {
      countryContractFingerprint =
        result.json.find((item) => item.entityKey === 'countries')?.contractFingerprint ?? null;
    }
    results.push({
      endpoint,
      status: result.status,
      contentType: result.contentType,
      hangfireDocument: result.hangfireDocument,
      publicCode: result.json?.code ?? null,
      publicTitle: result.status >= 400 ? (result.json?.title ?? null) : null,
      itemCount: Array.isArray(result.json)
        ? result.json.length
        : (result.json?.items?.length ?? null),
      totalCount: result.json?.totalCount ?? null,
      publishedCount: Array.isArray(result.json?.items)
        ? result.json.items.filter((item) => item.isPublished === true).length
        : null,
      archivedCount: Array.isArray(result.json?.items)
        ? result.json.items.filter((item) => item.isArchived === true).length
        : null,
    });
    console.log(`Hosted read ${endpoint}: ${result.status}`);
    if (endpoint.includes('/manage?') && Array.isArray(result.json?.items)) {
      for (const report of result.json.items) {
        const detail = await request(
          '/api/v1/global-crystal-reports/manage/' + encodeURIComponent(report.id),
        );
        const published =
          detail.json?.versions?.filter((version) => version.isPublished === true) ?? [];
        results.push({
          operation: 'published-countries-version-validation',
          status: detail.status,
          versions: published.map((version) => ({
            versionNumber: version.versionNumber,
            validationStatus: version.validationStatus,
            validationReasonPresent: !!version.validationReason,
            hasContractFingerprint: !!version.validationContractFingerprint,
            validationContractFingerprint: version.validationContractFingerprint,
            currentContractFingerprint: countryContractFingerprint,
            matchesCurrentContract:
              countryContractFingerprint !== null &&
              version.validationContractFingerprint === countryContractFingerprint,
          })),
        });
      }
    }
  }
  await page.evaluate((api) => {
    const frame = document.createElement('iframe');
    frame.id = 'owned-hangfire-read';
    frame.src = api + '/hangfire';
    document.body.append(frame);
  }, api);
  try {
    await expect(page.frameLocator('#owned-hangfire-read').locator('body')).toContainText(
      'Hangfire',
      { timeout: 15000 },
    );
    results.push({
      operation: 'actual-hangfire-iframe-document',
      visibleDocument: true,
      jobActions: false,
    });
  } catch {
    results.push({
      operation: 'actual-hangfire-iframe-document',
      visibleDocument: false,
      jobActions: false,
    });
  }
  const catalog = await request('/api/v1/global-crystal-reports?entityKey=countries');
  results.push({
    operation: 'countries-catalog',
    status: catalog.status,
    publicCode: catalog.json?.code ?? null,
    publicTitle: catalog.status >= 400 ? (catalog.json?.title ?? null) : null,
  });
  if (catalog.status === 200) {
    const reports = parseGlobalReports(catalog.json, 'countries');
    results.push({ operation: 'published-countries-reports', count: reports.length });
    if (reports[0]) {
      for (const language of ['en', 'ar']) {
        const response = await request(
          '/api/v1/global-crystal-reports/' + encodeURIComponent(reports[0].id) + '/render',
          'POST',
          renderBody(reports[0], { nameAr: '', nameEn: 'Egypt' }, language),
        );
        results.push({
          operation: 'countries-render',
          language,
          status: response.status,
          bytes: response.bytes ?? 0,
          pdfSignature: response.pdfSignature ?? false,
          publicCode: response.json?.code ?? Object.keys(response.json?.errors ?? {})[0] ?? null,
          publicCodes: Object.keys(response.json?.errors ?? {}).filter((code) =>
            /^[A-Za-z0-9._-]{1,100}$/.test(code),
          ),
          correlationId: response.correlationId ?? null,
          publicTitle: response.status >= 400 ? (response.json?.title ?? null) : null,
        });
        console.log(`Hosted Countries render ${language}: ${response.status}`);
      }
    }
  }
} catch (error) {
  results.push({
    operation: 'probe-error',
    error: error instanceof Error ? error.message : 'Unknown probe error',
  });
  process.exitCode = 1;
} finally {
  if (authenticated) {
    try {
      const logout = await request('/api/v1/browser-auth/logout', 'POST', {});
      results.push({ operation: 'owned-logout', status: logout.status });
    } catch {
      results.push({ operation: 'owned-logout', status: 'transport-failure' });
      process.exitCode = 1;
    }
  }
  await fs.writeFile(
    output,
    JSON.stringify(
      {
        dateUtc: new Date().toISOString(),
        scope:
          'Real credentialed browser reads and read-only Countries rendering; no business mutations/deployment/job actions',
        secretsRecorded: false,
        results,
      },
      null,
      2,
    ) + '\n',
  );
  await browser.close();
}

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { read, utils } from 'xlsx';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { tenantFixture } from '../src/app/platform/tenants/management/tenant.fixture.ts';
import { adminFixture } from '../src/app/platform/tenant-admins/tenant-admin.fixture.ts';
import { auditFixture } from '../src/app/platform/system-audit/audit.fixture.ts';
import { systemErrorLogPageFixture } from '../src/app/platform/system-error-logs/error-log.fixture.ts';

// All business data is synthetic. Only the local Reporting formatter produces files.
const root = path.resolve(import.meta.dirname, '..');
const build = path.join(root, 'dist/export-verification/browser');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const proof = 'http://127.0.0.1:7358';
const output = path.resolve(
  root,
  '../.codex-tmp/' +
    (process.argv.includes('--smoke')
      ? 'angular-collection-export-smoke'
      : 'angular-collection-export'),
);
fs.mkdirSync(output, { recursive: true });
const core = JSON.parse(fs.readFileSync(path.join(root, 'src/locales/generated/core.json')));
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const permissions = [
  'GlobalDataExports:Export',
  'Countries:View',
  'Countries:Edit',
  'States:View',
  'States:Edit',
  'Districts:View',
  'Districts:Edit',
  'SystemAuditTrail:View',
  'SystemErrorLogs:View',
  'SystemErrorLogs:Export',
  'GlobalCrystalReports:View',
];
const guid = (index) => `2b92450e-c383-4eee-839f-${String(index + 1).padStart(12, '0')}`;
const fixtures = {
  countries: Array.from({ length: 208 }, (_, index) => ({
    id: index + 1,
    nameAr: `مصر، "اختبار" ${index}`,
    nameEn: `${index < 205 ? 'keep' : 'other'} ${index}`,
    alpha2Code: 'EG',
    alpha3Code: 'EGY',
    phoneCode: '+20',
    currencyCode: 'EGP',
    createdOn: '2026-01-01T00:00:00Z',
    updatedOn: null,
    isDeleted: false,
    statesCount: 4,
  })),
  states: Array.from({ length: 205 }, (_, index) => ({
    id: index + 1,
    nameAr: `محافظة ${index}`,
    nameEn: `State ${index}`,
    code: `S${index}`,
    countryId: 1,
    country: { id: 1, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false },
    createdOn: '2026-01-01T00:00:00Z',
    updatedOn: null,
    isDeleted: false,
    districtsCount: 4,
  })),
  districts: Array.from({ length: 205 }, (_, index) => ({
    id: index + 1,
    nameAr: `منطقة ${index}`,
    nameEn: `District ${index}`,
    code: `D${index}`,
    stateId: 1,
    state: { id: 1, nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 1 },
    createdOn: '2026-01-01T00:00:00Z',
    updatedOn: null,
    isDeleted: false,
    addressesCount: 4,
  })),
  tenants: Array.from({ length: 205 }, (_, index) => ({
    ...tenantFixture,
    id: 't-' + index,
    identifier: 't-' + index,
    name: 'Tenant ' + index,
  })),
  admins: Array.from({ length: 17 }, (_, index) => ({
    ...adminFixture,
    id: 'a-' + index,
    userName: 'admin-' + index,
  })),
  audit: Array.from({ length: 53 }, (_, index) => ({
    ...auditFixture,
    id: index + 1,
    entityKey: String(index + 1),
  })),
  errors: Array.from({ length: 205 }, (_, index) => ({
    ...systemErrorLogPageFixture.items[0],
    id: guid(index),
    summary: 'Synthetic error ' + index,
  })),
  reports: Array.from({ length: 205 }, (_, index) => ({
    id: guid(index),
    entityKey: 'countries',
    reportKey: 'report-' + index,
    displayName: 'Report ' + index,
    description: null,
    updatedOn: '2026-01-01T00:00:00Z',
    currentVersionNumber: 1,
    isPublished: true,
    isArchived: false,
    rowVersion: 'fixture-' + index,
  })),
};
const owners = [
  { key: 'countries', route: '/dev/countries', count: 205, views: ['grid', 'cards'] },
  { key: 'states', route: '/super-admin/geography/states', count: 205, views: ['grid', 'cards'] },
  {
    key: 'districts',
    route: '/super-admin/geography/districts',
    count: 205,
    views: ['grid', 'cards'],
  },
  { key: 'tenants', route: '/super-admin/tenants', count: 205, views: ['grid', 'cards'] },
  { key: 'admins', route: '/super-admin/tenant-admins', count: 17, views: [null] },
  { key: 'audit', route: '/super-admin/audit-trail', count: 53, views: ['grid'] },
  { key: 'errors', route: '/super-admin/error-logs', count: 205, views: ['grid', 'cards'] },
  { key: 'reports', route: '/administration/global-crystal-reports', count: 205, views: [null] },
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const language of process.argv.includes('--smoke') ? ['en'] : ['en', 'ar'])
    for (const mode of process.argv.includes('--smoke') ? ['light'] : ['light', 'dark'])
      for (const width of process.argv.includes('--smoke') ? [1440] : [390, 900, 1440]) {
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          viewport: { width, height: width === 900 ? 640 : 1050 },
          reducedMotion: 'reduce',
          acceptDownloads: true,
        });
        await context.addCookies(
          Object.entries({ i18next: language, currentMode: mode, themePalette: 'green' }).map(
            ([name, value]) => ({ name, value, url: origin }),
          ),
        );
        assert.equal((await context.request.get(proof + '/fixture-health')).status(), 200);
        const errors = [],
          exports = [],
          reads = [];
        let owner;
        let exportMode = 'normal';
        let releaseExport = null;
        let heldExportDone = null;
        await context.route('**/*', async (route) => {
          try {
            const request = route.request(),
              url = new URL(request.url()),
              endpoint = url.pathname;
            if (url.origin === origin && !endpoint.startsWith('/api/')) {
              const relative = decodeURIComponent(endpoint).replace(/^\/+/, '');
              const requested = path.resolve(build, relative);
              assert.ok(requested === build || requested.startsWith(build + path.sep));
              const file = path.extname(relative) ? requested : path.join(build, 'index.html');
              const contentType =
                {
                  '.html': 'text/html',
                  '.js': 'application/javascript',
                  '.css': 'text/css',
                  '.json': 'application/json',
                  '.woff2': 'font/woff2',
                  '.svg': 'image/svg+xml',
                }[path.extname(file)] ?? 'application/octet-stream';
              return route.fulfill(
                fs.existsSync(file)
                  ? { body: fs.readFileSync(file), contentType }
                  : { status: 404, body: '' },
              );
            }
            assert.equal(url.origin, api);
            if (endpoint.startsWith('/api/v1/global-data-exports/')) {
              assert.equal(request.method(), 'POST');
              assert.equal(request.headers()['x-erp-xsrf'], 'export-fixture');
              const payload = request.postDataJSON();
              assert.equal(payload.length, owner.count);
              if (exportMode === 'hold') {
                await new Promise((resolve) => {
                  releaseExport = resolve;
                });
                await route.abort();
                heldExportDone?.();
                return;
              }
              if (exportMode === 'denied') {
                const response = await context.request.post(proof + endpoint, {
                  data: payload,
                  headers: { 'X-ERP-Export-Fixture': 'denied' },
                });
                assert.equal(response.status(), 403);
                await route.fulfill({ status: 403, contentType: 'application/json', body: '{}' });
                return;
              }
              const response = await context.request.post(proof + endpoint, {
                data: payload,
                headers: { 'X-ERP-Export-Fixture': 'global' },
              });
              assert.equal(response.status(), 200, await response.text());
              const body = await response.body();
              exports.push({ owner: owner.key, payload, endpoint, bytes: body.length });
              await route.fulfill({
                status: 200,
                body,
                headers: { 'content-type': response.headers()['content-type'] },
              });
              return;
            }
            assert.equal(request.method(), 'GET', 'Business mutation must never occur');
            let body,
              status = 200;
            if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh'))
              body = {
                isAuthenticated: true,
                user: { ...sessionFixture, roles: ['super_admin'], permissions },
              };
            else if (endpoint.endsWith('/csrf')) body = { requestToken: 'export-fixture' };
            else if (endpoint.endsWith('/runtime'))
              body = { catalogVersion: version, revision: 0, overrides: [] };
            else if (endpoint.endsWith('/modules/accessible')) body = [];
            else if (endpoint.endsWith('/realtime-token')) {
              status = 403;
              body = {};
            } else if (endpoint.endsWith('/countries/lookup'))
              body = [{ id: 1, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false }];
            else if (endpoint.endsWith('/states/lookup')) body = [fixtures.states[0]];
            else if (endpoint.endsWith('/tenants/getAll')) body = [tenantFixture];
            else if (endpoint.endsWith('/tenantAdmins/getAll')) body = fixtures.admins;
            else if (endpoint.endsWith('/modules/tenant-entitlements')) body = [];
            else if (endpoint.endsWith('/system-audit-trail/filters')) body = { modules: [] };
            else if (endpoint.endsWith('/global-crystal-reports/manage/entities'))
              body = [
                {
                  entityKey: 'countries',
                  scope: 'global',
                  filters: [],
                  contractSchemaVersion: 1,
                  contractFingerprint: 'a'.repeat(64),
                },
              ];
            else if (endpoint.endsWith('/global-crystal-reports')) body = [];
            else {
              const query = Object.fromEntries(url.searchParams);
              reads.push({ owner: owner.key, query, endpoint });
              let key = endpoint.endsWith('/tenants/getPage')
                ? 'tenants'
                : endpoint.endsWith('/system-error-logs')
                  ? 'errors'
                  : endpoint.endsWith('/system-audit-trail')
                    ? 'audit'
                    : endpoint.endsWith('/global-crystal-reports/manage')
                      ? 'reports'
                      : endpoint.split('/').at(-1);
              assert.ok(fixtures[key], 'Unexpected request ' + endpoint);
              const term = query.search ?? query.searchValue ?? '';
              const rows =
                key === 'countries' && term
                  ? fixtures[key].filter((row) => row.nameEn.includes(term))
                  : fixtures[key];
              const page = Number(query.pageNumber ?? query.page ?? 1),
                size = Number(query.pageSize ?? 50);
              const items =
                key === 'audit'
                  ? rows.slice(query.cursor ? 50 : 0, query.cursor ? 53 : 50)
                  : rows.slice((page - 1) * size, page * size);
              if (key === 'audit')
                body = { items, nextCursor: query.cursor ? null : 'fixture-next' };
              else if (key === 'errors')
                body = { items, totalCount: rows.length, page, pageSize: size };
              else if (key === 'reports') body = { items, totalCount: rows.length };
              else
                body = {
                  items,
                  metaData: {
                    currentPage: page,
                    pageNumber: page,
                    pageSize: size,
                    totalCount: rows.length,
                    totalPages: Math.ceil(rows.length / size),
                    hasPrev: page > 1,
                    hasNext: page * size < rows.length,
                  },
                };
            }
            await route.fulfill({
              status,
              contentType: 'application/json',
              body: JSON.stringify(body),
            });
          } catch (error) {
            errors.push(String(error));
            await route.abort();
          }
        });
        const page = await context.newPage();
        let downloads = 0;
        page.on('download', () => downloads++);
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('dialog', async (dialog) => {
          errors.push('Unexpected native dialog');
          await dialog.dismiss();
        });
        for (owner of owners) {
          await page.goto(origin + owner.route);
          const header = page.locator('erp-page-header').first();
          await expect(header.locator('erp-collection-export-menu button').first()).toBeVisible();
          if (owner.key === 'countries') {
            await page.locator('.collection-toolbar input').first().fill('keep');
            await expect.poll(() => reads.at(-1)?.query.search).toBe('keep');
          }
          for (const view of owner.views) {
            if (view) await header.locator(`[data-view="${view}"] button`).click();
            for (const format of ['csv', 'xlsx']) {
              const menu = header.locator('erp-collection-export-menu');
              await menu
                .getByRole('button', { name: core[language]['actions.export'], exact: true })
                .click();
              const download = page.waitForEvent('download');
              await page
                .getByRole('menuitem', {
                  name: core[language]['collectionExport.' + (format === 'csv' ? 'csv' : 'excel')],
                  exact: true,
                })
                .click();
              const file = await download;
              assert.ok(file.suggestedFilename().endsWith('.' + format));
              const buffer = fs.readFileSync(await file.path());
              const book = read(buffer, { type: 'buffer', raw: true });
              const rows = utils.sheet_to_json(book.Sheets[book.SheetNames[0]], {
                header: 1,
                defval: null,
              });
              assert.equal(rows.length, owner.count + 1);
              assert.equal(rows[0].length, Object.keys(exports.at(-1).payload[0]).length);
              assert.deepEqual(rows[0], Object.keys(exports.at(-1).payload[0]));
              for (const [rowIndex, record] of exports.at(-1).payload.entries()) {
                for (const [columnIndex, value] of Object.values(record).entries()) {
                  const protectedValue =
                    format === 'csv' &&
                    typeof value === 'string' &&
                    /^[\s\p{Cc}]*[=+\-@]/u.test(value)
                      ? "'" + value
                      : value;
                  assert.equal(
                    String(rows[rowIndex + 1][columnIndex] ?? '').replace(/\r\n/g, '\n'),
                    String(protectedValue ?? '').replace(/\r\n/g, '\n'),
                    `${owner.key}/${format} row ${rowIndex} column ${columnIndex}`,
                  );
                }
              }
              assert.ok(!rows[0].includes(core[language]['actions.title']));
              if (owner.key === 'countries') {
                assert.ok(buffer.includes(Buffer.from('مصر')) || format === 'xlsx');
                assert.equal(exports.at(-1).payload.length, 205);
                assert.ok(
                  reads
                    .filter((item) => item.owner === 'countries' && item.query.pageSize === '200')
                    .every((item) => item.query.search === 'keep'),
                );
              }
              const overflow = await page.evaluate(() => ({
                x: document.documentElement.scrollWidth - innerWidth,
                y: document.documentElement.scrollHeight - innerHeight,
              }));
              assert.ok(overflow.x <= 1, `${owner.key} horizontal overflow ${overflow.x}`);
              assert.ok(overflow.y <= 1, `${owner.key} vertical overflow ${overflow.y}`);
              results.push({
                language,
                mode,
                width,
                owner: owner.key,
                view,
                format,
                rows: rows.length - 1,
                overflow,
              });
            }
          }
        }
        // Exercise cancellation and forbidden feedback through the real shared UI.
        owner = owners[0];
        await page.goto(origin + owner.route);
        await page.locator('.collection-toolbar input').first().fill('keep');
        await expect.poll(() => reads.at(-1)?.query.search).toBe('keep');
        const exportMenu = page.locator('erp-page-header erp-collection-export-menu').first();
        const requestCsv = async () => {
          await exportMenu
            .getByRole('button', { name: core[language]['actions.export'], exact: true })
            .click();
          await page
            .getByRole('menuitem', { name: core[language]['collectionExport.csv'], exact: true })
            .click();
        };
        const beforeCancelled = downloads;
        const completedHold = new Promise((resolve) => {
          heldExportDone = resolve;
        });
        exportMode = 'hold';
        await requestCsv();
        await expect.poll(() => releaseExport !== null).toBe(true);
        await exportMenu
          .getByRole('button', { name: core[language]['actions.cancel'], exact: true })
          .click();
        releaseExport();
        await completedHold;
        exportMode = 'normal';
        const nextDownload = page.waitForEvent('download');
        await requestCsv();
        await nextDownload;
        assert.equal(downloads, beforeCancelled + 1, 'Cancelled export must not download later');
        exportMode = 'denied';
        await requestCsv();
        await expect(
          page
            .getByRole('dialog')
            .getByText(core[language]['collectionExport.forbidden'], { exact: true }),
        ).toBeVisible();
        await expect(exportMenu).not.toBeVisible();
        assert.equal(downloads, beforeCancelled + 1, 'Denied export must not download');
        results.push({
          language,
          mode,
          width,
          scenarios: ['cancel-without-late-download', 'formatter-denied-with-feedback'],
        });
        assert.deepEqual(errors, []);
        await page.screenshot({ path: path.join(output, `${language}-${mode}-${width}.png`) });
        await context.close();
        console.log(`Collection export passed ${language}/${mode}/${width}`);
      }
} finally {
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  await browser.close();
}

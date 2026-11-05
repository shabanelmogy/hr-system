import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const root = path.resolve(import.meta.dirname, '../../../../../web-angular');
const require = createRequire(path.join(root, 'package.json'));
const { chromium, expect } = await import(
  pathToFileURL(path.join(path.dirname(require.resolve('@playwright/test')), 'index.mjs')).href
);
const { themePaletteOrder } = await import(pathToFileURL(require.resolve('@app/tokens')).href);
const { sessionFixture } = await import(
  pathToFileURL(path.join(root, 'src/app/platform/auth/auth.fixture.ts')).href
);
const { dashboardFixture } = await import(
  pathToFileURL(path.join(root, 'src/app/platform/tenants/dashboard.fixture.ts')).href
);
const { globalReportFixture: report } = await import(
  pathToFileURL(path.join(root, 'src/app/modules/reporting/global-reports/report.fixture.ts')).href
);
const { reportPdfFixture } = await import(
  pathToFileURL(path.join(root, 'scripts/support/report-pdf-fixture.mjs')).href
);
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220',
  api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(root, '../.codex-tmp/angular-merge-report-smoke');
fs.mkdirSync(output, { recursive: true });
const core = JSON.parse(
    fs.readFileSync(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
  ),
  country = JSON.parse(
    fs.readFileSync(path.join(root, 'src/locales/generated/reference-countries.json'), 'utf8'),
  );
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const smoke = process.argv.includes('--smoke'),
  focused = process.argv.includes('--focused'),
  pdf = reportPdfFixture(),
  results = [],
  browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const palette of smoke || focused ? ['green'] : themePaletteOrder)
    for (const mode of smoke ? ['light'] : ['light', 'dark'])
      for (const language of smoke ? ['en'] : ['en', 'ar'])
        for (const width of smoke
          ? [process.argv.includes('--compact') ? 390 : 1440]
          : [390, 1440]) {
          const context = await browser.newContext({
            ignoreHTTPSErrors: true,
            viewport: { width, height: width === 390 ? 780 : 1050 },
            reducedMotion: 'reduce',
            acceptDownloads: true,
          });
          await context.addCookies(
            Object.entries({ themePalette: palette, currentMode: mode, i18next: language }).map(
              ([name, value]) => ({ name, value, url: origin }),
            ),
          );
          await context.addInitScript(
            ({ fallback }) => {
              const make = URL.createObjectURL.bind(URL),
                revoke = URL.revokeObjectURL.bind(URL);
              window.pdfLeases = { created: [], revoked: [] };
              URL.createObjectURL = (blob) => {
                const url = make(blob);
                window.pdfLeases.created.push(url);
                return url;
              };
              URL.revokeObjectURL = (url) => {
                window.pdfLeases.revoked.push(url);
                revoke(url);
              };
              if (fallback) Object.defineProperty(navigator, 'pdfViewerEnabled', { value: false });
            },
            { fallback: focused && width === 390 },
          );
          const state = {
            mode: 'ready',
            permitted: true,
            hash: report.rowVersion,
            catalogs: 0,
            renders: [],
            countryReads: [],
            sessions: 0,
            hold: false,
            waiting: false,
            release: () => {},
            holdCsrf: false,
            csrfWaiting: false,
            releaseCsrf: () => {},
          };
          const errors = [],
            apiErrors = [];
          await context.route(api + '/api/**', async (route) => {
            try {
              const request = route.request(),
                url = new URL(request.url()),
                p = url.pathname;
              let body,
                status = 200;
              assert.equal(request.headers().authorization, undefined);
              if (p.endsWith('/realtime-token')) {
                status = 403;
                body = {};
              } else if (p.endsWith('/csrf')) {
                if (state.holdCsrf) {
                  state.holdCsrf = false;
                  state.csrfWaiting = true;
                  await new Promise((resolve) => (state.releaseCsrf = resolve));
                  state.csrfWaiting = false;
                }
                body = { requestToken: 'report-csrf-fixture' };
              } else if (p.endsWith('/session') || p.endsWith('/refresh')) {
                state.sessions++;
                body = {
                  isAuthenticated: true,
                  user: {
                    ...sessionFixture,
                    roles: ['super_admin'],
                    permissions: [
                      'Countries:View',
                      ...(state.permitted ? ['GlobalCrystalReports:View'] : []),
                    ],
                  },
                };
              } else if (p.endsWith('/runtime'))
                body = { catalogVersion: version, revision: 0, overrides: [] };
              else if (p.endsWith('/getDashboardSummary')) body = dashboardFixture;
              else if (p.endsWith('/modules/accessible')) body = [];
              else if (p === '/api/v1/countries') {
                const query = Object.fromEntries(url.searchParams);
                state.countryReads.push(query);
                body = {
                  items: [
                    {
                      id: 1,
                      nameAr: 'مصر',
                      nameEn: 'Egypt',
                      alpha2Code: 'EG',
                      alpha3Code: 'EGY',
                      phoneCode: '20',
                      currencyCode: 'EGP',
                      statesCount: 2,
                      isDeleted: false,
                      createdOn: '2026-01-01T00:00:00Z',
                      updatedOn: null,
                    },
                  ],
                  metaData: {
                    currentPage: Number(query.pageNumber),
                    pageNumber: Number(query.pageNumber),
                    pageSize: Number(query.pageSize),
                    totalCount: 1,
                    totalPages: 1,
                    hasNext: false,
                    hasPrev: false,
                  },
                };
              } else if (p === '/api/v1/global-crystal-reports') {
                state.catalogs++;
                assert.equal(url.searchParams.get('entityKey'), 'countries');
                if (state.mode === 'catalog-error') {
                  status = 503;
                  body = { title: 'Synthetic catalog error' };
                } else
                  body =
                    state.mode === 'empty'
                      ? []
                      : state.mode === 'catalog-invalid'
                        ? [{ broken: true }]
                        : [
                            { ...report, rowVersion: state.hash },
                            {
                              ...report,
                              id: 'c'.repeat(64),
                              rowVersion: 'd'.repeat(64),
                              summarySubject: 'Alternative fixture',
                              summaryTitle: 'تقرير بديل',
                            },
                          ];
              } else if (p.endsWith('/render')) {
                assert.equal(request.method(), 'POST');
                assert.equal(request.headers()['x-erp-xsrf'], 'report-csrf-fixture');
                const value = request.postDataJSON();
                state.renders.push({ ...value, source: p.split('/').at(-2) });
                assert.equal(value.entityKey, 'countries');
                assert.ok(
                  Object.keys(value.filters).every((key) => ['NameAr', 'NameEn'].includes(key)),
                );
                if (state.hold) {
                  state.hold = false;
                  state.waiting = true;
                  await new Promise((resolve) => (state.release = resolve));
                  state.waiting = false;
                }
                if (state.mode === 'stale') status = 409;
                else if (state.mode === 'forbidden') status = 403;
                else if (state.mode === 'validation') status = 400;
                else if (state.mode === 'offline') status = 503;
                else if (state.mode === 'invalid') {
                  await route.fulfill({ contentType: 'application/pdf', body: 'not a PDF' });
                  return;
                } else if (state.mode === 'json') {
                  await route.fulfill({ contentType: 'application/json', body: '{}' });
                  return;
                } else if (state.mode === 'empty-pdf') {
                  await route.fulfill({ contentType: 'application/pdf', body: Buffer.alloc(0) });
                  return;
                }
                if (status === 200) {
                  await route.fulfill({ contentType: 'application/pdf', body: pdf });
                  return;
                }
                body =
                  status === 400
                    ? {
                        errors: {
                          'Filters.NameEn': ['Server fixture rejection'],
                          unknown: ['must stay hidden'],
                        },
                      }
                    : { title: 'Synthetic report rejection' };
              } else throw Error('Unexpected report request ' + request.method() + ' ' + p);
              await route.fulfill({
                status,
                contentType: 'application/json',
                body: JSON.stringify(body),
              });
            } catch (error) {
              if (
                !/Target.*closed|Route is already handled|Invalid InterceptionId|interception.*not found/i.test(
                  String(error),
                )
              ) {
                apiErrors.push(String(error));
                await route.abort().catch(() => {});
              }
            }
          });
          const page = await context.newPage();
          page.on('pageerror', (error) => errors.push(error.message));
          page.on('dialog', async (dialog) => {
            errors.push('Native dialog ' + dialog.type());
            await dialog.dismiss();
          });
          const text = core[language],
            copy = country[language],
            header = page.locator('erp-page-header'),
            view = page.locator('erp-global-report-view'),
            viewer = view.locator('erp-pdf-viewer');
          const input = (id) => view.getByTestId(id).locator('input'),
            search = () => view.getByTestId('criteria').locator('button[type=submit]').click(),
            refresh = () => header.locator('.refresh button').click();
          const pick = async (id) => {
            const direct = header.locator(`[data-view=${id}] button`);
            if (await direct.count()) await direct.click();
            else {
              await header
                .getByRole('button', { name: text['navigation.moreViews'], exact: true })
                .click();
              await page
                .locator('.overflow-views')
                .getByRole('button', { name: text['views.' + id], exact: true })
                .click();
            }
          };

          await page.goto(origin + '/home');
          await page.getByTestId('open-data').getByRole('button').click();
          await page
            .getByRole('complementary')
            .getByRole('button', { name: text['menu.countries'], exact: true })
            .click();
          await expect(page.getByTestId('countries')).toHaveAttribute('data-kind', 'ready');
          if (width === 1440)
            await page
              .locator('.drawer-header')
              .getByRole('button', { name: text['menu.closeSidebar'], exact: true })
              .click();
          await pick('report');
          await expect(viewer).toBeVisible();
          const tabs = view.locator('aside');
          await tabs.getByRole('tab', { name: text['reports.viewerOptions'], exact: true }).click();
          const download = tabs.locator('a[download]');
          await expect(download).toBeVisible();
          await expect(download).toHaveAttribute(
            'download',
            'countries-' + report.id.slice(0, 16) + '.pdf',
          );
          const downloadEvent = page.waitForEvent('download');
          await download.click();
          const receipt = await downloadEvent;
          assert.deepEqual(fs.readFileSync(await receipt.path()), pdf);
          await tabs.getByRole('tab', { name: text['general.search'], exact: true }).click();
          await input('nameAr').fill('مصر');
          let count = state.renders.length;
          await search();
          await expect.poll(() => state.renders.length).toBe(count + 1);
          await expect(viewer).toBeVisible();
          assert.deepEqual(state.renders.at(-1).filters, { NameAr: 'مصر' });
          const frame = (await viewer.locator('iframe').count())
            ? await viewer.locator('iframe').getAttribute('src')
            : null;
          await tabs.getByRole('tab', { name: text['reports.viewerOptions'], exact: true }).click();
          await expect(download).toBeVisible();
          await tabs.getByRole('tab', { name: text['general.search'], exact: true }).click();
          await expect(input('nameAr')).toHaveValue('مصر');
          if (frame) await expect(viewer.locator('iframe')).toHaveAttribute('src', frame);
          await input('nameEn').evaluate((element) => {
            element.value = 'x'.repeat(201);
            element.dispatchEvent(new Event('input', { bubbles: true }));
          });
          count = state.renders.length;
          await search();
          await expect(view.locator('.error-summary a')).toHaveCount(1);
          await expect(input('nameEn')).toBeFocused();
          assert.equal(state.renders.length, count);
          await input('nameEn').fill('Egypt');
          state.mode = 'validation';
          await search();
          await expect(view.getByTestId('nameEn').locator('.error')).toHaveText(
            'Server fixture rejection',
          );
          await expect(input('nameEn')).toBeFocused();
          await expect(viewer).toHaveCount(0);
          await expect(view).not.toContainText('must stay hidden');
          state.mode = 'ready';
          await input('nameEn').fill('Recovered');
          await search();
          await expect(viewer).toBeVisible();
          await view.getByTestId('reset').getByRole('button').click();
          await expect(input('nameAr')).toHaveValue('');
          await expect(input('nameEn')).toHaveValue('');
          await expect(viewer).toBeVisible();
          assert.deepEqual(errors, []);
          assert.deepEqual(apiErrors, []);
          results.push({
            mode,
            language,
            width,
            passed: true,
            sidebarActions: true,
            nativeValidation: true,
            serverErrors: true,
            pdfDownload: true,
            recovery: true,
          });
          await context.close();
          console.log('Merged Report passed ' + mode + '/' + language + '/' + width);
        }
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}

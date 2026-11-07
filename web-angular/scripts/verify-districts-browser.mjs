import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { utils, write } from 'xlsx';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { globalReportFixture } from '../src/app/modules/reporting/global-reports/report.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(root, '../.codex-tmp/angular-districts');
fs.mkdirSync(output, { recursive: true });
const resource = (name) =>
  JSON.parse(fs.readFileSync(path.join(root, `src/locales/generated/${name}.json`), 'utf8'));
const core = resource('core'),
  districts = resource('reference-districts');
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const workbook = () => {
  const book = utils.book_new();
  utils.book_append_sheet(
    book,
    utils.aoa_to_sheet([
      ['nameAr', 'nameEn', 'code', 'stateName'],
      ['أسوان', 'Aswan', 'ASW', 'Cairo'],
      ['الأقصر', 'Luxor', 'LUX', 'القاهرة'],
      ['مكرر', 'Aswan', 'ASW', 'Cairo'],
      ['ناقص', 'Missing', 'MIS', 'Unknown'],
    ]),
    'Import',
  );
  return Buffer.from(write(book, { type: 'buffer', bookType: 'xlsx' }));
};
function pdfFixture() {
  const stream = 'BT /F1 18 Tf 36 140 Td (District fixture) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 420 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let text = '%PDF-1.4\n';
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(text));
    text += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }
  const xref = Buffer.byteLength(text);
  text += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => String(offset).padStart(10, '0') + ' 00000 n \n')
    .join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(text);
}
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const language of process.argv.includes('--smoke') ? ['en'] : ['en', 'ar'])
    for (const mode of process.argv.includes('--smoke') ? ['light'] : ['light', 'dark'])
      for (const width of process.argv.includes('--smoke') ? [1440] : [390, 1440]) {
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          viewport: { width, height: 1050 },
          reducedMotion: 'reduce',
          acceptDownloads: true,
        });
        await context.addCookies(
          Object.entries({ i18next: language, currentMode: mode, themePalette: 'green' }).map(
            ([name, value]) => ({ name, value, url: origin }),
          ),
        );
        const states = [
          { id: 1, nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 1 },
          { id: 2, nameAr: 'الرياض', nameEn: 'Riyadh', code: 'RYD', countryId: 2 },
        ];
        const entries = Array.from({ length: 18 }, (_, index) => ({
          id: index + 1,
          nameAr: 'منطقة ' + (index + 1),
          nameEn: 'District ' + (index + 1),
          code: 'ST' + (index + 1),
          stateId: (index % 2) + 1,
          state: states[index % 2],
          createdOn: `2026-01-${String(index + 1).padStart(2, '0')}T00:00:00Z`,
          updatedOn: null,
          isDeleted: index === 17,
          addressesCount: index % 3,
        }));
        const writes = [],
          queries = [],
          renders = [],
          errors = [];
        let stage = 'navigate';
        await context.route('**/api/**', async (route) => {
          try {
            const request = route.request(),
              url = new URL(request.url()),
              endpoint = url.pathname;
            assert.equal(url.origin, api);
            assert.equal(request.headers().authorization, undefined);
            let status = 200,
              body;
            if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh'))
              body = {
                isAuthenticated: true,
                user: {
                  ...sessionFixture,
                  roles: ['super_admin'],
                  permissions: [
                    'Districts:View',
                    'Districts:Create',
                    'Districts:Edit',
                    'Districts:Archive',
                    'Districts:Restore',
                    'States:View',
                    'GlobalCrystalReports:View',
                  ],
                  tenantReadOnly: false,
                },
              };
            else if (endpoint.endsWith('/csrf')) body = { requestToken: 'district-fixture-csrf' };
            else if (endpoint.endsWith('/realtime-token')) {
              status = 403;
              body = {};
            } else if (endpoint.endsWith('/runtime'))
              body = { catalogVersion: version, revision: 0, overrides: [] };
            else if (endpoint.endsWith('/modules/accessible')) body = [];
            else if (endpoint === '/api/v1/states/lookup') body = states;
            else if (endpoint.endsWith('/global-crystal-reports')) {
              assert.equal(url.searchParams.get('entityKey'), 'districts');
              body = [
                {
                  ...globalReportFixture,
                  entityKey: 'districts',
                  reportKey: 'districts',
                  displayName: 'Districts fixture',
                  summarySubject: 'Districts fixture',
                  summaryTitle: 'تقرير المناطق',
                },
              ];
            } else if (endpoint.endsWith('/render')) {
              const payload = request.postDataJSON();
              assert.equal(payload.entityKey, 'districts');
              renders.push(payload);
              await route.fulfill({ contentType: 'application/pdf', body: pdfFixture() });
              return;
            } else if (endpoint === '/api/v1/districts' && request.method() === 'GET') {
              queries.push(Object.fromEntries(url.searchParams));
              const page = Number(url.searchParams.get('pageNumber') ?? 1),
                size = Number(url.searchParams.get('pageSize') ?? 10),
                search = (url.searchParams.get('search') ?? '').toLowerCase();
              const statusFilter = url.searchParams.get('status'),
                parent = url.searchParams.get('stateId'),
                has = url.searchParams.get('hasAddresses');
              const matching = entries.filter(
                (row) =>
                  (statusFilter === 'all' || row.isDeleted === (statusFilter === 'archived')) &&
                  (!parent || row.stateId === Number(parent)) &&
                  (!has || row.addressesCount > 0 === (has === 'true')) &&
                  (!search ||
                    [row.nameAr, row.nameEn, row.code, row.state.nameEn, row.state.nameAr].some(
                      (value) => value.toLowerCase().includes(search),
                    )),
              );
              const sort = url.searchParams.get('sortBy'),
                direction = url.searchParams.get('sortDirection') === 'desc' ? -1 : 1;
              matching.sort(
                (a, b) =>
                  String(sort === 'state' ? a.state.nameEn : a[sort]).localeCompare(
                    String(sort === 'state' ? b.state.nameEn : b[sort]),
                  ) * direction,
              );
              body = {
                items: matching.slice((page - 1) * size, page * size),
                metaData: {
                  currentPage: page,
                  pageNumber: page,
                  pageSize: size,
                  totalCount: matching.length,
                  totalPages: Math.ceil(matching.length / size),
                  hasPrev: page > 1,
                  hasNext: page * size < matching.length,
                },
              };
            } else if (endpoint === '/api/v1/districts' && request.method() === 'POST') {
              const payload = request.postDataJSON();
              writes.push({ method: 'create', payload });
              assert.equal(request.headers()['x-erp-xsrf'], 'district-fixture-csrf');
              body = {
                id: 100,
                ...payload,
                state: states.find((state) => state.id === payload.stateId),
                createdOn: '2026-11-05T00:00:00Z',
                updatedOn: null,
                isDeleted: false,
              };
              entries.unshift({ ...body, addressesCount: 0 });
              status = 201;
            } else if (endpoint === '/api/v1/districts/bulk') {
              const payload = request.postDataJSON();
              writes.push({ method: 'import', payload });
              assert.equal(payload.districts.length, 2);
              assert.ok(payload.districts.every((district) => district.stateId === 1));
              status = 201;
              body = { createdCount: payload.districts.length };
            } else if (endpoint === '/api/v1/districts/bulk-archive') {
              const payload = request.postDataJSON();
              writes.push({ method: 'bulk', payload });
              for (const row of entries) if (payload.ids.includes(row.id)) row.isDeleted = true;
              body = { archivedCount: payload.ids.length };
            } else if (/\/api\/v1\/districts\/\d+(?:\/restore)?$/.test(endpoint)) {
              const id = Number(endpoint.split('/')[4]),
                row = entries.find((row) => row.id === id);
              assert.ok(row);
              if (request.method() === 'DELETE') {
                row.isDeleted = true;
                writes.push({ method: 'archive', id });
                status = 204;
              } else if (endpoint.endsWith('/restore')) {
                row.isDeleted = false;
                writes.push({ method: 'restore', id });
                status = 204;
              } else if (request.method() === 'PUT') {
                const payload = request.postDataJSON();
                Object.assign(row, payload, {
                  state: states.find((state) => state.id === payload.stateId),
                });
                writes.push({ method: 'edit', payload, id });
                body = row;
              } else {
                const { addressesCount: _, ...detail } = row;
                body = detail;
              }
            } else throw Error('Unexpected Districts API ' + endpoint);
            await route.fulfill({
              status,
              contentType: 'application/json',
              body: status === 204 ? '' : JSON.stringify(body),
            });
          } catch (error) {
            errors.push(String(error));
            await route.abort().catch(() => {});
          }
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('dialog', async (dialog) => {
          errors.push('Native dialog');
          await dialog.dismiss();
        });
        const text = core[language],
          districtText = districts[language],
          workspace = page.locator('.workspace[data-testid=districts]'),
          header = page.locator('erp-page-header');
        const pick = async (id) => {
          const button = header.locator(`[data-view=${id}] button`);
          if (await button.isVisible()) await button.click();
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
        const row = () => workspace.locator('[data-collection-row]').first();
        try {
          await page.goto(origin + '/super-admin/geography/districts');
          await expect(workspace).toHaveAttribute('data-kind', 'ready', { timeout: 60000 });
          await expect(workspace.locator('tbody [data-collection-row]')).toHaveCount(10);
          stage = 'selection';
          await workspace.locator('thead th.selection-cell input').check();
          await expect(workspace.locator('.selection-summary')).toContainText('10');
          await workspace.locator('.selection-summary').getByRole('button').click();
          stage = 'paging';
          await workspace.locator('[data-collection-row]').last().click();
          await workspace
            .locator('erp-collection-footer')
            .getByRole('button', { name: text['pagination.goToNextRecord'], exact: true })
            .click();
          await expect.poll(() => queries.at(-1)?.pageNumber).toBe('2');
          await workspace.getByTestId('reset').getByRole('button').click();
          await expect.poll(() => queries.at(-1)?.pageNumber).toBe('1');
          stage = 'cards';
          await pick('cards');
          await expect(page.locator('erp-district-card-header').first()).toBeVisible();
          await workspace.getByTestId('status').getByRole('combobox').click();
          await page
            .getByRole('option', { name: districtText['districts.status.archived'], exact: true })
            .click();
          await expect.poll(() => queries.at(-1)?.status).toBe('archived');
          await workspace.getByTestId('reset').getByRole('button').click();
          await expect.poll(() => queries.at(-1)?.status).toBe('active');
          stage = 'parent filters';
          await workspace
            .locator('erp-district-list-criteria')
            .getByRole('combobox', { name: districtText['districts.state'], exact: true })
            .click();
          await page
            .getByRole('option', { name: language === 'ar' ? 'القاهرة' : 'Cairo', exact: true })
            .click();
          await expect.poll(() => queries.at(-1)?.stateId).toBe('1');
          await workspace
            .locator('erp-district-list-criteria')
            .getByRole('combobox', { name: districtText['districts.addressesFilter'], exact: true })
            .click();
          await page
            .getByRole('option', { name: districtText['districts.withoutAddresses'], exact: true })
            .click();
          await expect.poll(() => queries.at(-1)?.hasAddresses).toBe('false');
          await workspace.getByTestId('reset').getByRole('button').click();
          await expect.poll(() => queries.at(-1)?.stateId).toBeUndefined();
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-cards.png`),
            fullPage: true,
          });
          stage = 'detail';
          await row().getByRole('button', { name: text['actions.view'], exact: true }).click();
          await expect(
            page.getByRole('dialog', { name: districtText['districts.view'], exact: true }),
          ).toBeVisible();
          await page
            .getByRole('dialog', { name: districtText['districts.view'], exact: true })
            .getByRole('button', { name: text['actions.close'], exact: true })
            .last()
            .click();
          stage = 'create';
          await header
            .getByRole('button', { name: districtText['districts.add'], exact: true })
            .click();
          const editor = page.getByRole('dialog', {
            name: districtText['districts.add'],
            exact: true,
          });
          await editor
            .locator('erp-form form')
            .getByRole('button', { name: districtText['districts.add'], exact: true })
            .click();
          await expect(editor.locator('[aria-invalid=true]')).toHaveCount(4);
          await expect(editor.getByLabel(text['general.nameAr'], { exact: false })).toBeFocused();
          await editor.getByLabel(text['general.nameAr'], { exact: false }).fill('محافظة الاختبار');
          await editor.getByRole('button', { name: text['actions.cancel'], exact: true }).click();
          const unsaved = page.getByRole('dialog', {
            name: text['messages.unsavedChangesTitle'],
            exact: true,
          });
          await expect(unsaved).toBeVisible();
          await unsaved
            .locator('.dialog-actions')
            .getByRole('button', { name: text['actions.cancel'], exact: true })
            .click();
          await expect(editor.getByLabel(text['general.nameAr'], { exact: false })).toHaveValue(
            'محافظة الاختبار',
          );
          await editor
            .getByLabel(text['general.nameEn'], { exact: false })
            .fill('Browser District');
          await editor.getByLabel(districtText['districts.code'], { exact: false }).fill('TST');
          await editor.locator('erp-reference-field p-select').click();
          await page
            .getByRole('option', { name: language === 'ar' ? 'القاهرة' : 'Cairo', exact: true })
            .click();
          await editor
            .locator('erp-form form')
            .getByRole('button', { name: districtText['districts.add'], exact: true })
            .click();
          await expect(editor).toHaveCount(0);
          assert.equal(writes.filter((write) => write.method === 'create').length, 1);
          stage = 'edit';
          await row().getByRole('button', { name: text['actions.edit'], exact: true }).click();
          const edit = page.getByRole('dialog', {
            name: districtText['districts.edit'],
            exact: true,
          });
          await expect(edit.getByLabel(text['general.nameEn'], { exact: false })).toHaveValue(
            'Browser District',
          );
          await edit
            .getByLabel(text['general.nameEn'], { exact: false })
            .fill('Browser District Updated');
          await edit.getByRole('button', { name: text['actions.save'], exact: true }).click();
          await expect(edit).toHaveCount(0);
          stage = 'archive';
          await row().getByRole('button', { name: text['actions.archive'], exact: true }).click();
          const confirmation = page.getByRole('dialog', {
            name: districtText['districts.archiveTitle'],
            exact: true,
          });
          await confirmation
            .getByRole('button', { name: text['actions.archive'], exact: true })
            .click();
          await expect(confirmation).toHaveCount(0);
          stage = 'restore';
          await workspace.getByTestId('status').getByRole('combobox').click();
          await page
            .getByRole('option', { name: districtText['districts.status.archived'], exact: true })
            .click();
          await row().getByRole('button', { name: text['actions.restore'], exact: true }).click();
          const restore = page.getByRole('dialog', {
            name: districtText['districts.restoreTitle'],
            exact: true,
          });
          await restore.getByRole('button', { name: text['actions.restore'], exact: true }).click();
          await expect(restore).toHaveCount(0);
          await workspace.getByTestId('reset').getByRole('button').click();
          await expect.poll(() => queries.at(-1)?.status).toBe('active');
          stage = 'bulk';
          await workspace
            .locator('[data-collection-row]')
            .nth(0)
            .locator('p-checkbox input')
            .check();
          await workspace
            .locator('[data-collection-row]')
            .nth(1)
            .locator('p-checkbox input')
            .check();
          await workspace.getByTestId('archive-selected').getByRole('button').click();
          const bulk = page.getByRole('dialog', {
            name: districtText['districts.bulkArchiveTitle'],
            exact: true,
          });
          await bulk
            .getByRole('button', {
              name: districtText['districts.bulkArchiveConfirm'].replace('{{count}}', '2'),
              exact: true,
            })
            .click();
          await expect(bulk).toHaveCount(0);
          stage = 'chart';
          await pick('chart');
          await expect(page.locator('erp-chart-panel')).toHaveCount(4);
          await expect(page.locator('erp-metric-card')).toHaveCount(4);
          stage = 'report';
          await pick('report');
          await expect.poll(() => renders.length).toBe(1);
          assert.equal(renders[0].entityKey, 'districts');
          const report = page.locator('erp-global-report-view');
          await report.getByTestId('stateAr').locator('input').fill('القاهرة');
          await report.getByTestId('stateEn').locator('input').fill('Cairo');
          await report
            .getByRole('button', { name: text['reports.searchUpper'], exact: true })
            .click();
          await expect.poll(() => renders.length).toBe(2);
          assert.deepEqual(renders[1].filters, { StateAr: 'القاهرة', StateEn: 'Cairo' });
          await report.getByTestId('reset').getByRole('button').click();
          await expect.poll(() => renders.length).toBe(3);
          assert.deepEqual(renders[2].filters, {});
          await expect(report.getByTestId('stateAr').locator('input')).toHaveValue('');
          await expect(report.getByTestId('stateEn').locator('input')).toHaveValue('');
          await page
            .locator('erp-global-report-view')
            .getByRole('tab', { name: text['reports.viewerOptions'], exact: true })
            .click();
          await expect(page.locator('erp-global-report-view aside a[download]')).toBeVisible();
          stage = 'import';
          await pick('import');
          const view = page.locator('erp-district-import-view');
          await view.locator('input[type=file]').setInputFiles({
            name: 'districts.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            buffer: workbook(),
          });
          await expect(view.locator('tbody tr')).toHaveCount(4);
          await view.getByTestId('import-submit').getByRole('button').click();
          await expect(view).toContainText(districtText['districts.import.unknownState']);
          await expect(view).toContainText(
            districtText['districts.import.duplicateField'].replace('{{row}}', '2'),
          );
          assert.equal(writes.filter((write) => write.method === 'import').length, 1);
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-import.png`),
            fullPage: true,
          });
          assert.ok(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          );
          const geometry = await page.evaluate(() =>
            Object.fromEntries(
              [
                'erp-districts-page',
                'erp-districts-page > main',
                '.workspace',
                'erp-district-import-view',
                'erp-spreadsheet-import-panel',
                'erp-spreadsheet-import-panel erp-surface-card',
              ].map((selector) => {
                const element = document.querySelector(selector);
                const rect = element.getBoundingClientRect();
                return [
                  selector,
                  {
                    top: rect.top,
                    bottom: rect.bottom,
                    height: rect.height,
                    display: getComputedStyle(element).display,
                  },
                ];
              }),
            ),
          );
          assert.ok(
            geometry['erp-spreadsheet-import-panel erp-surface-card'].bottom >= 1018,
            JSON.stringify(geometry),
          );
          assert.deepEqual(errors, []);
          results.push({
            geometry,
            language,
            mode,
            width,
            passed: true,
            writes: writes.map((write) => write.method),
            queryCount: queries.length,
            renders: renders.length,
          });
          console.log(`Districts passed ${language}/${mode}/${width}`);
        } catch (error) {
          await page
            .screenshot({ path: path.join(output, 'failure.png'), fullPage: true })
            .catch(() => {});
          throw Error(`Districts ${language}/${mode}/${width} at ${stage}: ${error}`, {
            cause: error,
          });
        } finally {
          await context.close();
        }
      }
  fs.writeFileSync(
    path.join(output, process.argv.includes('--smoke') ? 'smoke-results.json' : 'results.json'),
    JSON.stringify(results, null, 2),
  );
} finally {
  await browser.close();
}

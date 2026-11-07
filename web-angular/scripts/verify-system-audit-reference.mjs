import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium, expect } from '@playwright/test';
import {
  auditFixture,
  auditDetailFixture,
} from '../src/app/platform/system-audit/audit.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const requireNext = createRequire(path.resolve(root, '../web-next/package.json'));
const { enUS, arSD } = requireNext('@mui/x-data-grid/locales');
const smoke = process.argv.includes('--smoke');
const origin = process.env.NEXT_REFERENCE_ORIGIN ?? 'http://localhost:3100';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname));
const output = path.resolve(root, '../.codex-tmp/angular-system-audit/reference');
fs.mkdirSync(output, { recursive: true });
const core = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const language of smoke ? ['en'] : ['en', 'ar'])
    for (const mode of smoke ? ['light'] : ['light', 'dark'])
      for (const width of smoke ? [1440] : [390, 1440]) {
        const context = await browser.newContext({
          viewport: { width, height: 1050 },
          reducedMotion: 'reduce',
          timezoneId: 'Africa/Cairo',
        });
        await context.addCookies(
          Object.entries({ i18next: language, currentMode: mode, themePalette: 'green' }).map(
            ([name, value]) => ({ name, value, url: origin }),
          ),
        );
        const login = await context.request.post(origin + '/api/v1/auth/login', {
          headers: { origin },
          data: { username: 'superadmin', password: 'P@ssword123' },
        });
        assert.equal(login.status(), 200);
        const queries = [],
          errors = [],
          writes = [];
        const caption = (key) => core[language]['auditLog.' + key];
        const gridText = (language === 'ar' ? arSD : enUS).components.MuiDataGrid.defaultProps
          .localeText;
        const rows = Array.from({ length: 50 }, (_, index) => ({
          ...auditFixture,
          id: index + 1,
          entityKey: String(index + 1),
          entityDisplay: 'Item ' + (index + 1),
        }));
        rows[1] = { ...rows[1], moduleCode: 'reference-data', entityName: 'Country', id: 1 };
        await context.route(origin + '/api/v1/system-audit-trail**', async (route) => {
          const request = route.request(),
            url = new URL(request.url());
          if (request.method() !== 'GET') {
            writes.push(request.method());
            return route.abort();
          }
          let body;
          if (url.pathname.endsWith('/filters'))
            body = {
              modules: [
                { moduleCode: 'hr', entityNames: ['Department', 'JobTitle'] },
                { moduleCode: 'reference-data', entityNames: ['Country', 'State'] },
              ],
            };
          else if (url.pathname.endsWith('/system-audit-trail')) {
            queries.push(Object.fromEntries(url.searchParams));
            body = { items: rows, nextCursor: null };
          } else body = auditDetailFixture;
          return route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
        });
        const page = await context.newPage();
        page.setDefaultNavigationTimeout(120000);
        page.on('pageerror', (error) => errors.push(error.message));
        try {
          await page.goto(origin + '/super-admin/audit-trail', { waitUntil: 'commit' });
          await expect(page.locator('.MuiDataGrid-row').first()).toBeVisible({ timeout: 120000 });
          await expect(page.locator('html')).toHaveAttribute('data-app-ready', 'true', {
            timeout: 30000,
          });
          await expect(page.locator('html')).toHaveAttribute('lang', language);
          await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
          assert.equal(queries[0].pageSize, '50');
          await expect(page.getByPlaceholder(caption('recordKey'))).toBeVisible();
          const seenColumns = new Set();
          for (const fraction of [0, 0.5, 1, 0]) {
            await page.locator('.MuiDataGrid-virtualScroller').evaluate(
              async (element, { fraction, language }) => {
                element.scrollLeft =
                  (element.scrollWidth - element.clientWidth) *
                  fraction *
                  (language === 'ar' ? -1 : 1);
                await new Promise((resolve) =>
                  requestAnimationFrame(() => requestAnimationFrame(resolve)),
                );
              },
              { fraction, language },
            );
            for (const field of await page
              .locator('.MuiDataGrid-columnHeader[data-field]')
              .evaluateAll((elements) =>
                elements.map((element) => element.getAttribute('data-field')),
              ))
              seenColumns.add(field);
          }
          const columns = [...seenColumns];
          for (const field of [
            'occurredOn',
            'action',
            'entityDisplay',
            'moduleCode',
            'userName',
            'changeCount',
          ])
            assert.ok(columns.includes(field), field);
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-grid.png`),
            fullPage: true,
          });
          await page.locator('.MuiDataGrid-row').first().click();
          const dialog = page.getByRole('dialog', { name: caption('entities.Department') });
          await expect(dialog).toBeVisible({ timeout: 15000 });
          await expect(dialog.locator('dl dt')).toHaveCount(4);
          await expect(dialog).toContainText('Browser Administrator');
          await expect(dialog.locator('.MuiDataGrid-row').first()).toBeVisible();
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-detail.png`),
            fullPage: true,
          });
          const detailGrid = dialog.locator('.MuiDataGrid-root');
          await expect(detailGrid.locator('.MuiDataGrid-columnHeaderCheckbox')).toBeVisible();
          const localReads = queries.length;
          await detailGrid
            .getByRole('button', {
              name: core[language]['pagination.goToLastRecord'],
              exact: true,
            })
            .click();
          await expect(detailGrid.locator('.MuiDataGrid-row')).toHaveCount(6);
          await detailGrid
            .getByRole('button', {
              name: core[language]['pagination.goToFirstRecord'],
              exact: true,
            })
            .click();
          await detailGrid.locator('.MuiDataGrid-columnHeader[data-field="oldValue"]').click();
          await expect(detailGrid.locator('.MuiDataGrid-row').first()).toContainText(
            caption('empty'),
          );
          await detailGrid.locator('.MuiDataGrid-columnHeader[data-field="oldValue"]').click();
          await expect(detailGrid.locator('.MuiDataGrid-row').first()).toContainText('Before 9');
          assert.equal(queries.length, localReads);
          const filtersTrigger = detailGrid
            .getByRole('button', { name: gridText.toolbarFiltersLabel, exact: true })
            .and(detailGrid.locator('button[aria-haspopup="true"]'));
          await filtersTrigger.click();
          const filterForm = page.locator('.MuiDataGrid-filterForm');
          await expect(filterForm).toBeVisible();
          const chooseFilter = async (label, value, optionLabel) => {
            const control =
              label === gridText.filterPanelOperator
                ? filterForm
                    .locator('.MuiDataGrid-filterFormOperatorInput')
                    .locator('select, [role="combobox"]')
                : filterForm.getByRole('combobox', { name: label, exact: true });
            if (await control.evaluate((element) => element.tagName === 'SELECT'))
              await control.selectOption(value);
            else {
              await control.click();
              await page.getByRole('option', { name: optionLabel, exact: true }).click();
            }
          };
          await chooseFilter(gridText.filterPanelColumn, 'oldValue', caption('oldValue'));
          const operatorControl = filterForm
            .locator('.MuiDataGrid-filterFormOperatorInput')
            .locator('select, [role="combobox"]');
          if (await operatorControl.evaluate((element) => element.tagName === 'SELECT'))
            await expect(operatorControl.locator('option')).toHaveCount(9);
          await chooseFilter(
            gridText.filterPanelOperator,
            'isEmpty',
            gridText.filterOperatorIsEmpty,
          );
          await expect(detailGrid.locator('.MuiDataGrid-row')).toHaveCount(1);
          await expect(detailGrid).toContainText('<script>literal text</script>');
          await chooseFilter(
            gridText.filterPanelOperator,
            'contains',
            gridText.filterOperatorContains,
          );
          await filterForm.locator('.MuiDataGrid-filterFormValueInput input').fill('before 2');
          await expect(detailGrid.locator('.MuiDataGrid-row')).toHaveCount(7);
          await filtersTrigger.click();
          await expect(filterForm).toHaveCount(0);
          assert.equal(queries.length, localReads);
          await page.keyboard.press('Escape');
          await expect(dialog).toHaveCount(0);
          await page
            .locator('main')
            .getByRole('button', { name: core[language]['navigation.filter'], exact: true })
            .click();
          for (const key of ['module', 'recordType', 'action'])
            await expect(
              page.getByRole('combobox', { name: caption(key), exact: false }),
            ).toBeVisible();
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-filters.png`),
            fullPage: true,
          });
          assert.deepEqual(writes, []);
          assert.deepEqual(errors, []);
          results.push({
            language,
            mode,
            width,
            passed: true,
            columns,
            listRequests: queries.length,
            businessWrites: 0,
          });
          console.log(`System Audit Next reference passed ${language}/${mode}/${width}`);
        } catch (error) {
          await page
            .screenshot({ path: path.join(output, 'failure.png'), fullPage: true })
            .catch(() => {});
          throw error;
        } finally {
          await context.close();
        }
      }
} finally {
  fs.writeFileSync(
    path.join(output, smoke ? 'smoke-results.json' : 'results.json'),
    JSON.stringify(results, null, 2),
  );
  await browser.close();
}

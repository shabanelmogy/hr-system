import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { serveAngularFixtureBuild } from './angular-build-browser-fixture.mjs';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import {
  auditFixture,
  auditDetailFixture,
} from '../src/app/platform/system-audit/audit.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(
  process.env.AUDIT_BROWSER_ARTIFACTS ?? path.join(root, '../.codex-tmp/angular-system-audit'),
);
fs.mkdirSync(output, { recursive: true });
const resources = (scope) =>
  JSON.parse(fs.readFileSync(path.join(root, `src/locales/generated/${scope}.json`), 'utf8'));
const core = resources('core');
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const smoke = process.argv.includes('--smoke');
const compact = process.argv.includes('--compact');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const language of smoke ? ['en'] : ['en', 'ar'])
    for (const mode of smoke ? ['light'] : ['light', 'dark'])
      for (const width of smoke ? [1440] : [390, 1440]) {
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          reducedMotion: 'reduce',
          timezoneId: 'Africa/Cairo',
          viewport: { width, height: compact ? 740 : 1050 },
        });
        await serveAngularFixtureBuild(
          context,
          root,
          origin,
          process.env.ANGULAR_FIXTURE_BUILD
            ? path.resolve(process.env.ANGULAR_FIXTURE_BUILD)
            : undefined,
        );
        await context.addCookies(
          Object.entries({ i18next: language, currentMode: mode, themePalette: 'green' }).map(
            ([name, value]) => ({ name, value, url: origin }),
          ),
        );
        const queries = [],
          details = [],
          errors = [],
          writes = [];
        let denyExportRead = false;
        let deniedExportReads = 0;
        const text = core[language],
          caption = (key) => text['auditLog.' + key];
        await context.route('**/api/**', async (route) => {
          try {
            const request = route.request(),
              url = new URL(request.url()),
              endpoint = url.pathname;
            assert.equal(url.origin, api);
            const filteredRead =
              request.method() === 'POST' && endpoint.endsWith('/system-audit-trail/query');
            if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) && !filteredRead) {
              writes.push(endpoint);
              throw Error('Unexpected mutation');
            }
            let status = 200,
              body;
            if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh'))
              body = {
                isAuthenticated: true,
                user: {
                  ...sessionFixture,
                  roles: ['super_admin'],
                  permissions: ['SystemAuditTrail:View', 'GlobalDataExports:Export'],
                  tenantReadOnly: false,
                },
              };
            else if (endpoint.endsWith('/csrf')) body = { requestToken: 'audit-fixture-token' };
            else if (endpoint.endsWith('/runtime'))
              body = { catalogVersion: version, revision: 0, overrides: [] };
            else if (endpoint.endsWith('/realtime-token')) {
              status = 403;
              body = {};
            } else if (endpoint.endsWith('/modules/accessible')) body = [];
            else if (endpoint.endsWith('/system-audit-trail/filters'))
              body = {
                modules: [
                  { moduleCode: 'hr', entityNames: ['Department', 'JobTitle'] },
                  { moduleCode: 'reference-data', entityNames: ['Country', 'State'] },
                ],
              };
            else if (endpoint.endsWith('/system-audit-trail') || filteredRead) {
              const query = filteredRead
                ? request.postDataJSON()
                : Object.fromEntries(url.searchParams);
              if (filteredRead)
                assert.equal(request.headers()['x-erp-xsrf'], 'audit-fixture-token');
              queries.push(query);
              assert.equal(Number(query.pageSize), 25);
              assert.ok(!('pageNumber' in query));
              let rows = Array.from({ length: query.cursor ? 3 : 25 }, (_, index) => ({
                ...auditFixture,
                id: (query.cursor ? 26 : 1) + index,
                entityKey: String((query.cursor ? 26 : 1) + index),
                entityDisplay: 'Item ' + ((query.cursor ? 26 : 1) + index),
              }));
              if (query.cursor) assert.equal(query.cursor, 'opaque+/next==');
              else
                rows[1] = {
                  ...rows[1],
                  id: 1,
                  moduleCode: 'reference-data',
                  entityName: 'Country',
                };
              if (query.entityKey) rows = rows.filter((row) => row.entityKey === query.entityKey);
              if (query.moduleCode)
                rows = rows.filter((row) => row.moduleCode === query.moduleCode);
              if (query.entityName)
                rows = rows.filter((row) => row.entityName === query.entityName);
              if (query.action) rows = rows.filter((row) => row.action === query.action);
              if (query.columnFilters) {
                const groups = JSON.parse(query.columnFilters);
                assert.equal(groups.length, 1);
                assert.equal(groups[0].field, 'changeCount');
                assert.equal(groups[0].constraints[0].matchMode, 'equals');
                rows = rows.filter((row) => row.changeCount === groups[0].constraints[0].value);
              }
              if (denyExportRead) {
                deniedExportReads++;
                await route.fulfill({
                  status: language === 'en' ? 401 : 403,
                  contentType: 'application/json',
                  body: '{}',
                });
                return;
              }
              body = {
                items: rows,
                ...(query.includeTotalCount
                  ? { totalCount: query.cursor ? 28 : rows.length === 25 ? 28 : rows.length }
                  : {}),
                nextCursor:
                  query.cursor ||
                  query.entityKey ||
                  query.moduleCode ||
                  query.entityName ||
                  query.action ||
                  query.fromUtc ||
                  query.toUtc ||
                  query.columnFilters
                    ? null
                    : 'opaque+/next==',
              };
            } else if (endpoint.includes('/system-audit-trail/')) {
              const parts = endpoint.split('/');
              const id = Number(parts.at(-1)),
                moduleCode = decodeURIComponent(parts.at(-2));
              details.push({ id, moduleCode });
              body = {
                ...auditDetailFixture,
                entry: {
                  ...auditFixture,
                  id,
                  moduleCode,
                  entityName: moduleCode === 'hr' ? 'Department' : 'Country',
                },
              };
            } else throw Error('Unexpected audit request ' + endpoint);
            await route.fulfill({
              status,
              contentType: 'application/json',
              body: JSON.stringify(body),
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
        const workspace = page.getByTestId('system-audit');
        const grid = workspace.locator('erp-audit-collection > erp-data-table');
        const rows = grid.locator('tbody [data-collection-row]');
        let stage = 'initial';
        try {
          await page.goto(origin + '/super-admin/audit-trail');
          await expect(workspace).toHaveAttribute('data-kind', 'ready', { timeout: 60000 });
          await expect(rows).toHaveCount(25);
          await expect(page.locator('erp-page-header .total-badge')).toHaveCount(0);
          stage = 'shared selection and record navigation';
          const selectPage = grid.getByRole('checkbox', {
            name: text['collections.selectPage'],
            exact: true,
          });
          await selectPage.check();
          await expect(grid.locator('tbody [aria-selected="true"]')).toHaveCount(25);
          await expect(page.getByRole('dialog')).toHaveCount(0);
          await selectPage.uncheck();
          await expect(grid.locator('tbody [aria-selected="true"]')).toHaveCount(0);
          await expect(
            grid.getByRole('button', {
              name: text['pagination.goToLastRecord'],
              exact: true,
            }),
          ).toBeDisabled();
          const navigationReads = queries.length;
          await grid
            .getByRole('button', {
              name: text['pagination.goToNextRecord'],
              exact: true,
            })
            .click();
          assert.equal(queries.length, navigationReads);
          await expect(
            grid.getByRole('button', { name: text['pagination.goToNextRecord'], exact: true }),
          ).toBeVisible();
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-grid.png`),
            fullPage: true,
          });
          stage = 'shared grid options and columns';
          await grid
            .getByRole('button', { name: text['actions.gridOptions'], exact: true })
            .click();
          const options = page.getByRole('dialog', {
            name: text['actions.gridOptions'],
            exact: true,
          });
          await options
            .getByRole('tab', { name: text['collections.columns'], exact: false })
            .click();
          const fieldOption = options.locator(
            '[data-option-column="changeCount"] input[type=checkbox]',
          );
          await fieldOption.uncheck();
          await options
            .locator('.dialog-actions')
            .getByRole('button', { name: text['actions.close'], exact: true })
            .click();
          await expect(grid.locator('th[data-column-key="changeCount"]')).toHaveCount(0);
          await grid
            .getByRole('button', { name: text['actions.gridOptions'], exact: true })
            .click();
          await options
            .getByRole('tab', { name: text['collections.columns'], exact: false })
            .click();
          await fieldOption.check();
          await options
            .locator('.dialog-actions')
            .getByRole('button', { name: text['actions.close'], exact: true })
            .click();
          await expect(grid.locator('th[data-column-key="changeCount"]')).toHaveCount(1);
          stage = 'cursor paging';
          for (let record = 0; record < 25; record++) {
            await grid
              .getByRole('button', { name: text['pagination.goToNextRecord'], exact: true })
              .click();
          }
          await expect(rows).toHaveCount(3);
          assert.equal(queries.at(-1).cursor, 'opaque+/next==');
          const count = queries.length;
          await grid
            .getByRole('button', { name: text['pagination.goToFirstRecord'], exact: true })
            .click();
          await expect(rows).toHaveCount(25);
          assert.equal(queries.length, count);
          stage = 'single click and structured detail';
          await rows.first().click();
          let dialog = page.getByRole('dialog', {
            name: caption('entities.Department'),
            exact: true,
          });
          await expect(dialog).toBeVisible();
          await expect(dialog.locator('erp-record-summary dt')).toHaveCount(4);
          await expect(dialog.locator('erp-record-summary')).toContainText('Browser Administrator');
          const changes = dialog.locator('erp-audit-changes');
          await expect(changes.locator('tbody [data-collection-row]')).toHaveCount(10);
          await expect(changes).toContainText('<script>literal text</script>');
          await expect(changes.locator('script')).toHaveCount(0);
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-detail.png`),
            fullPage: true,
          });
          await changes.locator('tbody [data-collection-row]').first().focus();
          await page.keyboard.press('PageDown');
          await expect(changes).toContainText('After 10');
          stage = 'detail local sorting selection and record navigation';
          const localReads = { list: queries.length, detail: details.length };
          await changes
            .getByRole('checkbox', {
              name: text['collections.selectPage'],
              exact: true,
            })
            .check();
          await expect(changes.locator('tbody [aria-selected="true"]')).toHaveCount(10);
          await changes
            .getByRole('button', {
              name: text['pagination.goToLastRecord'],
              exact: true,
            })
            .click();
          await expect(changes.locator('tbody [data-collection-row]')).toHaveCount(6);
          await expect(changes).toContainText('After 25');
          await changes
            .getByRole('button', {
              name: text['pagination.goToFirstRecord'],
              exact: true,
            })
            .click();
          await expect(changes.locator('tbody [data-collection-row]')).toHaveCount(10);
          await changes.locator('th[data-column-key="oldValue"]').click();
          await expect(changes.locator('tbody [data-collection-row]').first()).toContainText(
            caption('empty'),
          );
          await changes.locator('th[data-column-key="oldValue"]').click();
          await expect(changes.locator('tbody [data-collection-row]').first()).toContainText(
            'Before 9',
          );
          await changes.locator('th[data-column-key="field"]').click();
          await expect(changes.locator('tbody [data-collection-row]').first()).toContainText(
            language === 'en' ? '<script>literal text</script>' : 'After 1',
          );
          await changes
            .getByRole('button', {
              name: text['pagination.goToLastRecord'],
              exact: true,
            })
            .click();
          if (language === 'ar')
            await expect(changes.locator('tbody [data-collection-row]').last()).toContainText(
              '<script>literal text</script>',
            );
          stage = 'detail local text filtering';
          const openLocalFilter = async () => {
            await changes
              .getByRole('button', { name: text['collections.filterMenu'], exact: true })
              .click();
            return page.getByRole('dialog', { name: text['collections.filterMenu'], exact: true });
          };
          let localFilter = await openLocalFilter();
          const chooseLocal = async (label, option) => {
            await localFilter.getByRole('combobox', { name: label, exact: true }).click();
            await localFilter.getByRole('option', { name: option, exact: true }).click();
          };
          await localFilter
            .getByRole('textbox', { name: text['collections.filterValue'], exact: true })
            .fill(caption('fields.NameEn'));
          await localFilter
            .getByRole('button', { name: text['collections.apply'], exact: true })
            .click();
          await expect(changes.locator('tbody [data-collection-row]')).toHaveCount(1);
          await expect(changes).toContainText('<script>literal text</script>');
          localFilter = await openLocalFilter();
          await chooseLocal(text['collections.columns'], caption('oldValue'));
          await chooseLocal(text['collections.filterConstraint'], text['collections.isEmpty']);
          await localFilter
            .getByRole('button', { name: text['collections.apply'], exact: true })
            .click();
          await expect(changes.locator('tbody [data-collection-row]')).toHaveCount(1);
          await expect(changes).toContainText('<script>literal text</script>');
          await expect(
            page.getByRole('dialog', { name: text['collections.filterMenu'], exact: true }),
          ).toHaveCount(0);
          localFilter = await openLocalFilter();
          await chooseLocal(text['collections.filterConstraint'], text['collections.contains']);
          await localFilter
            .getByRole('textbox', { name: text['collections.filterValue'], exact: true })
            .fill('before 2');
          await localFilter
            .getByRole('button', { name: text['collections.apply'], exact: true })
            .click();
          await expect(changes.locator('tbody [data-collection-row]')).toHaveCount(7);
          localFilter = await openLocalFilter();
          await chooseLocal(text['collections.filterConstraint'], text['collections.isAnyOf']);
          await localFilter
            .getByRole('textbox', { name: text['collections.filterValue'] + ' 1', exact: true })
            .fill('Before 2');
          await localFilter
            .getByRole('button', { name: text['collections.addValue'], exact: true })
            .click();
          await localFilter
            .getByRole('textbox', { name: text['collections.filterValue'] + ' 2', exact: true })
            .fill('Before 25');
          await localFilter
            .getByRole('button', { name: text['collections.apply'], exact: true })
            .click();
          await expect(changes.locator('tbody [data-collection-row]')).toHaveCount(2);
          await expect(changes).toContainText('Before 25');
          localFilter = await openLocalFilter();
          await localFilter
            .locator('.filter-actions')
            .getByRole('button', { name: text['collections.clear'], exact: true })
            .click();
          await expect(changes.locator('tbody [data-collection-row]')).toHaveCount(10);
          assert.deepEqual({ list: queries.length, detail: details.length }, localReads);
          await dialog
            .locator('.dialog-actions')
            .getByRole('button', { name: caption('close'), exact: true })
            .click();
          await expect(dialog).toHaveCount(0);
          stage = 'composite identity and keyboard';
          await rows.nth(1).focus();
          await page.keyboard.press('Enter');
          dialog = page.getByRole('dialog', { name: caption('entities.Country'), exact: true });
          await expect(dialog).toBeVisible();
          assert.deepEqual(details.at(-1), { id: 1, moduleCode: 'reference-data' });
          await page.keyboard.press('Escape');
          await expect(dialog).toHaveCount(0);
          stage = 'search';
          await grid.getByPlaceholder(caption('recordKey')).fill('24');
          await expect(rows).toHaveCount(1);
          assert.equal(queries.at(-1).entityKey, '24');
          await grid.getByPlaceholder(caption('recordKey')).fill('');
          await expect(rows).toHaveCount(25);
          stage = 'server column filter query';
          await grid
            .locator('th[data-column-key="changeCount"] .p-datatable-column-filter-button')
            .click();
          const columnMenu = page.locator('.p-datatable-filter-overlay');
          await expect(columnMenu).toBeVisible();
          await columnMenu
            .getByRole('textbox', { name: caption('changes'), exact: true })
            .fill('0');
          await columnMenu
            .getByRole('button', { name: text['collections.apply'], exact: true })
            .click();
          await expect(rows).toHaveCount(0);
          assert.equal(JSON.parse(queries.at(-1).columnFilters)[0].constraints[0].value, 0);
          await grid
            .locator('th[data-column-key="changeCount"] .p-datatable-column-filter-button')
            .click();
          await columnMenu.locator('[data-pc-name="pcfilterclearbutton"]').click();
          await expect(rows).toHaveCount(25);
          stage = 'dependent filters';
          await page
            .locator('erp-page-header')
            .getByRole('button', { name: text['navigation.filter'], exact: true })
            .click();
          const criteria = grid.locator('erp-audit-criteria');
          const choose = async (label, value) => {
            await criteria.getByRole('combobox', { name: label, exact: true }).click();
            await page.getByRole('option', { name: value, exact: true }).click();
            await expect(page.getByRole('listbox')).toHaveCount(0);
          };
          await choose(caption('module'), caption('modules.hr'));
          await expect.poll(() => queries.at(-1).moduleCode).toBe('hr');
          await choose(caption('recordType'), caption('entities.Department'));
          await expect.poll(() => queries.at(-1).entityName).toBe('Department');
          await choose(caption('module'), caption('modules.reference-data'));
          await expect.poll(() => queries.at(-1).moduleCode).toBe('reference-data');
          assert.ok(!queries.at(-1).entityName);
          await expect(rows).toHaveCount(1);
          await choose(caption('module'), caption('all'));
          await expect(rows).toHaveCount(25);
          await choose(caption('action'), caption('actions.Created'));
          await expect.poll(() => queries.at(-1).action).toBe('Created');
          await expect(rows).toHaveCount(0);
          await choose(caption('action'), caption('all'));
          await expect(rows).toHaveCount(25);
          stage = 'date boundaries';
          await criteria
            .getByRole('textbox', { name: caption('from'), exact: true })
            .fill('2026-11-06');
          await expect.poll(() => queries.at(-1).fromUtc).toBe('2026-11-05T22:00:00.000Z');
          await criteria
            .getByRole('textbox', { name: caption('to'), exact: true })
            .fill('2026-11-06');
          await expect.poll(() => queries.at(-1).toUtc).toBe('2026-11-06T21:59:59.999Z');
          const geometry = await grid.evaluate((element) => {
            const body = element.querySelector('.table-body').getBoundingClientRect();
            const header = element.querySelector('thead').getBoundingClientRect();
            const controls = element.querySelector('.collection-controls p-scrollarea-viewport');
            return {
              bodyHeight: body.height,
              headerHeight: header.height,
              controlsHeight: controls.clientHeight,
              controlsScrollHeight: controls.scrollHeight,
            };
          });
          assert.ok(geometry.bodyHeight >= geometry.headerHeight + 52, JSON.stringify(geometry));
          if (compact && width === 390)
            assert.ok(geometry.controlsScrollHeight > geometry.controlsHeight);
          // Focus must scroll the bounded controls region and leave the Grid usable.
          for (const field of ['module', 'to']) {
            const control =
              field === 'module'
                ? criteria.getByRole('combobox', { name: caption(field), exact: true })
                : criteria.getByRole('textbox', { name: caption(field), exact: true });
            await control.focus();
            await expect(control).toBeFocused();
            await expect(control).toBeInViewport();
          }
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-filters.png`),
            fullPage: true,
          });
          assert.ok(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth <= innerWidth + 1 &&
                document.documentElement.scrollHeight <= innerHeight + 1,
            ),
          );
          assert.deepEqual(writes, []);
          assert.deepEqual(errors, []);
          stage = 'export read actor-wide denial';
          denyExportRead = true;
          await page.locator('erp-collection-export-menu').getByRole('button').click();
          await page
            .getByRole('menuitem', { name: text['collectionExport.csv'], exact: true })
            .click();
          await expect.poll(() => deniedExportReads).toBe(1);
          await expect(workspace).toHaveAttribute('data-kind', 'forbidden');
          await expect(rows).toHaveCount(0);
          await expect(page.locator('erp-collection-export-menu button')).toHaveCount(0);
          assert.deepEqual(writes, []);
          assert.deepEqual(errors, []);
          results.push({
            language,
            mode,
            width,
            height: compact ? 740 : 1050,
            geometry,
            passed: true,
            listRequests: queries.length,
            detailRequests: details.length,
            businessWrites: 0,
          });
          console.log(`System Audit passed ${language}/${mode}/${width}`);
        } catch (error) {
          console.log(JSON.stringify({ stage, url: page.url(), errors, writes }));
          await page
            .screenshot({ path: path.join(output, 'failure.png'), fullPage: true })
            .catch(() => {});
          throw Error(`System Audit ${language}/${mode}/${width} at ${stage}: ${error}`, {
            cause: error,
          });
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

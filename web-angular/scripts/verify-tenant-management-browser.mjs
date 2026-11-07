import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { tenantFixture } from '../src/app/platform/tenants/management/tenant.fixture.ts';
import { dashboardFixture } from '../src/app/platform/tenants/dashboard.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(root, '../.codex-tmp/angular-tenant-management');
fs.mkdirSync(output, { recursive: true });
const resources = (name) =>
  JSON.parse(fs.readFileSync(path.join(root, `src/locales/generated/${name}.json`), 'utf8'));
const core = resources('core');
const tenants = resources('platform-tenants');
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const smoke = process.argv.includes('--smoke');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const language of smoke ? [process.argv.includes('--arabic') ? 'ar' : 'en'] : ['en', 'ar'])
    for (const mode of smoke ? ['light'] : ['light', 'dark'])
      for (const width of smoke ? [1440] : [390, 1440]) {
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          viewport: { width, height: 1050 },
          reducedMotion: 'reduce',
        });
        await context.addCookies(
          Object.entries({ i18next: language, currentMode: mode, themePalette: 'green' }).map(
            ([name, value]) => ({ name, value, url: origin }),
          ),
        );
        const entries = Array.from({ length: 17 }, (_, index) => ({
          ...tenantFixture,
          id: 'tenant-' + (index + 1),
          identifier: 'tenant-' + (index + 1),
          name: 'Tenant ' + String(index + 1).padStart(2, '0'),
          entitlements: [],
        }));
        const catalog = [
          {
            code: 'hr',
            name: 'Human Resources',
            isDefault: true,
            submodules: [
              { code: 'basic-data', name: 'Basic Data', requiredPermissions: [], entryPath: null },
              { code: 'attendance', name: 'Attendance', requiredPermissions: [], entryPath: null },
            ],
          },
          {
            code: 'acc',
            name: 'Accounting',
            isDefault: false,
            submodules: [
              {
                code: 'ledger-setup',
                name: 'Ledger Setup',
                requiredPermissions: [],
                entryPath: null,
              },
            ],
          },
        ];
        const queries = [],
          writes = [],
          errors = [];
        await context.route('**/api/**', async (route) => {
          try {
            const request = route.request(),
              url = new URL(request.url()),
              endpoint = url.pathname;
            assert.equal(url.origin, api);
            let body,
              status = 200;
            if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh'))
              body = {
                isAuthenticated: true,
                user: {
                  ...sessionFixture,
                  roles: ['super_admin'],
                  permissions: [],
                  tenantReadOnly: false,
                },
              };
            else if (endpoint.endsWith('/runtime'))
              body = { catalogVersion: version, revision: 0, overrides: [] };
            else if (endpoint.endsWith('/csrf')) body = { requestToken: 'tenant-fixture-csrf' };
            else if (endpoint.endsWith('/realtime-token')) {
              status = 403;
              body = {};
            } else if (endpoint.endsWith('/modules/accessible')) body = [];
            else if (endpoint.endsWith('/modules/tenant-entitlements')) body = catalog;
            else if (endpoint.endsWith('/tenants/getDashboardSummary')) body = dashboardFixture;
            else if (endpoint.endsWith('/tenants/getPage')) {
              queries.push(Object.fromEntries(url.searchParams));
              const page = Number(url.searchParams.get('pageNumber')),
                size = Number(url.searchParams.get('pageSize'));
              const term = (url.searchParams.get('searchValue') ?? '').toLowerCase();
              const rows = entries.filter((entry) =>
                [entry.name, entry.identifier, entry.billingEmail ?? ''].some((value) =>
                  value.toLowerCase().includes(term),
                ),
              );
              const column = url.searchParams.get('columnName'),
                direction = url.searchParams.get('sortDirection') === 'DESC' ? -1 : 1;
              rows.sort(
                (left, right) =>
                  String(left[column]).localeCompare(String(right[column])) * direction,
              );
              const pages = Math.ceil(rows.length / size);
              body = {
                items: rows.slice((page - 1) * size, page * size),
                metaData: {
                  currentPage: page,
                  pageNumber: page,
                  pageSize: size,
                  totalCount: rows.length,
                  totalPages: pages,
                  hasPrev: page > 1,
                  hasNext: page < pages,
                },
              };
            } else if (endpoint.includes('/tenants/get/'))
              body = entries.find(
                (entry) => entry.id === decodeURIComponent(endpoint.split('/').at(-1)),
              );
            else if (endpoint.endsWith('/tenants/create')) {
              const payload = request.postDataJSON();
              writes.push({ mode: 'create', payload });
              assert.equal(request.headers()['x-erp-xsrf'], 'tenant-fixture-csrf');
              assert.equal(payload.subscriptionEndsOn, '2027-12-31T23:59:59.000Z');
              assert.deepEqual(payload.entitlements, [
                { moduleCode: 'hr', submoduleCodes: ['basic-data'] },
              ]);
              body = {
                ...tenantFixture,
                ...payload,
                id: 'created-tenant',
                rowVersion: 'created-version',
              };
              entries.unshift(body);
              status = 201;
            } else if (endpoint.includes('/tenants/update/')) {
              const payload = request.postDataJSON(),
                id = decodeURIComponent(endpoint.split('/').at(-1));
              const previous = entries.find((entry) => entry.id === id);
              assert.equal(payload.rowVersion, previous.rowVersion);
              writes.push({ mode: 'edit', payload });
              body = { ...previous, ...payload, rowVersion: 'updated-version' };
              Object.assign(previous, body);
            } else throw Error('Unexpected request: ' + endpoint);
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
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('dialog', async (dialog) => {
          errors.push('Native dialog');
          await dialog.dismiss();
        });
        const text = core[language],
          captions = tenants[language];
        const workspace = page.locator('.workspace[data-testid=tenants]');
        let stage = 'load';
        const pick = async (view) => {
          const button = page.locator(`erp-page-header [data-view=${view}] button`);
          if (await button.isVisible()) await button.click();
          else {
            await page
              .getByRole('button', { name: text['navigation.moreViews'], exact: true })
              .click();
            await page
              .locator('.overflow-views')
              .getByRole('button', { name: text['views.' + view], exact: true })
              .click();
          }
        };
        const tab = (editor, id) =>
          editor.getByRole('tab', { name: captions['tenantManagement.tabs.' + id], exact: true });
        const save = (editor) =>
          editor
            .locator('erp-form form')
            .getByRole('button', { name: text['actions.save'], exact: true });
        const field = (editor, name) =>
          editor.getByRole('textbox', { name: captions['tenantManagement.' + name], exact: false });
        try {
          await page.goto(origin + '/super-admin/tenants');
          await expect(workspace).toHaveAttribute('data-kind', 'ready', { timeout: 60000 });
          await expect(workspace.locator('tbody [data-collection-row]')).toHaveCount(10);
          const listSpacing = await workspace.evaluate((element) => {
            const header = document.querySelector('erp-tenant-management-page erp-page-header');
            const bounds = header.getBoundingClientRect();
            const main = document.querySelector('.workspace-main').getBoundingClientRect();
            return {
              above: bounds.top - main.top,
              below: element.getBoundingClientRect().top - bounds.bottom,
            };
          });
          assert.ok(
            Math.abs(listSpacing.above - (width < 600 ? 68 : 88)) <= 1,
            JSON.stringify(listSpacing),
          );
          assert.ok(
            Math.abs(listSpacing.below - (width < 900 ? 16 : 24)) <= 1,
            JSON.stringify(listSpacing),
          );
          stage = 'paging';
          await workspace.locator('[data-collection-row]').last().click();
          await workspace
            .getByRole('button', { name: text['pagination.goToNextRecord'], exact: true })
            .click();
          await expect.poll(() => queries.at(-1)?.pageNumber).toBe('2');
          await workspace.getByTestId('reset').getByRole('button').click();
          await expect.poll(() => queries.at(-1)?.pageNumber).toBe('1');
          stage = 'server search and sort';
          await workspace
            .getByPlaceholder(captions['tenantManagement.searchPlaceholder'])
            .fill('Tenant 17');
          await expect.poll(() => queries.at(-1)?.searchValue).toBe('Tenant 17');
          await expect(workspace.locator('tbody [data-collection-row]')).toHaveCount(1);
          await workspace.getByTestId('reset').getByRole('button').click();
          await expect(workspace.locator('tbody [data-collection-row]')).toHaveCount(10);
          await workspace.locator('th[data-column-key=identifier]').click();
          await expect.poll(() => queries.at(-1)?.columnName).toBe('identifier');
          stage = 'shared grid options';
          await workspace
            .getByRole('button', { name: text['actions.gridOptions'], exact: true })
            .click();
          const options = page.getByRole('dialog', {
            name: text['actions.gridOptions'],
            exact: true,
          });
          await expect(
            options.getByRole('tab', { name: text['collections.displayOptions'], exact: true }),
          ).toBeVisible();
          await options
            .locator('.dialog-actions')
            .getByRole('button', { name: text['actions.close'], exact: true })
            .click();
          await workspace.getByTestId('reset').getByRole('button').click();
          await expect.poll(() => queries.at(-1)?.columnName).toBe('name');
          stage = 'cards';
          await pick('cards');
          await expect(page.locator('erp-tenant-card-header').first()).toBeVisible();
          await expect(page.locator('erp-tenant-card-content').first()).toContainText('1/2');
          assert.deepEqual(
            await page
              .locator('erp-tenant-card-content')
              .first()
              .evaluate((card) => {
                const broken = [];
                for (const label of card.querySelectorAll(
                  'erp-metric-card header > span:first-child',
                )) {
                  const text = label.firstChild;
                  if (!text) continue;
                  for (const word of text.textContent.matchAll(/\S+/gu)) {
                    const range = document.createRange();
                    range.setStart(text, word.index);
                    range.setEnd(text, word.index + word[0].length);
                    if (range.getClientRects().length > 1) broken.push(word[0]);
                  }
                }
                return broken;
              }),
            [],
            'Metric labels must not split individual words in narrow cards',
          );
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-cards.png`),
            fullPage: true,
          });
          stage = 'create';
          const listReadsBeforeCreate = queries.length;
          await page
            .locator('erp-page-header')
            .getByRole('button', { name: captions['tenantManagement.addTenant'], exact: true })
            .click();
          await expect(page).toHaveURL(origin + '/super-admin/tenants/new');
          const editor = page.locator('erp-tenant-create-page');
          await expect(tab(editor, 'identity')).toHaveAttribute('aria-selected', 'true');
          const layout = await editor.evaluate((element) => {
            const header = element.querySelector('erp-page-header');
            const card = element.querySelector('.editor-card');
            const topbar = document.querySelector('.workspace-toolbar');
            const outer = document.querySelector('.workspace-scroll p-scrollarea-viewport');
            const bounds = header.getBoundingClientRect();
            return {
              headerBorder: parseFloat(getComputedStyle(header).borderTopWidth),
              above: bounds.top - topbar.getBoundingClientRect().bottom,
              below: card.getBoundingClientRect().top - bounds.bottom,
              outerOverflow: outer.scrollHeight - outer.clientHeight,
              pageOverflow: document.documentElement.scrollHeight - innerHeight,
            };
          });
          assert.equal(
            layout.headerBorder,
            1,
            'The creation title must have a shared card surface',
          );
          assert.ok(layout.above <= 12 && layout.above >= 0, JSON.stringify(layout));
          assert.ok(layout.below <= 12 && layout.below >= 0, JSON.stringify(layout));
          assert.ok(layout.outerOverflow <= 1 && layout.pageOverflow <= 1, JSON.stringify(layout));
          await expect(
            editor.locator('erp-page-header .heading-row erp-back-button button'),
          ).toHaveAccessibleName(text['actions.back']);
          assert.equal(
            queries.length,
            listReadsBeforeCreate,
            'Creation must not load the Tenant list',
          );
          stage = 'keyboard tabs';
          await tab(editor, 'identity').focus();
          await page.keyboard.press('End');
          await page.keyboard.press('Enter');
          await expect(tab(editor, 'notes')).toHaveAttribute('aria-selected', 'true');
          await page.keyboard.press('Home');
          await page.keyboard.press('Enter');
          await expect(tab(editor, 'identity')).toHaveAttribute('aria-selected', 'true');
          await save(editor).click();
          await expect(field(editor, 'identifier')).toBeFocused();
          await expect(editor.locator('erp-validation-summary')).toContainText(
            captions['tenantManagement.identifier'],
          );
          await field(editor, 'identifier').fill('browser-tenant');
          await field(editor, 'name').fill('Browser Tenant');
          await expect(editor.locator('erp-tenant-draft-summary h3')).toHaveText('Browser Tenant');
          stage = 'first invalid tab';
          await save(editor).click();
          await expect(tab(editor, 'subscription')).toHaveAttribute('aria-selected', 'true');
          await expect(field(editor, 'endsOn')).toBeFocused();
          await field(editor, 'endsOn').fill('2027-12-31');
          stage = 'summary link';
          await tab(editor, 'identity').click();
          await field(editor, 'identifier').fill('');
          await save(editor).click();
          await tab(editor, 'notes').click();
          await editor
            .locator('erp-validation-summary a')
            .filter({ hasText: captions['tenantManagement.identifier'] })
            .click();
          await expect(tab(editor, 'identity')).toHaveAttribute('aria-selected', 'true');
          await expect(field(editor, 'identifier')).toBeFocused();
          await field(editor, 'identifier').fill('browser-tenant');
          stage = 'contact and notes';
          await tab(editor, 'contact').click();
          await field(editor, 'billingEmail').fill('billing@example.test');
          await field(editor, 'contactName').fill('Browser Contact');
          await tab(editor, 'notes').click();
          await editor
            .getByRole('textbox', { name: captions['tenantManagement.notes'], exact: false })
            .fill('Retained across tabs');
          stage = 'entitlements';
          await tab(editor, 'entitlements').click();
          const picker = editor.locator('erp-tenant-entitlement-field');
          await expect(picker).toBeVisible();
          const density = await picker.evaluate((element) => ({
            choice: element.querySelector('.module-choice').getBoundingClientRect().height,
            field: element.querySelector('.areas .boolean-control').getBoundingClientRect().height,
          }));
          assert.ok(
            density.choice <= 56 && density.field <= 44 && density.field >= 40,
            JSON.stringify(density),
          );
          const selectedTab = await tab(editor, 'entitlements').boundingBox();
          const tablist = await editor.getByRole('tablist').boundingBox();
          assert.ok(
            selectedTab &&
              tablist &&
              selectedTab.x >= tablist.x - 1 &&
              selectedTab.x + selectedTab.width <= tablist.x + tablist.width + 1,
            JSON.stringify({ selectedTab, tablist }),
          );
          await picker
            .getByRole('checkbox', {
              name: text['modules.submodules.hr.attendance'] ?? 'Attendance',
              exact: true,
            })
            .uncheck();
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-editor.png`),
            fullPage: true,
          });
          await tab(editor, 'notes').click();
          await expect(
            editor.getByRole('textbox', { name: captions['tenantManagement.notes'], exact: false }),
          ).toHaveValue('Retained across tabs');
          stage = 'dirty protection';
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
          stage = 'create submit';
          await save(editor).click();
          await expect(editor).toHaveCount(0);
          assert.equal(writes.length, 1);
          assert.equal(writes[0].payload.notes, 'Retained across tabs');
          stage = 'edit';
          await pick('cards');
          const created = workspace
            .locator('erp-card-list [data-collection-row]')
            .filter({ hasText: 'Browser Tenant' });
          await created.getByRole('button', { name: text['actions.edit'], exact: true }).click();
          const edit = page.getByRole('dialog', {
            name: captions['tenantManagement.editTenant'],
            exact: true,
          });
          await expect(field(edit, 'name')).toHaveValue('Browser Tenant');
          await field(edit, 'name').fill('Browser Tenant Edited');
          await save(edit).click();
          await expect(edit).toHaveCount(0);
          assert.equal(writes.length, 2);
          assert.equal(writes[1].payload.rowVersion, 'created-version');
          assert.deepEqual(writes[1].payload.entitlements, [
            { moduleCode: 'hr', submoduleCodes: ['basic-data'] },
          ]);
          stage = 'direct create link';
          const readsBeforeDirectLink = queries.length;
          await page.goto(origin + '/super-admin/tenants/new');
          const direct = page.locator('erp-tenant-create-page');
          await expect(field(direct, 'identifier')).toHaveValue('');
          assert.equal(
            queries.length,
            readsBeforeDirectLink,
            'Direct create links must not load the Tenant list',
          );
          await direct.getByRole('button', { name: text['actions.back'], exact: true }).click();
          await expect(page).toHaveURL(origin + '/super-admin/tenants');
          assert.ok(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          );
          assert.deepEqual(errors, []);
          results.push({
            language,
            mode,
            width,
            passed: true,
            queryCount: queries.length,
            writes: writes.map((item) => item.mode),
          });
          console.log(`Tenant Management passed ${language}/${mode}/${width}`);
        } catch (error) {
          await page
            .screenshot({ path: path.join(output, 'failure.png'), fullPage: true })
            .catch(() => {});
          throw Error(`Tenant ${language}/${mode}/${width} at ${stage}: ${error}`, {
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

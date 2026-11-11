import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { verifyCollectionSearchLayout } from './support/collection-search-layout.mjs';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { adminFixture } from '../src/app/platform/tenant-admins/tenant-admin.fixture.ts';
import { tenantFixture } from '../src/app/platform/tenants/management/tenant.fixture.ts';
import { dashboardFixture } from '../src/app/platform/tenants/dashboard.fixture.ts';
import { serveAngularFixtureBuild } from './angular-build-browser-fixture.mjs';

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
const compact = process.argv.includes('--compact');
const searchOnly = process.argv.includes('--search');
const accessOnly = process.argv.includes('--access');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const language of smoke ? [process.argv.includes('--arabic') ? 'ar' : 'en'] : ['en', 'ar'])
    for (const mode of smoke ? ['light'] : ['light', 'dark'])
      for (const width of searchOnly
        ? [1440]
        : process.argv.includes('--landscape')
          ? [844]
          : compact
            ? [320, 390, 570, 571, 640, 799, 800]
            : smoke
              ? [1440]
              : [320, 390, 900, 1440, 844]) {
        const height = compact
          ? width === 320
            ? 720
            : width === 390
              ? 844
              : 823
          : width === 320
            ? 720
            : width === 390
              ? 844
              : width === 900
                ? 640
                : width === 844
                  ? 390
                  : 1050;
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          viewport: { width, height },
          reducedMotion: 'reduce',
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
                  permissions: ['GlobalDataExports:Export'],
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
            else if (endpoint.endsWith('/tenants/getAll')) body = entries;
            else if (endpoint.endsWith('/tenantAdmins/getAll')) {
              body = [
                {
                  ...adminFixture,
                  firstName: 'Scoped Admin',
                  defaultTenantId: 'created-tenant',
                  tenants: [
                    {
                      id: 'created-tenant',
                      identifier: 'browser-tenant',
                      name: 'Browser Tenant',
                      isDefault: true,
                    },
                  ],
                },
                {
                  ...adminFixture,
                  id: 'other-admin',
                  firstName: 'Other Tenant Admin',
                  defaultTenantId: 'tenant-1',
                  tenants: [
                    { id: 'tenant-1', identifier: 'tenant-1', name: 'Tenant 01', isDefault: true },
                  ],
                },
              ];
            } else if (endpoint.endsWith('/tenants/getPage')) {
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
              body = {
                ...previous,
                ...payload,
                entitlements: payload.entitlements ?? previous.entitlements,
                rowVersion: 'updated-version',
              };
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
          editor.getByRole('tab', {
            name: captions['tenantManagement.tabs.' + (id === 'notes' ? 'identity' : id)],
            exact: true,
          });
        const save = (editor) =>
          editor
            .locator('erp-form form')
            .getByRole('button', { name: text['actions.save'], exact: true });
        const field = (editor, name) =>
          editor.getByRole('textbox', { name: captions['tenantManagement.' + name], exact: false });
        try {
          await page.goto(origin + '/super-admin/tenants');
          await expect(workspace).toHaveAttribute('data-kind', 'ready', { timeout: 60000 });
          const headerActionHeights = await page.locator('erp-page-header').evaluate((element) => {
            const height = (selector) =>
              element.querySelector(selector).getBoundingClientRect().height;
            return {
              add: height('.primary-action button'),
              export: height('erp-collection-export-menu button'),
              view: height('[data-view=grid] button'),
            };
          });
          assert.ok(
            Math.abs(headerActionHeights.add - headerActionHeights.view) < 1 &&
              Math.abs(headerActionHeights.export - headerActionHeights.view) < 1,
            JSON.stringify(headerActionHeights),
          );
          await expect(workspace).toHaveAttribute('data-kind', 'ready', { timeout: 60000 });
          await expect(workspace.locator('tbody [data-collection-row]')).toHaveCount(10);
          if (accessOnly) {
            stage = 'tenant access actions';
            await workspace.locator('[data-collection-row]').last().click();
            await workspace
              .getByRole('button', { name: text['pagination.goToNextRecord'], exact: true })
              .click();
            await expect.poll(() => queries.at(-1)?.pageNumber).toBe('2');
            await expect(workspace.locator('tbody [data-collection-row]')).toHaveCount(7);
            const target = 'tenant-11';
            const targetRow = () =>
              workspace.locator('[data-collection-row]').filter({ hasText: 'Tenant 11' });
            const clickAction = async (id) => {
              const inline = workspace.locator(
                `[data-action-row="${target}"][data-row-action="${id}"] button`,
              );
              const menuButton = targetRow().getByRole('button', {
                name: text['collections.rowActions'],
                exact: true,
              });
              await expect
                .poll(async () => (await inline.count()) + (await menuButton.count()))
                .toBe(1);
              if (await inline.count()) await inline.click();
              else {
                await menuButton.click();
                await page
                  .getByRole('menuitem', { name: captions['tenantManagement.' + id], exact: true })
                  .click();
              }
            };
            const expectStatus = async (enabled) => {
              await expect(
                targetRow().getByText(
                  captions['tenantManagement.' + (enabled ? 'enabled' : 'disabled')],
                  { exact: true },
                ),
              ).toHaveCount(1);
            };
            await clickAction('deactivate');
            let confirmation = page.getByRole('dialog', {
              name: captions['tenantManagement.deactivate'],
              exact: true,
            });
            await expect(confirmation).toContainText('Tenant 11');
            await confirmation
              .locator('.dialog-actions')
              .getByRole('button', { name: text['actions.cancel'], exact: true })
              .click();
            assert.equal(writes.length, 0);
            for (const [view, enabled] of [
              ['grid', false],
              ['cards', true],
              ['cards', false],
              ['grid', true],
            ]) {
              if (width >= 900) {
                await page.locator('.drawer-toggle button').click();
              }
              await pick(view);
              await expect(
                workspace.locator(view === 'grid' ? 'erp-data-table' : 'erp-card-list'),
              ).toBeVisible();
              const id = enabled ? 'activate' : 'deactivate';
              const label = captions['tenantManagement.' + id];
              await clickAction(id);
              confirmation = page.getByRole('dialog', { name: label, exact: true });
              await expect(confirmation).toContainText('Tenant 11');
              const bounds = await confirmation.boundingBox();
              assert.ok(
                bounds &&
                  bounds.x >= -1 &&
                  bounds.y >= -1 &&
                  bounds.x + bounds.width <= width + 1 &&
                  bounds.y + bounds.height <= height + 1,
              );
              await confirmation.getByRole('button', { name: label, exact: true }).click();
              await expect(confirmation).toHaveCount(0);
              await expectStatus(enabled);
              const updated = writes.at(-1).payload;
              assert.equal(updated.isActive, enabled);
              assert.equal(updated.subscriptionStartedOn, tenantFixture.subscriptionStartedOn);
              assert.equal(updated.subscriptionEndsOn, tenantFixture.subscriptionEndsOn);
              assert.equal(updated.entitlements, null);
              assert.equal(queries.at(-1).pageNumber, '2');
              await expect(workspace.locator('[data-collection-row]')).toHaveCount(7);
            }
            assert.equal(writes.length, 4);
            await workspace
              .getByPlaceholder(captions['tenantManagement.searchPlaceholder'])
              .fill('Tenant 11');
            await expect(workspace.locator('tbody [data-collection-row]')).toHaveCount(1);
            await clickAction('deactivate');
            const label = captions['tenantManagement.deactivate'];
            await page
              .getByRole('dialog', { name: label, exact: true })
              .getByRole('button', { name: label, exact: true })
              .click();
            await expectStatus(false);
            assert.equal(queries.at(-1).searchValue, 'Tenant 11');
            assert.equal(writes.length, 5);
            await page.screenshot({
              path: path.join(output, `${language}-${mode}-${width}-access.png`),
              fullPage: true,
            });
            assert.ok(
              await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            );
            assert.deepEqual(errors, []);
            results.push({
              language,
              mode,
              width,
              height,
              passed: true,
              cancelledWithoutWrite: true,
              gridAndCards: true,
              pageAndSearchPreserved: true,
              navigationWidths: width >= 900 ? 'expanded-and-collapsed' : 'compact',
              writes: writes.length,
            });
            console.log(`Tenant access actions passed ${language}/${mode}/${width}`);
            continue;
          }
          if (searchOnly) {
            const measurements = await verifyCollectionSearchLayout(
              page,
              workspace,
              page.locator('erp-page-header'),
              text,
              output,
              language,
              mode,
              { chart: false, structured: false },
            );
            assert.deepEqual(errors, []);
            results.push({ language, mode, measurements, passed: true });
            console.log(`Tenants search layout passed ${language}/${mode}`);
            continue;
          }
          if (compact) {
            stage = 'compact header and toolbars';
            const header = page.locator('erp-page-header');
            const title = header.getByRole('heading', { level: 1 });
            await expect(title).toHaveText(captions['tenantManagement.title']);
            const bounds = await title.boundingBox();
            const actions = await header.locator('.header-actions').boundingBox();
            if (width < 420) {
              assert.ok(
                bounds && actions && actions.y >= bounds.y + bounds.height,
                JSON.stringify({ bounds, actions }),
              );
            }
            for (const view of ['grid', 'cards']) {
              if (view === 'cards') await pick(view);
              const toolbar = workspace.locator('.collection-toolbar');
              await expect(toolbar).toBeVisible();
              if (width < 420) {
                await expect
                  .poll(() =>
                    toolbar.evaluate((element) => element.scrollWidth - element.clientWidth),
                  )
                  .toBeLessThanOrEqual(1);
              }
              if (view === 'cards' && width <= 571) {
                const searchInput = toolbar.getByRole('textbox');
                const sortBy = toolbar.getByRole('combobox', { name: text['general.sortBy'] });
                const directionButton = toolbar.locator('erp-sort-direction-button button');
                const resetAction = toolbar.getByRole('button', {
                  name: text['general.reset'],
                  exact: true,
                });
                await expect(searchInput).toBeVisible();
                await expect(sortBy).toBeVisible();
                await expect(directionButton).toBeVisible();
                await expect(resetAction).toBeVisible();
                const search = await searchInput.boundingBox();
                const sort = await sortBy.boundingBox();
                const direction = await directionButton.boundingBox();
                const reset = await resetAction.boundingBox();
                assert.ok(search && sort && direction && reset);
                for (const control of [sort, direction, reset]) {
                  assert.ok(
                    Math.abs(search.y + search.height / 2 - control.y - control.height / 2) <= 1,
                    JSON.stringify({ width, search, control }),
                  );
                }
              }
              if (view === 'grid' && width <= 571) {
                const resetButton = toolbar.getByTestId('reset').getByRole('button');
                const optionsButton = toolbar.getByRole('button', {
                  name: text['actions.gridOptions'],
                  exact: true,
                });
                await expect(resetButton).toBeVisible();
                await expect(optionsButton).toBeVisible();
                await expect(optionsButton.locator('[pButtonLabel]')).toBeHidden();
                const reset = await resetButton.boundingBox();
                const options = await optionsButton.boundingBox();
                const search = await toolbar.getByRole('textbox').boundingBox();
                assert.ok(reset && options && search);
                assert.ok(
                  Math.abs(reset.y + reset.height / 2 - options.y - options.height / 2) <= 1,
                  JSON.stringify({ width, reset, options }),
                );
                assert.ok(
                  Math.abs(search.y + search.height / 2 - options.y - options.height / 2) <= 1,
                  JSON.stringify({ width, search, options }),
                );
              }
              const footer = workspace.locator('erp-collection-footer');
              await expect
                .poll(() =>
                  footer.evaluate((element) => {
                    const record = element
                      .querySelector('.record-controls')
                      ?.getBoundingClientRect();
                    const sizes = element.querySelector('.size-settings')?.getBoundingClientRect();
                    if (!record?.height || !sizes?.height) return 'not ready';
                    if (element.scrollWidth > element.clientWidth + 1) return 'overflow';
                    return Math.abs(record.y + record.height / 2 - sizes.y - sizes.height / 2) <= 1
                      ? 'inline'
                      : sizes.y >= record.bottom
                        ? 'stacked'
                        : 'misaligned';
                  }),
                )
                .toBe('inline');
            }
            await expect(workspace.locator('erp-tenant-card-header').first()).toBeVisible();
            const cardViewport = workspace.locator('erp-card-list p-scrollarea-viewport');
            const cardScrollbar = workspace.locator('erp-card-list p-scrollarea-scrollbar');
            await expect(cardScrollbar).toHaveCount(0);
            await expect(cardViewport).toHaveCSS('scrollbar-width', 'none');
            await expect(cardViewport).toHaveAttribute('tabindex', '0');
            await cardViewport.press('PageDown');
            await expect
              .poll(() => cardViewport.evaluate((element) => element.scrollTop))
              .toBeGreaterThan(0);
            await expect(cardScrollbar).toHaveCount(0);
            await cardViewport.evaluate((element) => {
              element.scrollTo(0, 0);
              element.blur();
            });
            await expect(
              workspace.getByRole('combobox', { name: text['general.sortBy'] }),
            ).toBeVisible();
            assert.ok(
              await page.evaluate(
                () =>
                  document.documentElement.scrollWidth <= innerWidth + 1 &&
                  document.documentElement.scrollHeight <= innerHeight + 1,
              ),
            );
            assert.deepEqual(errors, []);
            await page.screenshot({
              path: path.join(output, `${language}-${mode}-${width}-compact-cards.png`),
              fullPage: true,
            });
            results.push({ language, mode, width, height, passed: true });
            console.log(`Tenant Management compact passed ${language}/${mode}/${width}×${height}`);
            continue;
          }
          const listSpacing = await workspace.evaluate((element) => {
            const header = document.querySelector('erp-tenant-management-page erp-page-header');
            const bounds = header.getBoundingClientRect();
            const topbar = document.querySelector('.workspace-toolbar').getBoundingClientRect();
            return {
              above: bounds.top - topbar.bottom,
              below: element.getBoundingClientRect().top - bounds.bottom,
            };
          });
          assert.ok(listSpacing.above >= 0 && listSpacing.above <= 24, JSON.stringify(listSpacing));
          assert.ok(
            Math.abs(listSpacing.below - (height <= 480 ? 8 : width < 900 ? 16 : 24)) <= 1,
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
          const editor = page.locator('erp-tenant-editor-page');
          await expect(tab(editor, 'identity')).toHaveAttribute('aria-selected', 'true');
          await expect(editor.locator('erp-tenant-form').getByRole('tab').last()).toHaveText(
            captions['tenantAdmins.title'],
          );
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
              detailsHeight: card.getBoundingClientRect().height,
              overviewHeight: element
                .querySelector('aside erp-tenant-draft-summary erp-surface-card')
                .getBoundingClientRect().height,
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
          if (width > 1024)
            assert.ok(
              Math.abs(layout.detailsHeight - layout.overviewHeight) <= 2,
              JSON.stringify(layout),
            );
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
          await expect(
            editor.getByRole('tab', { name: captions['tenantAdmins.title'], exact: true }),
          ).toHaveAttribute('aria-selected', 'true');
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
          await tab(editor, 'identity').click();
          await expect(
            editor.getByRole('tab', {
              name: captions['tenantManagement.tabs.contact'],
              exact: true,
            }),
          ).toHaveCount(0);
          await field(editor, 'billingEmail').fill('invalid-email');
          await save(editor).click();
          await expect(tab(editor, 'identity')).toHaveAttribute('aria-selected', 'true');
          await expect(field(editor, 'billingEmail')).toBeFocused();
          await expect(field(editor, 'billingEmail')).toHaveAttribute('aria-invalid', 'true');
          await field(editor, 'billingEmail').fill('billing@example.test');
          await field(editor, 'contactName').fill('Browser Contact');
          await expect(
            editor.getByRole('tab', { name: captions['tenantManagement.tabs.notes'], exact: true }),
          ).toHaveCount(0);
          await expect(
            editor.locator('erp-tenant-identity-fields erp-boolean-field .help'),
          ).toHaveCount(0);
          if (width > 640) {
            const toggle = await editor
              .locator('erp-tenant-identity-fields erp-boolean-field .boolean-control')
              .boundingBox();
            const billing = await field(editor, 'billingEmail').locator('..').boundingBox();
            assert.ok(
              toggle &&
                billing &&
                Math.abs(toggle.y - billing.y) < 1 &&
                Math.abs(toggle.height - billing.height) < 1,
              JSON.stringify({ toggle, billing }),
            );
          }
          await tab(editor, 'notes').click();
          await editor
            .getByRole('textbox', { name: captions['tenantManagement.notes'], exact: false })
            .fill('Retained across tabs');
          const notesField = field(editor, 'notes').locator('xpath=ancestor::erp-text-field');
          const notesGeometry = await notesField.evaluate((element) => {
            const textarea = element.querySelector('textarea').getBoundingClientRect();
            const counter = element.querySelector('.counter').getBoundingClientRect();
            const clear = element.querySelector('.field-action').getBoundingClientRect();
            const grid = element.closest('erp-tenant-identity-fields').getBoundingClientRect();
            return {
              fullWidth: Math.abs(element.getBoundingClientRect().width - grid.width) < 1,
              toolsBelow: counter.top >= textarea.bottom - 1 && clear.top >= textarea.bottom - 1,
              toolsAligned:
                Math.abs(counter.top + counter.height / 2 - clear.top - clear.height / 2) < 1,
            };
          });
          assert.deepEqual(notesGeometry, {
            fullWidth: true,
            toolsBelow: true,
            toolsAligned: true,
          });
          await notesField
            .getByRole('button', { name: text['general.clear'], exact: true })
            .click();
          await expect(field(editor, 'notes')).toHaveValue('');
          await expect(field(editor, 'notes')).toBeFocused();
          await field(editor, 'notes').fill('Retained across tabs');
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-profile.png`),
          });
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
          const tablist = await editor
            .locator('erp-tenant-form')
            .getByRole('tablist')
            .boundingBox();
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
          await expect(page).toHaveURL(
            origin + '/super-admin/tenants/created-tenant/edit?tab=administrators',
          );
          const newlyCreated = page.locator('erp-tenant-editor-page');
          const newAdministrators = newlyCreated.getByRole('tab', {
            name: captions['tenantAdmins.title'],
            exact: true,
          });
          await expect(newAdministrators).toHaveAttribute('aria-selected', 'true');
          const newAdminWorkspace = newlyCreated.locator('erp-tenant-admins-page');
          await expect(newAdminWorkspace).toBeVisible();
          await expect(newAdminWorkspace).toContainText('Scoped Admin');
          await expect(newAdminWorkspace).not.toContainText('Other Tenant Admin');
          await expect(save(newlyCreated)).toHaveCount(0);
          assert.equal(
            queries.length,
            listReadsBeforeCreate,
            'Creation continues without list reads',
          );
          await newAdminWorkspace.locator('erp-page-header .primary-action button').click();
          const newAdminDialog = page.getByRole('dialog', {
            name: captions['tenantAdmins.add'],
            exact: true,
          });
          await expect(newAdminDialog).toBeVisible();
          await expect(newAdminDialog).toContainText('Browser Tenant');
          await newAdminDialog
            .getByRole('button', { name: text['actions.close'], exact: true })
            .click();
          await page.reload();
          await expect(
            newlyCreated.getByRole('tab', {
              name: captions['tenantAdmins.title'],
              exact: true,
            }),
          ).toHaveAttribute('aria-selected', 'true');
          await expect(newlyCreated.locator('erp-tenant-admins-page')).toBeVisible();
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-created-administrators.png`),
          });
          await newlyCreated.locator('erp-page-header .heading-row erp-back-button button').click();
          await expect(page).toHaveURL(origin + '/super-admin/tenants');
          assert.equal(writes.length, 1);
          assert.equal(writes[0].payload.notes, 'Retained across tabs');
          stage = 'edit';
          await pick('cards');
          const created = workspace
            .locator('erp-card-list [data-collection-row]')
            .filter({ hasText: 'Browser Tenant' });
          const createdId = await created.getAttribute('data-collection-row');
          assert.ok(createdId);
          await created.getByRole('button', { name: text['actions.edit'], exact: true }).click();
          await expect(page).toHaveURL(new RegExp('/super-admin/tenants/[^/]+/edit$'));
          const edit = page.locator('erp-tenant-editor-page');
          await expect(
            page.getByRole('dialog', {
              name: captions['tenantManagement.editTenant'],
              exact: true,
            }),
          ).toHaveCount(0);
          await expect(edit.locator('erp-page-header h1')).toHaveText(
            captions['tenantManagement.editTenant'],
          );
          await expect(field(edit, 'name')).toHaveValue('Browser Tenant');
          const administratorTab = edit.getByRole('tab', {
            name: captions['tenantAdmins.title'],
            exact: true,
          });
          await administratorTab.click();
          const scopedAdministrators = edit.locator('erp-tenant-admins-page');
          await expect(scopedAdministrators.locator('[data-collection-row]')).toHaveCount(1);
          await expect(scopedAdministrators).toContainText('Scoped Admin');
          await expect(scopedAdministrators).not.toContainText('Other Tenant Admin');
          await expect(scopedAdministrators.locator('erp-selection-workspace aside')).toHaveCount(
            0,
          );
          await scopedAdministrators.locator('erp-page-header .primary-action button').click();
          const adminDialog = page.getByRole('dialog', {
            name: captions['tenantAdmins.add'],
            exact: true,
          });
          await expect(adminDialog).toBeVisible();
          await expect(page.locator('form form')).toHaveCount(0);
          await expect(adminDialog).toContainText('Browser Tenant');
          await adminDialog
            .getByRole('button', { name: text['actions.close'], exact: true })
            .click();
          await tab(edit, 'identity').click();
          await expect(field(edit, 'name')).toHaveValue('Browser Tenant');
          assert.ok(
            await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1),
          );
          await field(edit, 'name').fill('Browser Tenant Edited');
          await edit.getByRole('button', { name: text['actions.cancel'], exact: true }).click();
          const editUnsaved = page.getByRole('dialog', {
            name: text['messages.unsavedChangesTitle'],
            exact: true,
          });
          await expect(editUnsaved).toBeVisible();
          await editUnsaved
            .locator('.dialog-actions')
            .getByRole('button', { name: text['actions.cancel'], exact: true })
            .click();
          await expect(field(edit, 'name')).toHaveValue('Browser Tenant Edited');
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-edit-page.png`),
          });
          await save(edit).click();
          await expect(edit).toHaveCount(0);
          assert.equal(writes.length, 2);
          assert.equal(writes[1].payload.rowVersion, 'created-version');
          assert.deepEqual(writes[1].payload.entitlements, [
            { moduleCode: 'hr', submoduleCodes: ['basic-data'] },
          ]);
          stage = 'direct edit link';
          const readsBeforeEditLink = queries.length;
          await page.goto(
            origin + `/super-admin/tenants/${encodeURIComponent(JSON.parse(createdId)[1])}/edit`,
          );
          await expect(field(page.locator('erp-tenant-editor-page'), 'name')).toHaveValue(
            'Browser Tenant Edited',
          );
          assert.equal(
            queries.length,
            readsBeforeEditLink,
            'Direct edit must not load the Tenant list',
          );
          await page
            .locator('erp-tenant-editor-page')
            .getByRole('button', { name: text['actions.back'], exact: true })
            .click();
          await expect(page).toHaveURL(origin + '/super-admin/tenants');
          await expect(workspace).toHaveAttribute('data-kind', 'ready');
          stage = 'direct create link';
          const readsBeforeDirectLink = queries.length;
          await page.goto(origin + '/super-admin/tenants/new');
          const direct = page.locator('erp-tenant-editor-page');
          await expect(field(direct, 'identifier')).toHaveValue('');
          await direct
            .getByRole('tab', { name: captions['tenantAdmins.title'], exact: true })
            .click();
          await expect(direct).toContainText(captions['tenantManagement.saveBeforeAdministrators']);
          await tab(direct, 'identity').click();
          assert.equal(
            queries.length,
            readsBeforeDirectLink,
            'Direct create links must not load the Tenant list',
          );
          await direct.getByRole('button', { name: text['actions.back'], exact: true }).click();
          await expect(page).toHaveURL(origin + '/super-admin/tenants');
          await expect(page.locator('erp-tenant-management-page').getByRole('tablist')).toHaveCount(
            0,
          );
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
            afterCreateAdministrators: true,
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
    path.join(
      output,
      accessOnly
        ? 'access-results.json'
        : searchOnly
          ? 'search-layout-results.json'
          : compact
            ? 'compact-results.json'
            : smoke
              ? 'smoke-results.json'
              : 'results.json',
    ),
    JSON.stringify(results, null, 2),
  );
  await browser.close();
}

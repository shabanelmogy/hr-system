import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { adminFixture } from '../src/app/platform/tenant-admins/tenant-admin.fixture.ts';
import { tenantFixture } from '../src/app/platform/tenants/management/tenant.fixture.ts';
import { serveAngularFixtureBuild } from './angular-build-browser-fixture.mjs';
const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(root, '../.codex-tmp/angular-tenant-admins');
fs.mkdirSync(output, { recursive: true });
const resource = (scope) =>
  JSON.parse(fs.readFileSync(path.join(root, `src/locales/generated/${scope}.json`), 'utf8'));
const core = resource('core'),
  captions = resource('platform-tenants');
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
      for (const width of compact ? [790, 555, 320, 390, 844] : smoke ? [1440] : [390, 900, 1440]) {
        const height =
          width === 320
            ? 720
            : width === 844
              ? 390
              : width === 900
                ? 640
                : width === 555 || width === 790
                  ? 823
                  : 844;
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          reducedMotion: 'reduce',
          viewport: { width, height },
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
        const rows = [
          adminFixture,
          { ...adminFixture, id: 'disabled', firstName: 'Disabled', isDisabled: true },
          {
            ...adminFixture,
            id: 'locked',
            firstName: 'Locked',
            isLocked: true,
            tenants: [
              ...adminFixture.tenants,
              { id: 'b', name: 'Beta', identifier: 'beta', isDefault: false },
            ],
          },
          {
            ...adminFixture,
            id: 'unassigned',
            firstName: 'Unassigned',
            defaultTenantId: '',
            tenants: [],
          },
        ].map((row) => ({ ...row }));
        const tenants = [
          { ...tenantFixture, id: 't', name: 'Alpha', identifier: 'alpha' },
          { ...tenantFixture, id: 'b', name: 'Beta', identifier: 'beta' },
        ];
        const writes = [],
          errors = [];
        let detailCalls = 0,
          listCalls = 0;
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
            else if (endpoint.endsWith('/csrf')) body = { requestToken: 'admin-fixture-token' };
            else if (endpoint.endsWith('/realtime-token')) {
              status = 403;
              body = {};
            } else if (endpoint.endsWith('/modules/accessible')) body = [];
            else if (endpoint.endsWith('/tenants/getAll')) body = tenants;
            else if (endpoint.endsWith('/tenantAdmins/getAll')) {
              listCalls++;
              body = rows;
            } else if (endpoint.includes('/tenantAdmins/get/')) {
              detailCalls++;
              body = rows.find((row) => row.id === endpoint.split('/').at(-1));
            } else if (
              endpoint.endsWith('/tenantAdmins/create') ||
              endpoint.includes('/tenantAdmins/update/')
            ) {
              const payload = request.postDataJSON();
              assert.equal(request.headers()['x-erp-xsrf'], 'admin-fixture-token');
              assert.deepEqual(payload.tenantIds, ['t']);
              assert.equal(payload.defaultTenantId, 't');
              if (request.method() === 'POST') {
                assert.ok(!('isDisabled' in payload));
                assert.equal(payload.password, 'Example123');
                body = {
                  ...adminFixture,
                  ...payload,
                  id: 'created-admin',
                  tenants: [adminFixture.tenants[0]],
                  isDisabled: false,
                };
                status = 201;
                rows.push(body);
                writes.push({ action: 'create', keys: Object.keys(payload) });
              } else {
                assert.ok(!('password' in payload));
                assert.equal(payload.isDisabled, true);
                body = { ...rows.find((row) => row.id === endpoint.split('/').at(-1)), ...payload };
                const index = rows.findIndex((row) => row.id === body.id);
                rows[index] = body;
                writes.push({ action: 'update', keys: Object.keys(payload) });
              }
            } else if (endpoint.includes('/tenantAdmins/delete/')) {
              assert.equal(request.method(), 'DELETE');
              assert.equal(request.headers()['x-erp-xsrf'], 'admin-fixture-token');
              rows.splice(
                rows.findIndex((row) => row.id === endpoint.split('/').at(-1)),
                1,
              );
              status = 204;
              body = null;
              writes.push({ action: 'delete' });
            } else throw Error('Unexpected TenantAdmins request ' + endpoint);
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
          labels = captions[language];
        const caption = (key) => labels['tenantAdmins.' + key];
        const workspace = page.locator('[data-testid=tenant-admins]');
        const field = (editor, key) =>
          editor.getByRole('textbox', { name: caption(key), exact: false });
        const save = (editor) =>
          editor
            .locator('erp-form form')
            .getByRole('button', { name: text['actions.save'], exact: true });
        const chooseTenant = async (editor, label) => {
          const combobox = editor.locator('erp-multi-reference-field').getByRole('combobox');
          await combobox.press('ArrowDown');
          await expect(combobox).toHaveAttribute('aria-expanded', 'true');
          await page.getByRole('option', { name: label, exact: true }).click();
          await combobox.press('Escape');
          // Wait for the body-attached overlay to finish leaving before reopening.
          await expect(page.locator('.p-multiselect-overlay')).toHaveCount(0);
        };
        let stage = 'load';
        try {
          await page.goto(origin + '/super-admin/tenant-admins');
          await expect(page).toHaveURL(origin + '/super-admin/tenant-admins');
          await expect(
            page.locator('.workspace-sidebar [data-nav-id="tenant-admins"]'),
          ).toHaveCount(0);
          await expect(workspace).toHaveAttribute('data-kind', 'ready', { timeout: 60000 });
          if (width >= 900)
            await expect(page.locator('.workspace-sidebar')).not.toContainText(
              text['menu.tenantAdminManagement'],
            );
          await expect(page.locator('erp-page-header .view-badge')).toHaveCount(0);
          await expect(workspace.locator('[data-collection-row]')).toHaveCount(3);
          const cardsFrame = workspace.locator('erp-card-list .collection-shell');
          await expect(cardsFrame).toHaveCSS('border-radius', '0px');
          await expect(cardsFrame).toHaveCSS('border-top-width', '0px');
          if (language === 'en')
            await expect(page.locator('erp-page-header h1')).toHaveText('Tenant Administrators');
          const directory = workspace.locator('erp-selection-workspace');
          const searchField = directory.locator('erp-text-field');
          const search = searchField.getByRole('textbox', { name: caption('searchTenants') });
          const alpha = directory.getByRole('option', { name: 'Alpha', exact: true });
          const beta = directory.getByRole('option', { name: 'Beta', exact: true });
          const list = directory.getByRole('listbox');
          const exportTrigger = page.locator('erp-page-header').getByRole('button', {
            name: text['actions.export'],
            exact: true,
          });
          await expect(exportTrigger).toBeVisible();
          const headerGeometry = await page.locator('erp-page-header').evaluate((element) => {
            const header = element.getBoundingClientRect();
            const buttons = [
              ...element.querySelectorAll(
                '.primary-action button, erp-collection-export-menu button, .refresh button',
              ),
            ].map((button) => {
              const box = button.getBoundingClientRect();
              return {
                label: button.getAttribute('aria-label') || button.textContent.trim(),
                centerY: box.y + box.height / 2,
                left: box.left,
                right: box.right,
              };
            });
            return {
              buttons,
              left: header.left,
              right: header.right,
              classes: element.className,
              controlsDisplay: getComputedStyle(element.querySelector('.header-controls')).display,
            };
          });
          assert.ok(headerGeometry.buttons.length >= 3);
          assert.ok(
            Math.max(...headerGeometry.buttons.map((box) => box.centerY)) -
              Math.min(...headerGeometry.buttons.map((box) => box.centerY)) <
              1,
            JSON.stringify(headerGeometry),
          );
          assert.ok(
            headerGeometry.buttons.every(
              (box) => box.left >= headerGeometry.left && box.right <= headerGeometry.right,
            ),
            JSON.stringify(headerGeometry),
          );
          await expect(alpha).toHaveAttribute('aria-selected', 'true');
          const readDirectoryGeometry = () =>
            directory.evaluate((element) => {
              const field = element
                .querySelector('erp-text-field .input-row')
                .getBoundingClientRect();
              const icon = element.querySelector('erp-text-field erp-icon').getBoundingClientRect();
              const selected = element.querySelector('[role="option"][aria-selected="true"]');
              const other = element.querySelector('[role="option"][aria-selected="false"]');
              const sidebar = element.querySelector('aside').getBoundingClientRect();
              return {
                searchInset: Math.min(field.left - sidebar.left, sidebar.right - field.right),
                searchLeftInset: field.left - sidebar.left,
                searchRightInset: sidebar.right - field.right,
                iconInset: Math.min(icon.left - field.left, field.right - icon.right),
                optionPadding: parseFloat(getComputedStyle(selected).paddingInlineStart),
                selectedColor: getComputedStyle(selected).backgroundColor,
                unselectedColor: getComputedStyle(other).backgroundColor,
                listPaddingToken: getComputedStyle(selected).getPropertyValue(
                  '--p-listbox-list-padding',
                ),
              };
            });
          const checkDirectoryGeometry = async () => {
            const geometry = await readDirectoryGeometry();
            assert.ok(geometry.searchInset >= 8, JSON.stringify(geometry));
            assert.ok(
              Math.abs(geometry.searchLeftInset - geometry.searchRightInset) < 1,
              JSON.stringify(geometry),
            );
            assert.ok(geometry.iconInset >= 8, JSON.stringify(geometry));
            assert.ok(geometry.optionPadding >= 8, JSON.stringify(geometry));
            assert.notEqual(
              geometry.selectedColor,
              geometry.unselectedColor,
              JSON.stringify(geometry),
            );
          };
          await checkDirectoryGeometry();
          if (width >= 900) {
            const toggleNavigation = page.locator('.drawer-toggle button');
            const shellWidth = () =>
              page.locator('.workspace-sidebar').evaluate((element) => element.clientWidth);
            await toggleNavigation.click();
            await expect.poll(shellWidth).toBeGreaterThan(200);
            await checkDirectoryGeometry();
            await toggleNavigation.click();
            await expect.poll(shellWidth).toBeLessThan(100);
          }
          await search.fill('beta');
          await expect(list.getByRole('option')).toHaveCount(1);
          await expect(beta).toBeVisible();
          const listViewport = directory.locator('.p-listbox-list-container');
          await expect
            .poll(() =>
              listViewport.evaluate((element) => element.scrollHeight - element.clientHeight),
            )
            .toBeLessThanOrEqual(1);
          await searchField.getByRole('button', { name: text['general.clear'] }).click();
          await expect(search).toHaveValue('');
          await expect(search).toBeFocused();
          await expect(list.getByRole('option')).toHaveCount(3);
          if (width === 320) {
            await expect
              .poll(() =>
                listViewport.evaluate((element) => element.scrollHeight - element.clientHeight),
              )
              .toBeGreaterThan(1);
          }
          if (width < 600 || height < 480) {
            const triggerBox = await exportTrigger.boundingBox();
            assert.ok(
              triggerBox && triggerBox.width <= 36 && triggerBox.height <= 36,
              JSON.stringify(triggerBox),
            );
          }
          await exportTrigger.click();
          await expect(
            page.getByRole('menuitem', {
              name: text['collectionExport.excel'],
              exact: true,
            }),
          ).toBeVisible();
          await expect(
            page.getByRole('menuitem', {
              name: text['collectionExport.csv'],
              exact: true,
            }),
          ).toBeVisible();
          await exportTrigger.click();
          await expect(exportTrigger).toHaveAttribute('aria-expanded', 'false');
          await expect(directory).toContainText('Alpha');
          await expect(directory).toContainText('Beta');
          await expect(directory).toContainText(caption('unassignedTenant'));
          await directory.getByRole('option', { name: 'Beta', exact: true }).click();
          await expect(workspace.locator('[data-collection-row]')).toHaveCount(1);
          if (width === 1440) {
            const card = await workspace.locator('[data-collection-row]').boundingBox();
            assert.ok(
              card && card.width >= 260 && card.width < 360 && card.height <= 240,
              JSON.stringify(card),
            );
          }
          const cardGeometry = await workspace
            .locator('erp-card-list .cards')
            .evaluate((element) => {
              const style = getComputedStyle(element);
              const available =
                element.clientWidth -
                parseFloat(style.paddingLeft) -
                parseFloat(style.paddingRight);
              return {
                available,
                widths: [...element.querySelectorAll('article')].map(
                  (article) => article.getBoundingClientRect().width,
                ),
              };
            });
          if (width <= 790)
            assert.ok(
              cardGeometry.widths.every(
                (cardWidth) => Math.abs(cardWidth - cardGeometry.available) < 1,
              ),
              JSON.stringify(cardGeometry),
            );
          await directory.getByRole('option', { name: 'Alpha', exact: true }).click();
          await expect(workspace.locator('[data-collection-row]')).toHaveCount(3);
          assert.equal(writes.length, 0);
          await expect(workspace.locator('erp-collection-footer')).toHaveCount(0);
          await expect(workspace).toContainText(caption('disabled'));
          await expect(workspace).toContainText(caption('locked'));
          await expect(workspace).toContainText(caption('default'));
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-cards.png`),
            fullPage: true,
          });
          if (compact) {
            assert.ok(
              await page.evaluate(
                () =>
                  document.documentElement.scrollWidth <= innerWidth + 1 &&
                  document.documentElement.scrollHeight <= innerHeight + 1,
              ),
              'The compact workspace must keep scrolling inside its panels',
            );
            assert.deepEqual(errors, []);
            results.push({
              language,
              mode,
              width,
              height,
              headerGeometry,
              directoryGeometry: await readDirectoryGeometry(),
              cardGeometry,
              passed: true,
            });
            console.log(`Tenant Admins compact passed ${language}/${mode}/${width}×${height}`);
            continue;
          }
          stage = 'create validation';
          await page
            .locator('erp-page-header')
            .getByRole('button', { name: caption('add'), exact: true })
            .click();
          const editor = page.getByRole('dialog', { name: caption('add'), exact: true });
          await save(editor).click();
          await expect(field(editor, 'firstName')).toBeFocused();
          for (const [key, value] of Object.entries({
            firstName: 'Browser',
            lastName: 'Admin',
            userName: 'browser-admin',
            email: 'browser@example.test',
            password: 'Example123',
          }))
            await field(editor, key).fill(value);
          stage = 'multiple/default assignments';
          await chooseTenant(editor, 'Alpha (alpha)');
          const selectionLayout = await editor
            .locator('erp-multi-reference-field')
            .evaluate((field) => {
              const label = field
                .querySelector('.p-multiselect-label-container')
                .getBoundingClientRect();
              const dropdown = field
                .querySelector('.p-multiselect-dropdown')
                .getBoundingClientRect();
              return Math.abs(label.top + label.height / 2 - dropdown.top - dropdown.height / 2);
            });
          assert.ok(selectionLayout <= 1, 'Selected chips and dropdown must share the control row');
          await chooseTenant(editor, 'Beta (beta)');
          await editor.locator('erp-reference-field p-select').click();
          await page.getByRole('option', { name: 'Beta (beta)', exact: true }).click();
          await expect(page.locator('.p-select-overlay')).toHaveCount(0);
          await chooseTenant(editor, 'Beta (beta)');
          await expect(editor.locator('erp-reference-field')).toContainText('Alpha (alpha)');
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
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-editor.png`),
            fullPage: true,
          });
          stage = 'create submit';
          await save(editor).click();
          await expect(editor).toHaveCount(0);
          await expect(workspace.locator('[data-collection-row]')).toHaveCount(4);
          stage = 'fresh edit';
          const created = () =>
            workspace.locator('[data-collection-row]').filter({ hasText: 'Browser Admin' });
          await created().getByRole('button', { name: text['actions.edit'], exact: true }).click();
          const editing = page.getByRole('dialog', { name: caption('edit'), exact: true });
          await expect(field(editing, 'firstName')).toHaveValue('Browser');
          await expect(field(editing, 'newPassword')).toHaveValue('');
          assert.equal(detailCalls, 1);
          await editing
            .getByRole('switch', { name: caption('disableAccount'), exact: true })
            .check();
          await save(editing).click();
          await expect(editing).toHaveCount(0);
          await expect(created()).toContainText(caption('disabled'));
          stage = 'explicit delete';
          await created()
            .getByRole('button', { name: text['actions.delete'], exact: true })
            .click();
          let confirm = page.getByRole('dialog', { name: caption('deleteTitle'), exact: true });
          await confirm
            .getByRole('button', { name: text['actions.cancel'], exact: true })
            .last()
            .click();
          assert.equal(writes.length, 2);
          await created()
            .getByRole('button', { name: text['actions.delete'], exact: true })
            .click();
          confirm = page.getByRole('dialog', { name: caption('deleteTitle'), exact: true });
          await confirm.getByRole('button', { name: text['actions.delete'], exact: true }).click();
          await expect(workspace.locator('[data-collection-row]')).toHaveCount(3);
          assert.equal(writes.length, 3);
          assert.ok(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          );
          assert.ok(
            await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1),
            'Outer application must not scroll',
          );
          assert.deepEqual(errors, []);
          results.push({
            language,
            mode,
            width,
            height,
            passed: true,
            detailCalls,
            listCalls,
            writes,
            groups: 3,
            uniqueAdmins: 4,
            membershipCards: 5,
          });
          console.log(`Tenant Admins passed ${language}/${mode}/${width}`);
        } catch (error) {
          await page
            .screenshot({ path: path.join(output, 'failure.png'), fullPage: true })
            .catch(() => {});
          throw Error(`Tenant Admins ${language}/${mode}/${width} at ${stage}: ${error}`, {
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
      compact ? 'compact-results.json' : smoke ? 'smoke-results.json' : 'results.json',
    ),
    JSON.stringify(results, null, 2),
  );
  await browser.close();
}

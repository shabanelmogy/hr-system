import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { adminFixture } from '../src/app/platform/tenant-admins/tenant-admin.fixture.ts';
import { tenantFixture } from '../src/app/platform/tenants/management/tenant.fixture.ts';
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
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const language of smoke ? ['en'] : ['en', 'ar'])
    for (const mode of smoke ? ['light'] : ['light', 'dark'])
      for (const width of smoke ? [1440] : [390, 1440]) {
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          reducedMotion: 'reduce',
          viewport: { width, height: 1050 },
        });
        await context.addCookies(
          Object.entries({ i18next: language, currentMode: mode, themePalette: 'green' }).map(
            ([name, value]) => ({ name, value, url: origin }),
          ),
        );
        const rows = [
          adminFixture,
          { ...adminFixture, id: 'disabled', firstName: 'Disabled', isDisabled: true },
          { ...adminFixture, id: 'locked', firstName: 'Locked', isLocked: true },
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
                  permissions: [],
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
          await page.keyboard.press('Escape');
          // Wait for the body-attached overlay to finish leaving before reopening.
          await expect(page.getByRole('listbox')).toHaveCount(0);
        };
        let stage = 'load';
        try {
          await page.goto(origin + '/super-admin/tenant-admins');
          await expect(workspace).toHaveAttribute('data-kind', 'ready', { timeout: 60000 });
          await expect(workspace.locator('[data-collection-row]')).toHaveCount(3);
          await expect(workspace.locator('erp-collection-footer')).toHaveCount(0);
          if (width === 1440) {
            const cards = await workspace.locator('[data-collection-row]').evaluateAll((elements) =>
              elements.map((element) => {
                const { top, width } = element.getBoundingClientRect();
                return { top, width };
              }),
            );
            assert.ok(cards.every((card) => Math.abs(card.top - cards[0].top) <= 1));
            const layout = await workspace.locator('.cards').evaluate((element) => ({
              classes: element.className,
              minimum: getComputedStyle(element).getPropertyValue('--card-min-width'),
              columns: getComputedStyle(element).gridTemplateColumns,
            }));
            assert.ok(cards[0].width >= 320, JSON.stringify({ cards, layout }));
            const row = await workspace.locator('.cards').boundingBox();
            assert.ok(
              cards[0].width * 3 + 32 >= row.width - 33,
              'Cards must fill the available row',
            );
          }
          await expect(workspace).toContainText(caption('disabled'));
          await expect(workspace).toContainText(caption('locked'));
          await expect(workspace).toContainText(caption('default'));
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-cards.png`),
            fullPage: true,
          });
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
          await expect(page.getByRole('listbox')).toHaveCount(0);
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
          assert.deepEqual(errors, []);
          results.push({ language, mode, width, passed: true, detailCalls, listCalls, writes });
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
    path.join(output, smoke ? 'smoke-results.json' : 'results.json'),
    JSON.stringify(results, null, 2),
  );
  await browser.close();
}

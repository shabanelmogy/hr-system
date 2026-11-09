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
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
const smoke = process.argv.includes('--smoke');
try {
  for (const language of smoke ? ['en'] : ['en', 'ar'])
    for (const scenario of [
      'read-only',
      'list-forbidden',
      'lookup-forbidden',
      'lookup-error',
      'detail-forbidden',
      'detail-error',
      'duplicate-email',
      'duplicate-username',
      'password',
      'seat',
      'field',
      'uncertain',
      'pending',
      'mutation-forbidden',
      'delete-uncertain',
      'delete-forbidden',
    ]) {
      const context = await browser.newContext({
        ignoreHTTPSErrors: true,
        reducedMotion: 'reduce',
        viewport: { width: 1440, height: 1050 },
      });
      await serveAngularFixtureBuild(context, root, origin);
      await context.addCookies(
        Object.entries({
          i18next: language,
          currentMode: language === 'ar' ? 'dark' : 'light',
          themePalette: 'green',
        }).map(([name, value]) => ({ name, value, url: origin })),
      );
      const text = core[language],
        labels = captions[language],
        errors = [];
      let lookupCalls = 0,
        detailCalls = 0,
        writes = 0,
        listCalls = 0,
        release;
      const waiting = new Promise((resolve) => {
        release = resolve;
      });
      await context.route('**/api/**', async (route) => {
        try {
          const request = route.request(),
            url = new URL(request.url()),
            endpoint = url.pathname;
          assert.equal(url.origin, api);
          let status = 200,
            body;
          if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh'))
            body = {
              isAuthenticated: true,
              user: {
                ...sessionFixture,
                roles: ['super_admin'],
                permissions: [],
                tenantReadOnly: scenario === 'read-only',
              },
            };
          else if (endpoint.endsWith('/runtime'))
            body = { catalogVersion: version, revision: 0, overrides: [] };
          else if (endpoint.endsWith('/csrf')) body = { requestToken: 'tenant-admin-test-token' };
          else if (endpoint.endsWith('/realtime-token')) {
            status = 403;
            body = {};
          } else if (endpoint.endsWith('/modules/accessible')) body = [];
          else if (endpoint.endsWith('/tenants/getAll')) {
            lookupCalls++;
            status =
              scenario === 'lookup-forbidden'
                ? 403
                : scenario === 'lookup-error' && lookupCalls === 1
                  ? 503
                  : 200;
            body =
              status === 200
                ? [{ ...tenantFixture, id: 't', name: 'Alpha', identifier: 'alpha' }]
                : {};
          } else if (endpoint.endsWith('/tenantAdmins/getAll')) {
            listCalls++;
            status = scenario === 'list-forbidden' ? 403 : 200;
            body = status === 200 ? [adminFixture] : {};
          } else if (endpoint.includes('/tenantAdmins/get/')) {
            detailCalls++;
            status =
              scenario === 'detail-forbidden'
                ? 403
                : scenario === 'detail-error' && detailCalls === 1
                  ? 503
                  : 200;
            body = status === 200 ? adminFixture : {};
          } else if (/\/tenantAdmins\/(create|update|delete)/.test(endpoint)) {
            assert.equal(request.headers()['x-erp-xsrf'], 'tenant-admin-test-token');
            writes++;
            const code = {
              'duplicate-email': 'TenantAdmin.DuplicateEmail',
              'duplicate-username': 'TenantAdmin.DuplicateUserName',
              password: 'PasswordRequiresUpper',
              seat: 'TenantAdmin.AdminSeatLimitReached',
            }[scenario];
            status = ['uncertain', 'delete-uncertain'].includes(scenario)
              ? 503
              : ['mutation-forbidden', 'delete-forbidden'].includes(scenario)
                ? 403
                : scenario.startsWith('duplicate')
                  ? 409
                  : 400;
            body =
              scenario === 'field'
                ? { errors: { FirstName: ['Choose a different given name.'] } }
                : { title: code ?? 'PRIVATE_DIAGNOSTIC', detail: 'PRIVATE_DIAGNOSTIC' };
            if (scenario === 'pending') {
              await waiting;
              status = 201;
              body = { ...adminFixture, id: 'created' };
            }
          } else throw Error('Unexpected failure fixture request ' + endpoint);
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
      const caption = (key) => labels['tenantAdmins.' + key];
      const workspace = page.locator('[data-testid=tenant-admins]');
      const add = page
        .locator('erp-page-header')
        .getByRole('button', { name: caption('add'), exact: true });
      const action = (name) =>
        workspace.getByRole('button', { name: text['actions.' + name], exact: true });
      let stage = 'load';
      try {
        await page.goto(origin + '/super-admin/tenant-admins');
        await expect(workspace).toHaveAttribute(
          'data-kind',
          scenario === 'list-forbidden' ? 'forbidden' : 'ready',
          { timeout: 60000 },
        );
        await expect.poll(() => lookupCalls).toBe(1);
        stage = scenario;
        if (['read-only', 'list-forbidden', 'lookup-forbidden'].includes(scenario)) {
          await expect(add).toHaveCount(0);
          await expect(action('edit')).toHaveCount(0);
          if (scenario !== 'lookup-forbidden')
            await expect(action('delete')).toHaveCount(
              scenario === 'read-only' || scenario === 'list-forbidden' ? 0 : 1,
            );
          if (scenario !== 'read-only')
            await expect(page.locator('erp-tenant-admins-page')).toContainText(
              text['authorization.forbidden.title'],
            );
          assert.equal(writes, 0);
        } else if (scenario === 'lookup-error') {
          await expect(add).toHaveCount(0);
          await page
            .locator('erp-tenant-admins-page main > erp-feedback-state')
            .getByRole('button', { name: text['actions.retry'], exact: true })
            .click();
          await expect(add).toBeVisible();
          assert.equal(lookupCalls, 2);
        } else if (scenario.startsWith('delete-')) {
          await action('delete').click();
          let dialog = page.getByRole('dialog', { name: caption('deleteTitle'), exact: true });
          await dialog.getByRole('button', { name: text['actions.delete'], exact: true }).click();
          await expect(dialog).toContainText(
            scenario === 'delete-uncertain'
              ? caption('errors.uncertainDelete')
              : text['authorization.forbidden.title'],
          );
          await expect(
            dialog.getByRole('button', { name: text['actions.delete'], exact: true }),
          ).toHaveCount(0);
          assert.equal(writes, 1);
          await dialog
            .locator('.dialog-actions')
            .getByRole('button', { name: text['actions.close'], exact: true })
            .click();
          await expect(dialog).toHaveCount(0);
        } else {
          const editing = scenario.startsWith('detail-');
          if (editing) await action('edit').click();
          else await add.click();
          const editor = page.getByRole('dialog', {
            name: caption(editing ? 'edit' : 'add'),
            exact: true,
          });
          await expect(editor).toBeVisible();
          const field = (key) => editor.getByRole('textbox', { name: caption(key), exact: false });
          const save = editor
            .locator('erp-form form')
            .getByRole('button', { name: text['actions.save'], exact: true });
          if (scenario === 'detail-forbidden') {
            await expect(editor).toContainText(text['authorization.forbidden.title']);
            await expect(
              editor.getByRole('button', { name: text['actions.retry'], exact: true }),
            ).toHaveCount(0);
          } else if (scenario === 'detail-error') {
            await editor.getByRole('button', { name: text['actions.retry'], exact: true }).click();
            await expect(field('firstName')).toHaveValue(adminFixture.firstName);
            assert.equal(detailCalls, 2);
          } else {
            for (const [key, value] of Object.entries({
              firstName: 'Browser',
              lastName: 'Admin',
              userName: 'browser-admin',
              email: 'browser@example.test',
              password: 'Example123',
            }))
              await field(key).fill(value);
            await editor.locator('erp-multi-reference-field p-multiselect').click();
            await page.getByRole('option', { name: 'Alpha (alpha)', exact: true }).click();
            await page.keyboard.press('Escape');
            await save.click();
            await expect.poll(() => writes).toBe(1);
            if (scenario === 'pending') {
              await expect(save).toBeDisabled();
              await expect(
                editor.getByRole('button', { name: text['actions.cancel'], exact: true }),
              ).toBeDisabled();
              await expect(
                editor.getByRole('button', { name: text['actions.close'], exact: true }),
              ).toHaveCount(0);
              await page.keyboard.press('Escape');
              await expect(editor).toBeVisible();
              release();
              await expect(editor).toHaveCount(0);
            } else if (scenario === 'uncertain') {
              await expect(save).toBeDisabled();
              await expect(editor).toContainText(caption('errors.uncertain'));
              assert.equal(writes, 1);
            } else if (scenario === 'mutation-forbidden') {
              await expect(editor).toContainText(text['authorization.forbidden.title']);
              await expect(save).toHaveCount(0);
            } else {
              const key =
                scenario === 'duplicate-email'
                  ? 'email'
                  : scenario === 'duplicate-username'
                    ? 'userName'
                    : scenario === 'password'
                      ? 'password'
                      : 'firstName';
              const message =
                scenario === 'field'
                  ? 'Choose a different given name.'
                  : caption(
                      'errors.' +
                        {
                          'duplicate-email': 'duplicateEmail',
                          'duplicate-username': 'duplicateUserName',
                          password: 'passwordRequirements',
                          seat: 'seatLimit',
                        }[scenario],
                    );
              await expect(editor.locator('erp-validation-summary')).toContainText(message);
              if (scenario === 'seat') {
                const combo = editor.locator('erp-multi-reference-field').getByRole('combobox');
                await expect(combo).toBeFocused();
                await expect(combo).toHaveAttribute('aria-invalid', 'true');
                await expect(combo).toHaveAttribute('aria-describedby', /-error/);
              } else {
                await expect(field(key)).toBeFocused();
                await expect(field(key)).toHaveAttribute('aria-invalid', 'true');
              }
            }
          }
        }
        await expect(page.locator('body')).not.toContainText('PRIVATE_DIAGNOSTIC');
        assert.deepEqual(errors, []);
        results.push({
          language,
          scenario,
          passed: true,
          writes,
          lookupCalls,
          detailCalls,
          listCalls,
        });
        console.log(`Tenant Admins negative passed ${language}/${scenario}`);
      } catch (error) {
        await page
          .screenshot({ path: path.join(output, 'negative-failure.png'), fullPage: true })
          .catch(() => {});
        throw Error(`Tenant Admins ${language}/${scenario} at ${stage}: ${error}`, {
          cause: error,
        });
      } finally {
        release();
        await context.close();
      }
    }
} finally {
  fs.writeFileSync(
    path.join(output, smoke ? 'negative-smoke-results.json' : 'negative-results.json'),
    JSON.stringify(results, null, 2),
  );
  await browser.close();
}

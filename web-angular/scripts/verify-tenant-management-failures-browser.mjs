import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { tenantFixture } from '../src/app/platform/tenants/management/tenant.fixture.ts';
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
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const language of smoke ? ['en'] : ['en', 'ar']) {
    for (const scenario of [
      'read-only',
      'list-forbidden',
      'catalog-forbidden',
      'catalog-error',
      'detail-forbidden',
      'detail-error',
      'catalog-incompatible',
      'field',
      'duplicate',
      'seat',
      'conflict',
      'uncertain',
      'mutation-forbidden',
      'pending',
    ]) {
      const context = await browser.newContext({
        ignoreHTTPSErrors: true,
        viewport: { width: 1440, height: 1050 },
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
        Object.entries({
          i18next: language,
          currentMode: language === 'ar' ? 'dark' : 'light',
          themePalette: 'green',
        }).map(([name, value]) => ({ name, value, url: origin })),
      );
      const text = core[language],
        captions = tenants[language],
        errors = [],
        writes = [];
      const catalog = [{ code: 'hr', name: 'Human Resources', isDefault: true, submodules: [] }];
      let catalogCalls = 0,
        detailCalls = 0,
        pageCalls = 0,
        release;
      const pending = new Promise((resolve) => {
        release = resolve;
      });
      const tenant = {
        ...tenantFixture,
        entitlements:
          scenario === 'catalog-incompatible'
            ? [{ moduleCode: 'future-module', submoduleCodes: [] }]
            : [],
      };
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
                tenantReadOnly: scenario === 'read-only',
              },
            };
          else if (endpoint.endsWith('/runtime'))
            body = { catalogVersion: version, revision: 0, overrides: [] };
          else if (endpoint.endsWith('/csrf')) body = { requestToken: 'tenant-fixture-csrf' };
          else if (endpoint.endsWith('/realtime-token')) {
            status = 403;
            body = {};
          } else if (endpoint.endsWith('/modules/accessible')) body = [];
          else if (endpoint.endsWith('/modules/tenant-entitlements')) {
            catalogCalls++;
            status =
              scenario === 'catalog-forbidden'
                ? 403
                : scenario === 'catalog-error' && catalogCalls === 1
                  ? 503
                  : 200;
            body =
              status !== 200
                ? {}
                : scenario === 'catalog-incompatible' && catalogCalls > 2
                  ? [
                      ...catalog,
                      {
                        code: 'future-module',
                        name: 'New module',
                        isDefault: false,
                        submodules: [],
                      },
                    ]
                  : catalog;
          } else if (endpoint.endsWith('/tenants/getPage')) {
            pageCalls++;
            status = scenario === 'list-forbidden' ? 403 : 200;
            body =
              status === 403
                ? {}
                : {
                    items: [tenant],
                    metaData: {
                      currentPage: 1,
                      pageNumber: 1,
                      pageSize: 10,
                      totalCount: 1,
                      totalPages: 1,
                      hasPrev: false,
                      hasNext: false,
                    },
                  };
          } else if (endpoint.includes('/tenants/get/')) {
            detailCalls++;
            status =
              scenario === 'detail-forbidden'
                ? 403
                : scenario === 'detail-error' && detailCalls === 1
                  ? 503
                  : 200;
            body = status === 200 ? tenant : {};
          } else if (
            endpoint.endsWith('/tenants/create') ||
            endpoint.includes('/tenants/update/')
          ) {
            const payload = request.postDataJSON();
            assert.equal(request.headers()['x-erp-xsrf'], 'tenant-fixture-csrf');
            writes.push(payload);
            status =
              scenario === 'mutation-forbidden'
                ? 403
                : scenario === 'uncertain'
                  ? 503
                  : ['duplicate', 'conflict'].includes(scenario)
                    ? 409
                    : 400;
            const codes = {
              duplicate: 'Tenant.DuplicateIdentifier',
              conflict: 'Tenant.ConcurrencyConflict',
              seat: 'Tenant.SeatLimitBelowUsage',
            };
            body =
              scenario === 'field'
                ? { errors: { Name: ['This tenant name is reserved.'] } }
                : {
                    title: codes[scenario] ?? 'PRIVATE_DIAGNOSTIC_MUST_STAY_HIDDEN',
                    detail: 'PRIVATE_DIAGNOSTIC_MUST_STAY_HIDDEN',
                  };
            if (scenario === 'pending') {
              await pending;
              status = 201;
              body = {
                ...tenantFixture,
                ...payload,
                id: 'created-tenant',
                rowVersion: 'new-version',
              };
            }
          } else throw Error('Unexpected Tenant failure request: ' + endpoint);
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
      let stage = 'load';
      try {
        await page.goto(origin + '/super-admin/tenants');
        const workspace = page.locator('.workspace[data-testid=tenants]'),
          header = page.locator('erp-page-header');
        const add = header.getByRole('button', {
          name: captions['tenantManagement.addTenant'],
          exact: true,
        });
        const editAction = workspace.getByRole('button', {
          name: text['actions.edit'],
          exact: true,
        });
        await expect(workspace).toHaveAttribute(
          'data-kind',
          scenario === 'list-forbidden' ? 'forbidden' : 'ready',
          { timeout: 60000 },
        );
        await expect.poll(() => catalogCalls).toBe(1);
        stage = scenario;
        if (['read-only', 'list-forbidden', 'catalog-forbidden'].includes(scenario)) {
          await expect(add).toHaveCount(0);
          await expect(editAction).toHaveCount(0);
          if (scenario !== 'read-only')
            await expect(page.locator('erp-tenant-management-page main')).toContainText(
              text['authorization.forbidden.title'],
            );
          if (scenario === 'read-only') {
            await page.goto(origin + '/super-admin/tenants/new');
            await expect(page).toHaveURL(origin + '/super-admin/tenants');
            await expect(page.locator('erp-tenant-editor-page')).toHaveCount(0);
          }
          assert.equal(writes.length, 0);
        } else if (scenario === 'catalog-error') {
          await expect(add).toHaveCount(0);
          await page
            .locator('erp-tenant-management-page main > erp-feedback-state')
            .getByRole('button', { name: text['actions.retry'], exact: true })
            .click();
          await expect(add).toBeVisible();
          assert.equal(catalogCalls, 2);
          assert.equal(writes.length, 0);
        } else {
          const editing = [
            'detail-forbidden',
            'detail-error',
            'catalog-incompatible',
            'seat',
            'conflict',
          ].includes(scenario);
          if (editing) await editAction.click();
          else await add.click();
          const editor = page.locator('erp-tenant-editor-page');
          const field = (key) =>
            editor.getByRole('textbox', {
              name: captions['tenantManagement.' + key],
              exact: false,
            });
          const tab = (id) =>
            editor.getByRole('tab', { name: captions['tenantManagement.tabs.' + id], exact: true });
          const save = editor
            .locator('erp-form form')
            .getByRole('button', { name: text['actions.save'], exact: true });
          await expect(editor).toBeVisible();
          if (scenario === 'detail-forbidden') {
            await expect(editor).toContainText(text['authorization.forbidden.title']);
            await expect(
              editor.getByRole('button', { name: text['actions.retry'], exact: true }),
            ).toHaveCount(0);
            assert.equal(detailCalls, 1);
          } else if (scenario === 'detail-error' || scenario === 'catalog-incompatible') {
            await editor.getByRole('button', { name: text['actions.retry'], exact: true }).click();
            await expect(field('name')).toHaveValue(tenant.name);
            assert.equal(detailCalls, 2);
            if (scenario === 'catalog-incompatible') {
              assert.equal(catalogCalls, 3);
              await tab('entitlements').click();
              await expect(
                editor.getByRole('checkbox', { name: 'New module', exact: true }),
              ).toBeChecked();
            }
            assert.equal(writes.length, 0);
          } else {
            if (editing) {
              await expect(field('name')).toHaveValue(tenant.name);
              await field('name').fill('Changed Tenant');
            } else {
              await field('identifier').fill('browser-tenant');
              await field('name').fill('Browser Tenant');
              await tab('subscription').click();
              await field('endsOn').fill('2027-12-31');
            }
            await save.click();
            await expect.poll(() => writes.length).toBe(1);
            if (scenario === 'pending') {
              await expect(save).toBeDisabled();
              await expect(
                editor.getByRole('button', { name: text['actions.close'], exact: true }),
              ).toHaveCount(0);
              await expect(
                editor.getByRole('button', { name: text['actions.cancel'], exact: true }),
              ).toBeDisabled();
              await page.keyboard.press('Escape');
              await expect(editor).toBeVisible();
              assert.equal(writes.length, 1);
              release();
              await expect(editor).toHaveCount(0);
            } else if (scenario === 'mutation-forbidden') {
              await expect(editor).toContainText(text['authorization.forbidden.title']);
              await expect(save).toHaveCount(0);
              assert.equal(writes.length, 1);
            } else if (scenario === 'field' || scenario === 'duplicate') {
              const key = scenario === 'field' ? 'name' : 'identifier';
              await expect(field(key)).toBeFocused();
              await expect(field(key)).toHaveAttribute('aria-invalid', 'true');
              await expect(editor.locator('erp-validation-summary')).toContainText(
                scenario === 'field'
                  ? 'This tenant name is reserved.'
                  : captions['tenantManagement.duplicateIdentifier'],
              );
              await expect(save).toBeEnabled();
            } else if (scenario === 'seat') {
              await expect(tab('subscription')).toHaveAttribute('aria-selected', 'true');
              await expect(field('maxAdmins')).toBeFocused();
              await expect(field('maxUsers')).toHaveAttribute('aria-invalid', 'true');
              await expect(editor.locator('erp-validation-summary')).toContainText(
                captions['tenantManagement.seatLimitBelowUsage'],
              );
            } else {
              await expect(save).toBeDisabled();
              await expect(editor).toContainText(
                captions[
                  'tenantManagement.' +
                    (scenario === 'conflict' ? 'concurrencyConflict' : 'mutationUncertain')
                ],
              );
              assert.equal(writes.length, 1);
              if (scenario === 'conflict') {
                await editor
                  .getByRole('button', {
                    name: captions['tenantManagement.reloadCurrent'],
                    exact: true,
                  })
                  .click();
                const consent = page.getByRole('dialog', {
                  name: text['messages.unsavedChangesTitle'],
                  exact: true,
                });
                await expect(consent).toBeVisible();
                await consent
                  .locator('.dialog-actions')
                  .getByRole('button', { name: text['actions.cancel'], exact: true })
                  .click();
                await expect(field('name')).toHaveValue('Changed Tenant');
                assert.equal(detailCalls, 1);
              }
            }
          }
        }
        await expect(page.locator('body')).not.toContainText('PRIVATE_DIAGNOSTIC_MUST_STAY_HIDDEN');
        assert.deepEqual(errors, []);
        results.push({
          language,
          scenario,
          passed: true,
          writes: writes.length,
          detailCalls,
          catalogCalls,
          pageCalls,
        });
        console.log(`Tenant failure passed ${language}/${scenario}`);
      } catch (error) {
        await page
          .screenshot({ path: path.join(output, 'failure-negative.png'), fullPage: true })
          .catch(() => {});
        throw Error(`Tenant failure ${language}/${scenario} at ${stage}: ${error}`, {
          cause: error,
        });
      } finally {
        release();
        await context.close();
      }
    }
  }
} finally {
  fs.writeFileSync(
    path.join(output, smoke ? 'failure-smoke-results.json' : 'failure-results.json'),
    JSON.stringify(results, null, 2),
  );
  await browser.close();
}

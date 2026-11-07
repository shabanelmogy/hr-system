import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { dashboardFixture } from '../src/app/platform/tenants/dashboard.fixture.ts';
import {
  systemErrorLogDetailFixture,
  systemErrorLogSettingsFixture,
} from '../src/app/platform/system-error-logs/error-log.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(root, '../.codex-tmp/angular-system-error-logs');
const readResources = (name) =>
  JSON.parse(fs.readFileSync(path.join(root, `src/locales/generated/${name}.json`), 'utf8'));
const captions = readResources('platform-advanced-tools'),
  core = readResources('core');
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const scenarios = [
  'no-list-grant',
  'wrong-role',
  'list403',
  'list-error',
  'empty',
  'detail-no-grant',
  'detail403',
  'detail404',
  'detail-malformed',
  'export-no-grant',
  'export403',
  'export-limit',
  'invalid-range',
  'settings-no-grant',
  'settings-view-only',
  'settings-readonly',
  'settings-field-error',
  'settings-uncertain',
];
const selected = process.argv
  .find((argument) => argument.startsWith('--scenario='))
  ?.slice('--scenario='.length);
const results = [];
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const language of process.argv.includes('--smoke') ? ['en'] : ['en', 'ar'])
    for (const scenario of scenarios.filter((name) => !selected || name === selected)) {
      const context = await browser.newContext({
        ignoreHTTPSErrors: true,
        viewport: { width: 1440, height: 1050 },
        reducedMotion: 'reduce',
      });
      await context.addCookies(
        Object.entries({
          i18next: language,
          currentMode: language === 'ar' ? 'dark' : 'light',
          themePalette: 'green',
        }).map(([name, value]) => ({ name, value, url: origin })),
      );
      let listCalls = 0,
        detailCalls = 0,
        exportCalls = 0,
        settingCalls = 0,
        writeCalls = 0;
      const errors = [];
      const settingsRoute = scenario.startsWith('settings-');
      await context.route('**/api/**', async (route) => {
        try {
          const request = route.request(),
            url = new URL(request.url()),
            endpoint = url.pathname;
          assert.equal(url.origin, api);
          let body,
            status = 200;
          if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh')) {
            let permissions = [
              'SystemErrorLogs:View',
              'SystemErrorLogs:ViewDetails',
              'SystemErrorLogs:Export',
              'ErrorLogSettings:View',
              'ErrorLogSettings:Edit',
            ];
            if (scenario === 'no-list-grant')
              permissions = permissions.filter((key) => key !== 'SystemErrorLogs:View');
            if (scenario === 'detail-no-grant')
              permissions = permissions.filter((key) => key !== 'SystemErrorLogs:ViewDetails');
            if (scenario === 'export-no-grant')
              permissions = permissions.filter((key) => key !== 'SystemErrorLogs:Export');
            if (scenario === 'settings-no-grant') permissions = ['SystemErrorLogs:View'];
            if (scenario === 'settings-view-only') permissions = ['ErrorLogSettings:View'];
            body = {
              isAuthenticated: true,
              user: {
                ...sessionFixture,
                roles: [scenario === 'wrong-role' ? 'tenant_admin' : 'super_admin'],
                permissions,
                tenantReadOnly: scenario === 'settings-readonly',
              },
            };
          } else if (endpoint.endsWith('/runtime'))
            body = { catalogVersion: version, revision: 0, overrides: [] };
          else if (endpoint.endsWith('/csrf')) body = { requestToken: 'error-negative-fixture' };
          else if (endpoint.endsWith('/modules/accessible')) body = [];
          else if (endpoint.endsWith('/getDashboardSummary')) body = dashboardFixture;
          else if (endpoint.endsWith('/realtime-token')) {
            status = 403;
            body = {};
          } else if (endpoint.endsWith('/system-error-logs/settings')) {
            if (request.method() === 'PUT') {
              writeCalls++;
              assert.ok(['settings-field-error', 'settings-uncertain'].includes(scenario));
              assert.equal(request.headers()['x-erp-xsrf'], 'error-negative-fixture');
              status = scenario === 'settings-field-error' ? 400 : 500;
              body = {
                errors: {
                  'Request.RetentionDays': [
                    language === 'ar'
                      ? 'اختر مدة أقل للاحتفاظ.'
                      : 'Choose a shorter retention period.',
                  ],
                },
              };
            } else {
              settingCalls++;
              body = systemErrorLogSettingsFixture;
            }
          } else if (endpoint.endsWith('/system-error-logs/export')) {
            exportCalls++;
            status = scenario === 'export403' ? 403 : 400;
            body = {
              title: scenario === 'export403' ? 'Forbidden' : 'Export limit exceeded',
              privateDebug: 'never-show-private-debug',
            };
          } else if (endpoint.endsWith('/system-error-logs')) {
            listCalls++;
            status =
              scenario === 'list403'
                ? 403
                : scenario === 'list-error' && listCalls === 1
                  ? 503
                  : 200;
            body =
              status === 200
                ? {
                    items: scenario === 'empty' ? [] : [systemErrorLogDetailFixture.entry],
                    totalCount: scenario === 'empty' ? 0 : 1,
                    page: Number(url.searchParams.get('page')),
                    pageSize: Number(url.searchParams.get('pageSize')),
                  }
                : { title: 'Private internal failure', privateDebug: 'never-show-private-debug' };
          } else if (endpoint.includes('/system-error-logs/')) {
            detailCalls++;
            status = scenario === 'detail403' ? 403 : scenario === 'detail404' ? 404 : 200;
            body =
              status === 200
                ? scenario === 'detail-malformed'
                  ? {
                      entry: {
                        ...systemErrorLogDetailFixture.entry,
                        id: '00000000-0000-0000-0000-000000000000',
                      },
                      diagnostics: ['never-show-private-debug'],
                    }
                  : systemErrorLogDetailFixture
                : { title: 'Private failure', privateDebug: 'never-show-private-debug' };
          } else throw Error('Unexpected request ' + request.method() + ' ' + endpoint);
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
      const t = (key) => captions[language]['errorLogs.' + key],
        s = (key) => captions[language]['errorLogSettings.' + key];
      await page.goto(
        origin + (settingsRoute ? '/super-admin/error-log-settings' : '/super-admin/error-logs'),
      );
      const owner = page.locator(
        settingsRoute ? 'erp-error-log-settings-page' : 'erp-system-error-logs-page',
      );
      if (['no-list-grant', 'wrong-role', 'settings-no-grant'].includes(scenario)) {
        await expect(page).not.toHaveURL(
          new RegExp(
            settingsRoute ? '/super-admin/error-log-settings$' : '/super-admin/error-logs$',
          ),
        );
        assert.equal(settingsRoute ? settingCalls : listCalls, 0);
      } else if (settingsRoute) {
        await expect(owner.locator('erp-metric-card')).toHaveCount(5);
        const edit = owner.getByRole('button', { name: s('edit'), exact: true });
        if (['settings-view-only', 'settings-readonly'].includes(scenario))
          await expect(edit).toHaveCount(0);
        else {
          await edit.click();
          const dialog = page
            .getByRole('dialog')
            .filter({ has: page.locator('erp-retention-form') });
          await dialog.locator('erp-numeric-field input').fill('120');
          const save = dialog.getByRole('button', { name: s('save'), exact: true });
          await save.click();
          if (scenario === 'settings-field-error')
            await expect(dialog.locator('erp-numeric-field')).toContainText(
              language === 'ar' ? 'اختر مدة أقل للاحتفاظ.' : 'Choose a shorter retention period.',
            );
          else {
            await expect(dialog).toContainText(s('saveUncertain'));
            await expect(save).toBeDisabled();
          }
          assert.equal(writeCalls, 1);
          await expect(dialog.locator('erp-numeric-field input')).toHaveValue('120');
        }
      } else if (scenario === 'list403') {
        await expect(owner.getByTestId('system-error-logs')).toHaveAttribute(
          'data-kind',
          'forbidden',
        );
        await owner.locator('erp-page-header .refresh button').click();
        assert.equal(listCalls, 1);
      } else {
        const workspace = owner.getByTestId('system-error-logs');
        if (scenario === 'list-error') {
          await expect(workspace).toHaveAttribute('data-kind', 'error');
          await workspace
            .getByRole('button', { name: core[language]['actions.retry'], exact: true })
            .click();
        }
        await expect(workspace).toHaveAttribute('data-kind', 'ready');
        if (scenario === 'empty') await expect(workspace).toContainText(t('empty'));
        else if (scenario.startsWith('detail')) {
          const view = workspace.getByRole('button', { name: t('view'), exact: true });
          if (scenario === 'detail-no-grant') {
            await expect(view).toHaveCount(0);
            assert.equal(detailCalls, 0);
          } else {
            await view.first().click();
            const dialog = page.getByRole('dialog');
            await expect(dialog).toContainText(
              scenario === 'detail403'
                ? core[language]['authorization.forbidden.title']
                : t('loadFailed'),
            );
            await expect(dialog.locator('erp-copy-button')).toHaveCount(0);
            if (scenario === 'detail403') {
              await dialog
                .getByRole('button', { name: core[language]['actions.close'], exact: true })
                .last()
                .click();
              await expect(view).toHaveCount(0);
              assert.equal(detailCalls, 1);
            }
          }
        } else if (scenario.startsWith('export')) {
          const action = owner
            .locator('erp-page-header')
            .getByRole('button', { name: t('export'), exact: true });
          if (scenario === 'export-no-grant') {
            await expect(action).toHaveCount(0);
            assert.equal(exportCalls, 0);
          } else {
            await action.click();
            await expect(owner).toContainText(t('exportFailed'));
            assert.equal(exportCalls, 1);
            if (scenario === 'export403') await expect(action).toHaveCount(0);
          }
        } else if (scenario === 'invalid-range') {
          await owner.locator('erp-page-header .filter button').click();
          const fields = owner.locator('erp-error-log-criteria erp-date-field input');
          await fields.nth(0).fill('2026-02-10');
          await expect(workspace).toHaveAttribute('data-kind', 'ready');
          const before = listCalls;
          await fields.nth(1).fill('2026-02-01');
          await expect(owner).toContainText(t('invalidRange'));
          await expect(workspace).toHaveAttribute('data-kind', 'error');
          assert.equal(listCalls, before);
          await expect(
            owner
              .locator('erp-page-header')
              .getByRole('button', { name: t('export'), exact: true }),
          ).toBeDisabled();
        }
      }
      assert.ok(!(await page.locator('body').innerText()).includes('never-show-private-debug'));
      assert.deepEqual(errors, []);
      results.push({
        language,
        scenario,
        passed: true,
        listCalls,
        detailCalls,
        exportCalls,
        settingCalls,
        fixtureWrites: writeCalls,
        hostedWrites: 0,
      });
      console.log(JSON.stringify(results.at(-1)));
      await context.close();
    }
  fs.writeFileSync(
    path.join(output, 'failure-results.json'),
    JSON.stringify({ verifiedAt: new Date().toISOString(), results }, null, 2),
  );
} finally {
  await browser.close();
}

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import {
  auditFixture,
  auditDetailFixture,
} from '../src/app/platform/system-audit/audit.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(root, '../.codex-tmp/angular-system-audit');
fs.mkdirSync(output, { recursive: true });
const core = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const advanced = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/platform-advanced-tools.json'), 'utf8'),
);
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const language of process.argv.includes('--smoke') ? ['en'] : ['en', 'ar'])
    for (const scenario of [
      'no-grant',
      'wrong-role',
      'read-only',
      'empty',
      'list-error',
      'list-forbidden',
      'filters-error',
      'filters401',
      'filters403',
      'detail-error',
      'detail404',
      'detail403',
      'detail-malformed',
      'no-changes',
      'next-error',
      'invalid-range',
    ].filter((value) => {
      const selected = process.argv.find((argument) => argument.startsWith('--scenario='));
      return !selected || value === selected.slice('--scenario='.length);
    })) {
      const context = await browser.newContext({
        ignoreHTTPSErrors: true,
        reducedMotion: 'reduce',
        viewport: { width: 1440, height: 1050 },
      });
      await context.addCookies(
        Object.entries({
          i18next: language,
          currentMode: language === 'ar' ? 'dark' : 'light',
          themePalette: 'green',
        }).map(([name, value]) => ({ name, value, url: origin })),
      );
      const text = core[language],
        caption = (key) => text['auditLog.' + key];
      const requests = [],
        errors = [],
        writes = [];
      let listCalls = 0,
        filterCalls = 0,
        detailCalls = 0,
        nextCalls = 0;
      await context.route('**/api/**', async (route) => {
        try {
          const request = route.request(),
            url = new URL(request.url()),
            endpoint = url.pathname;
          assert.equal(url.origin, api);
          if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
            writes.push(endpoint);
            throw Error('Unexpected write');
          }
          let status = 200,
            body;
          if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh'))
            body = {
              isAuthenticated: true,
              user: {
                ...sessionFixture,
                roles: [scenario === 'wrong-role' ? 'admin' : 'super_admin'],
                permissions: scenario === 'no-grant' ? [] : ['SystemAuditTrail:View'],
                tenantReadOnly: scenario === 'read-only',
              },
            };
          else if (endpoint.endsWith('/csrf')) body = { requestToken: 'audit-fixture-token' };
          else if (endpoint.endsWith('/runtime'))
            body = { catalogVersion: version, revision: 0, overrides: [] };
          else if (endpoint.endsWith('/realtime-token')) {
            status = 403;
            body = {};
          } else if (endpoint.endsWith('/modules/accessible')) body = [];
          else if (endpoint.endsWith('/system-audit-trail/filters')) {
            filterCalls++;
            status =
              scenario === 'filters401'
                ? 401
                : scenario === 'filters403'
                  ? 403
                  : scenario === 'filters-error' && filterCalls === 1
                    ? 503
                    : 200;
            body =
              status === 200
                ? { modules: [{ moduleCode: 'hr', entityNames: ['Department'] }] }
                : { title: 'PRIVATE_DIAGNOSTIC' };
          } else if (endpoint.endsWith('/system-audit-trail')) {
            listCalls++;
            requests.push(Object.fromEntries(url.searchParams));
            if (url.searchParams.has('cursor')) nextCalls++;
            status =
              scenario === 'list-forbidden'
                ? 403
                : scenario === 'list-error' && listCalls === 1
                  ? 503
                  : scenario === 'next-error' && nextCalls === 1
                    ? 503
                    : 200;
            body =
              status === 200
                ? {
                    items: scenario === 'empty' ? [] : [auditFixture],
                    nextCursor:
                      scenario === 'next-error' && !url.searchParams.has('cursor')
                        ? 'opaque-next'
                        : null,
                  }
                : { title: 'PRIVATE_DIAGNOSTIC', detail: 'PRIVATE_DIAGNOSTIC' };
          } else if (endpoint.includes('/system-audit-trail/')) {
            detailCalls++;
            status =
              scenario === 'detail403'
                ? 403
                : scenario === 'detail404'
                  ? 404
                  : scenario === 'detail-error' && detailCalls === 1
                    ? 503
                    : 200;
            body =
              status === 200
                ? {
                    ...auditDetailFixture,
                    entry:
                      scenario === 'detail-malformed' ? { ...auditFixture, id: 99 } : auditFixture,
                    changes: scenario === 'no-changes' ? [] : auditDetailFixture.changes,
                  }
                : { title: 'PRIVATE_DIAGNOSTIC', detail: 'PRIVATE_DIAGNOSTIC' };
          } else if (endpoint.endsWith('/tenants/getDashboardSummary')) body = {};
          else throw Error('Unexpected request ' + endpoint);
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
      const workspace = page.getByTestId('system-audit');
      let stage = 'entry';
      try {
        await page.goto(origin + '/super-admin/audit-trail');
        if (['no-grant', 'wrong-role'].includes(scenario)) {
          await expect(page).toHaveURL(origin + (scenario === 'wrong-role' ? '/apps' : '/home'), {
            timeout: 60000,
          });
          await expect(page.locator('erp-system-audit-page')).toHaveCount(0);
          assert.equal(listCalls, 0);
          assert.equal(filterCalls, 0);
        } else {
          await expect(workspace).toBeVisible({ timeout: 60000 });
          stage = scenario;
          const shell = page.locator('erp-system-audit-page');
          const grid = workspace.locator('erp-audit-collection > erp-data-table');
          if (['list-forbidden', 'filters401', 'filters403'].includes(scenario)) {
            await expect(workspace).toHaveAttribute('data-kind', 'forbidden');
            await expect(workspace.locator('[data-collection-row]')).toHaveCount(0);
            await expect(shell).toContainText(text['authorization.forbidden.title']);
            const before = { listCalls, filterCalls };
            await shell
              .locator('erp-page-header')
              .getByRole('button', { name: text['navigation.refresh'], exact: true })
              .click();
            assert.deepEqual({ listCalls, filterCalls }, before);
          } else if (scenario === 'empty') {
            await expect(workspace).toHaveAttribute('data-kind', 'ready');
            await expect(workspace).toContainText(caption('noEntries'));
          } else if (scenario === 'list-error') {
            await expect(workspace).toHaveAttribute('data-kind', 'error');
            await workspace
              .getByRole('button', { name: text['actions.retry'], exact: true })
              .click();
            await expect(workspace).toHaveAttribute('data-kind', 'ready');
            assert.equal(listCalls, 2);
          } else if (scenario === 'filters-error') {
            const feedback = shell.locator('main > erp-feedback-state');
            await expect(feedback).toContainText(caption('loadError'));
            await feedback.getByRole('button', { name: caption('retry'), exact: true }).click();
            await expect(feedback).toHaveCount(0);
            assert.equal(filterCalls, 2);
          } else if (scenario === 'invalid-range') {
            await expect(workspace).toHaveAttribute('data-kind', 'ready');
            await shell
              .locator('erp-page-header')
              .getByRole('button', { name: text['navigation.filter'], exact: true })
              .click();
            const criteria = grid.locator('erp-audit-criteria');
            await criteria
              .getByRole('textbox', { name: caption('from'), exact: true })
              .fill('2026-11-07');
            await expect.poll(() => requests.at(-1).fromUtc).toBeTruthy();
            const count = listCalls;
            await criteria
              .getByRole('textbox', { name: caption('to'), exact: true })
              .fill('2026-11-06');
            await expect(workspace).toHaveAttribute('data-kind', 'error');
            await expect(shell).toContainText(advanced[language]['errorLogs.invalidRange']);
            assert.equal(listCalls, count);
            await criteria
              .getByRole('textbox', { name: caption('to'), exact: true })
              .fill('2026-11-08');
            await expect(workspace).toHaveAttribute('data-kind', 'ready');
          } else if (scenario === 'next-error') {
            await expect(workspace).toHaveAttribute('data-kind', 'ready');
            await grid
              .getByRole('button', { name: text['pagination.goToNextRecord'], exact: true })
              .click();
            const feedback = shell.locator('main > erp-feedback-state');
            await expect(feedback).toContainText(caption('loadError'));
            await expect(grid.locator('tbody [data-collection-row]')).toHaveCount(1);
            await feedback.getByRole('button', { name: caption('retry'), exact: true }).click();
            await expect(feedback).toHaveCount(0);
            assert.equal(nextCalls, 2);
          } else {
            await expect(workspace).toHaveAttribute('data-kind', 'ready');
            await grid.locator('tbody [data-collection-row]').first().click();
            let dialog = page.getByRole('dialog');
            await expect(dialog).toBeVisible();
            if (['detail-error', 'detail404', 'detail-malformed'].includes(scenario)) {
              await expect(dialog).toContainText(caption('loadError'));
              if (scenario === 'detail-error') {
                await dialog.getByRole('button', { name: caption('retry'), exact: true }).click();
                await expect(dialog.locator('erp-audit-changes')).toBeVisible();
                assert.equal(detailCalls, 2);
              }
            } else if (scenario === 'detail403') {
              await expect(dialog).toContainText(text['authorization.forbidden.title']);
              await expect(dialog.locator('erp-record-summary')).toHaveCount(0);
              await expect(workspace).toHaveAttribute('data-kind', 'forbidden');
              await expect(workspace.locator('[data-collection-row]')).toHaveCount(0);
              await expect(
                dialog.getByRole('button', { name: caption('retry'), exact: true }),
              ).toHaveCount(0);
            } else if (scenario === 'no-changes')
              await expect(dialog).toContainText(caption('noFieldChanges'));
            else await expect(dialog.locator('erp-audit-changes')).toBeVisible();
          }
        }
        await expect(page.locator('body')).not.toContainText('PRIVATE_DIAGNOSTIC');
        assert.deepEqual(writes, []);
        assert.deepEqual(errors, []);
        results.push({
          language,
          scenario,
          passed: true,
          listCalls,
          filterCalls,
          detailCalls,
          nextCalls,
          businessWrites: 0,
        });
        console.log(`System Audit negative passed ${language}/${scenario}`);
      } catch (error) {
        console.log(JSON.stringify({ scenario, url: page.url(), errors, listCalls, filterCalls }));
        await page
          .screenshot({ path: path.join(output, 'negative-failure.png'), fullPage: true })
          .catch(() => {});
        throw Error(`Audit ${language}/${scenario} at ${stage}: ${error}`, { cause: error });
      } finally {
        await context.close();
      }
    }
} finally {
  fs.writeFileSync(
    path.join(
      output,
      process.argv.includes('--smoke') ? 'negative-smoke-results.json' : 'negative-results.json',
    ),
    JSON.stringify(results, null, 2),
  );
  await browser.close();
}

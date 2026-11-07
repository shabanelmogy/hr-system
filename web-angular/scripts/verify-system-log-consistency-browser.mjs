import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

// Proxy only synthetic log reads into the real local .NET controllers/handlers/stores.
const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const proof = 'http://127.0.0.1:7359';
const output = path.resolve(root, '../.codex-tmp/system-log-consistency');
fs.mkdirSync(output, { recursive: true });
const core = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const captions = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/platform-advanced-tools.json'), 'utf8'),
);
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const language of process.argv.includes('--smoke') ? ['en'] : ['en', 'ar'])
    for (const mode of process.argv.includes('--smoke') ? ['light'] : ['light', 'dark'])
      for (const width of process.argv.includes('--smoke') ? [1440] : [390, 1440]) {
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
        assert.equal((await context.request.get(proof + '/fixture-health')).status(), 200);
        const errors = [],
          requests = [];
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
                  permissions: [
                    'SystemAuditTrail:View',
                    'SystemErrorLogs:View',
                    'SystemErrorLogs:ViewDetails',
                  ],
                },
              };
            else if (endpoint.endsWith('/runtime'))
              body = { catalogVersion: version, revision: 0, overrides: [] };
            else if (endpoint.endsWith('/csrf')) body = { requestToken: 'log-fixture' };
            else if (endpoint.endsWith('/modules/accessible')) body = [];
            else if (endpoint.endsWith('/realtime-token')) {
              status = 403;
              body = {};
            } else if (
              endpoint.startsWith('/api/v1/system-audit-trail') ||
              endpoint.startsWith('/api/v1/system-error-logs')
            ) {
              assert.ok(['GET', 'POST'].includes(request.method()));
              if (request.method() === 'POST') {
                assert.ok(endpoint.endsWith('/query'));
                assert.equal(request.headers()['x-erp-xsrf'], 'log-fixture');
              }
              const criteria =
                request.method() === 'POST'
                  ? request.postDataJSON()
                  : Object.fromEntries(url.searchParams);
              requests.push({ endpoint, method: request.method(), criteria });
              const response = await context.request.fetch(proof + endpoint + url.search, {
                method: request.method(),
                ...(request.method() === 'POST' ? { data: criteria } : {}),
                headers: { 'X-ERP-Log-Fixture': 'allowed', 'X-ERP-XSRF': 'log-fixture' },
              });
              await route.fulfill({
                status: response.status(),
                body: await response.body(),
                headers: {
                  'content-type': response.headers()['content-type'] ?? 'application/json',
                },
              });
              return;
            } else throw Error('Unexpected fixture request: ' + endpoint);
            assert.equal(request.method(), 'GET');
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
          errors.push('Unexpected native dialog');
          await dialog.dismiss();
        });
        for (const owner of [
          { route: '/super-admin/audit-trail', test: 'system-audit', field: 'record', count: 21 },
          {
            route: '/super-admin/error-logs',
            test: 'system-error-logs',
            field: 'summary',
            count: 21,
          },
        ]) {
          await page.goto(origin + owner.route);
          const workspace = page.getByTestId(owner.test),
            grid = workspace.locator('erp-data-table');
          await expect(workspace).toHaveAttribute('data-kind', 'ready');
          await expect(grid.locator('.record-navigation-layout .record-controls')).toBeVisible();
          await grid
            .locator(`th[data-column-key="${owner.field}"] p-column-filter button`)
            .first()
            .click();
          const overlay = page.locator('.p-datatable-filter-overlay');
          await expect(overlay).toBeVisible();
          await overlay.locator('erp-grid-filter-input input').first().fill('Target');
          await overlay
            .getByRole('button', { name: core[language]['collections.apply'], exact: true })
            .click();
          await expect.poll(() => requests.at(-1)?.method).toBe('POST');
          await expect
            .poll(
              () =>
                JSON.parse(requests.at(-1)?.criteria.columnFilters ?? '[]')[0]?.constraints[0]
                  ?.value,
            )
            .toBe('Target');
          await expect(workspace).toHaveAttribute('data-kind', 'ready');
          await expect(grid.locator('tbody [data-collection-row]')).toHaveCount(owner.count);
          const filtered = requests.at(-1);
          assert.equal(filtered.endpoint.endsWith('/query'), true);
          if (owner.test === 'system-error-logs') {
            await page.locator('erp-page-header [data-view=cards] button').click();
            const cards = workspace.locator('erp-card-list');
            await expect(cards.locator('[data-collection-row]')).toHaveCount(owner.count);
            await expect(cards.locator('erp-record-summary.compact')).toHaveCount(owner.count);
            assert.equal(
              requests.at(-1),
              filtered,
              'Switching view must retain captured remote criteria',
            );
            const geometry = await cards.evaluate((element) => {
              const card = element.querySelector('article');
              return {
                columns: getComputedStyle(
                  element.querySelector('.cards'),
                ).gridTemplateColumns.split(' ').length,
                cardHeight: card.getBoundingClientRect().height,
                metadataColumns: getComputedStyle(
                  card.querySelector('dl'),
                ).gridTemplateColumns.split(' ').length,
              };
            });
            assert.equal(geometry.columns, width === 390 ? 1 : 4);
            assert.equal(geometry.metadataColumns, 2);
            assert.ok(geometry.cardHeight < 390, JSON.stringify(geometry));
            await expect(cards.locator('.record-navigation-layout .record-controls')).toBeVisible();
            await page.screenshot({
              path: path.join(output, `${language}-${mode}-${width}-cards.png`),
            });
          } else {
            await expect(
              grid.getByRole('button', {
                name: core[language]['pagination.goToLastRecord'],
                exact: true,
              }),
            ).toBeDisabled();
            await expect(grid.locator('.record-count')).toContainText(
              core[language]['pagination.unknownTotal'],
            );
          }
          const overflow = await page.evaluate(() => ({
            x: document.documentElement.scrollWidth - innerWidth,
            y: document.documentElement.scrollHeight - innerHeight,
          }));
          assert.ok(overflow.x <= 1 && overflow.y <= 1, JSON.stringify(overflow));
          results.push({
            language,
            mode,
            width,
            owner: owner.test,
            matched: owner.count,
            actualDotnetQuery: true,
            overflow,
          });
        }
        assert.deepEqual(errors, []);
        await context.close();
        console.log(`System log consistency passed ${language}/${mode}/${width}`);
      }
} finally {
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  await browser.close();
}

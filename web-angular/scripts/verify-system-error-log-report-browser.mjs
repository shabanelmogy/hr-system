import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const output = path.resolve(
  root,
  '../.codex-tmp/system-error-log-report-browser' +
    (process.env.PRODUCTION_EXPECTED === '1' ? '-production' : ''),
);
const core = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const catalogVersion = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
fs.mkdirSync(output, { recursive: true });
const results = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const language of ['en', 'ar'])
    for (const mode of ['light', 'dark'])
      for (const width of [390, 1440]) {
        let reportPermission = true;
        const calls = [],
          errors = [];
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
        await context.route('**/api/**', async (route) => {
          const request = route.request(),
            url = new URL(request.url()),
            endpoint = url.pathname;
          let body,
            status = 200;
          if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh'))
            body = {
              isAuthenticated: true,
              user: {
                ...sessionFixture,
                roles: ['super_admin'],
                permissions: [
                  'SystemErrorLogs:View',
                  ...(reportPermission ? ['GlobalCrystalReports:View'] : []),
                ],
              },
            };
          else if (endpoint.endsWith('/runtime'))
            body = { catalogVersion, revision: 0, overrides: [] };
          else if (endpoint.endsWith('/csrf')) body = { requestToken: 'synthetic-report-fixture' };
          else if (endpoint.endsWith('/modules/accessible')) body = [];
          else if (endpoint.endsWith('/realtime-token')) {
            status = 403;
            body = {};
          } else if (endpoint.endsWith('/system-error-logs'))
            body = { items: [], totalCount: 0, page: 1, pageSize: 25 };
          else if (endpoint.endsWith('/global-crystal-reports')) {
            assert.equal(request.method(), 'GET');
            assert.equal(url.searchParams.get('entityKey'), 'system-error-logs');
            calls.push('catalog');
            body = [];
          } else {
            errors.push(`${request.method()} ${endpoint}`);
            await route.abort();
            return;
          }
          await route.fulfill({
            status,
            contentType: 'application/json',
            body: JSON.stringify(body),
          });
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(origin + '/super-admin/error-logs');
        const owner = page.locator('erp-system-error-logs-page');
        await expect(owner.getByTestId('system-error-logs')).toHaveAttribute('data-kind', 'ready');
        await expect(page.locator('erp-viewport-debugger')).toHaveCount(
          process.env.PRODUCTION_EXPECTED === '1' ? 0 : 1,
        );
        const reportButton = owner.locator('erp-page-header [data-view=report] button');
        if (await reportButton.count()) await reportButton.click();
        else {
          await owner
            .getByRole('button', { name: core[language]['navigation.moreViews'], exact: true })
            .click();
          await page
            .getByRole('button', { name: core[language]['views.report'], exact: true })
            .click();
        }
        const viewer = owner.locator('erp-global-report-view');
        await expect(viewer).toBeVisible();
        await expect(viewer.locator('erp-feedback-state').first()).toBeVisible();
        await expect(viewer.locator('erp-pdf-viewer')).toHaveCount(0);
        assert.equal(calls.length, 1);
        const geometry = await page.evaluate(() => ({
          horizontal: document.documentElement.scrollWidth - innerWidth,
          vertical: document.documentElement.scrollHeight - innerHeight,
        }));
        assert.ok(geometry.horizontal <= 1 && geometry.vertical <= 1, JSON.stringify(geometry));
        await page.screenshot({
          path: path.join(output, `${language}-${mode}-${width}-empty.png`),
          fullPage: false,
        });
        reportPermission = false;
        await page.reload();
        await expect(owner.locator('erp-page-header [data-view=report]')).toHaveCount(0);
        await expect(owner.locator('erp-global-report-view')).toHaveCount(0);
        await expect(owner.locator('erp-data-table')).toBeVisible();
        assert.equal(calls.length, 1);
        assert.deepEqual(errors, []);
        results.push({
          language,
          mode,
          width,
          catalogCalls: calls.length,
          emptyTemplateHonest: true,
          permissionFallback: true,
          realCrystalRender: false,
          geometry,
        });
        console.log(JSON.stringify(results.at(-1)));
        await context.close();
      }
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}

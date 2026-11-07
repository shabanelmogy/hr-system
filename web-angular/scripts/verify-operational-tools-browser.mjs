import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const output = path.resolve(root, '../.codex-tmp/operational-tools-browser');
const catalogVersion = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const texts = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/platform-advanced-tools.json'), 'utf8'),
);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
fs.mkdirSync(output, { recursive: true });
try {
  for (const language of ['en', 'ar'])
    for (const mode of ['light', 'dark'])
      for (const width of [390, 1440]) {
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          viewport: { width, height: 950 },
          reducedMotion: 'reduce',
        });
        await context.addCookies(
          Object.entries({ i18next: language, currentMode: mode }).map(([name, value]) => ({
            name,
            value,
            url: origin,
          })),
        );
        const unexpected = [];
        let failHealth = false,
          failDashboard = false,
          denyDashboard = false;
        let documents = 0,
          checks = 0;
        await context.route('**/api/**', async (route) => {
          const endpoint = new URL(route.request().url()).pathname;
          let body,
            status = 200;
          if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh'))
            body = {
              isAuthenticated: true,
              user: {
                ...sessionFixture,
                roles: ['super_admin'],
                permissions: ['SystemHealth:View', 'Hangfire:View'],
              },
            };
          else if (endpoint.endsWith('/runtime'))
            body = { catalogVersion, revision: 0, overrides: [] };
          else if (endpoint.endsWith('/csrf')) body = { requestToken: 'synthetic' };
          else if (endpoint.endsWith('/modules/accessible')) body = [];
          else if (endpoint.endsWith('/realtime-token')) {
            status = 403;
            body = {};
          } else {
            unexpected.push(endpoint);
            await route.abort();
            return;
          }
          await route.fulfill({
            status,
            contentType: 'application/json',
            body: JSON.stringify(body),
          });
        });
        await context.route('**/health', async (route) => {
          checks++;
          await route.fulfill({
            status: 503,
            contentType: failHealth ? 'text/html' : 'application/json',
            body: failHealth
              ? '<html>gateway unavailable</html>'
              : JSON.stringify({
                  status: 'Unhealthy',
                  totalDuration: '00:00:01',
                  entries: {
                    sql: {
                      status: 'Unhealthy',
                      duration: '00:00:01',
                      description: 'Database unavailable',
                    },
                  },
                }),
          });
        });
        await context.route('**/hangfire**', async (route) => {
          if (route.request().url().startsWith(origin)) {
            await route.continue();
            return;
          }
          if (failDashboard || denyDashboard) {
            await route.fulfill({
              status: denyDashboard ? 403 : 503,
              contentType: 'text/html',
              body: 'Unavailable',
            });
            return;
          }
          if (route.request().resourceType() === 'document') documents++;
          // Synthetic embedded document checks Angular wiring/navigation, not a real
          // Hangfire deployment. Native CSRF and frame headers have separate API tests.
          await route.fulfill({
            contentType: 'text/html',
            body: '<!doctype html><html><title>Hangfire Dashboard</title><body><h1>Hangfire Dashboard</h1><a href="/hangfire/jobs/failed">Failed jobs</a></body></html>',
          });
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => unexpected.push(error.message));
        await page.goto(origin + '/advanced-tools/health-check');
        const owner = page.locator('erp-advanced-tool-page');
        await expect(owner.getByTestId('health-summary')).toContainText(
          texts[language]['healthCheck.statuses.unhealthy'],
        );
        await expect(owner.locator('erp-data-table')).toContainText('Database unavailable');
        failHealth = true;
        await owner
          .getByRole('button', { name: texts[language]['healthCheck.refresh'], exact: true })
          .click();
        await expect(owner.locator('erp-feedback-state')).toContainText(
          texts[language]['healthCheck.loadError'],
        );
        failHealth = false;
        await owner
          .getByRole('button', { name: texts[language]['healthCheck.retry'], exact: true })
          .click();
        await expect(owner.getByTestId('health-summary')).toBeVisible();
        await page.goto(origin + '/advanced-tools/hangfire-dashboard');
        const frame = owner.locator('iframe');
        await expect(frame).toBeVisible();
        const target = new URL(await frame.getAttribute('src'));
        assert.equal(target.pathname, '/hangfire');
        assert.equal(target.search, '');
        await expect(
          page
            .frameLocator('erp-advanced-tool-page iframe')
            .getByRole('heading', { name: 'Hangfire Dashboard' }),
        ).toBeVisible();
        await page
          .frameLocator('erp-advanced-tool-page iframe')
          .getByRole('link', { name: 'Failed jobs' })
          .click();
        await expect
          .poll(() =>
            page.frames().some((item) => new URL(item.url()).pathname === '/hangfire/jobs/failed'),
          )
          .toBe(true);
        await owner
          .getByRole('button', { name: texts[language]['healthCheck.refresh'], exact: true })
          .click();
        await expect(
          page
            .frameLocator('erp-advanced-tool-page iframe')
            .getByRole('heading', { name: 'Hangfire Dashboard' }),
        ).toBeVisible();
        const geometry = await page.evaluate(() => ({
          horizontal: document.documentElement.scrollWidth - innerWidth,
          vertical: document.documentElement.scrollHeight - innerHeight,
        }));
        assert.ok(geometry.horizontal <= 1 && geometry.vertical <= 1, JSON.stringify(geometry));
        const frameHeight = await frame.evaluate(
          (element) => element.getBoundingClientRect().height,
        );
        assert.ok(frameHeight > 300, `Frame height ${frameHeight}`);
        await page.screenshot({
          path: path.join(output, `${language}-${mode}-${width}-dashboard.png`),
        });
        failDashboard = true;
        await owner
          .getByRole('button', { name: texts[language]['healthCheck.refresh'], exact: true })
          .click();
        await expect(frame).toHaveCount(0);
        await expect(owner.locator('erp-feedback-state')).toContainText(
          texts[language]['hangfireDashboard.loadError'],
        );
        failDashboard = false;
        await owner
          .getByRole('button', { name: texts[language]['healthCheck.retry'], exact: true })
          .click();
        await expect(frame).toBeVisible();
        denyDashboard = true;
        await owner
          .getByRole('button', { name: texts[language]['healthCheck.refresh'], exact: true })
          .click();
        await expect(frame).toHaveCount(0);
        await expect(owner.locator('erp-feedback-state')).toBeVisible();
        assert.deepEqual(unexpected, []);
        results.push({
          language,
          mode,
          width,
          checks,
          documents,
          geometry,
          frameHeight,
          nativeDashboardVerified: false,
          syntheticEmbedding: true,
          nestedNavigation: true,
          retry: true,
          serverDenial: true,
        });
        console.log(JSON.stringify(results.at(-1)));
        await context.close();
      }
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}

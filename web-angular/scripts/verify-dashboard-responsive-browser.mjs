import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { dashboardFixture } from '../src/app/platform/tenants/dashboard.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const output = path.resolve(root, '../.codex-tmp/dashboard-responsive');
const core = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
function luminance(color) {
  const values = color
    .match(/[\d.]+/g)
    .slice(0, 3)
    .map(Number)
    .map((value) => {
      const channel = value / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
  return values.reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}
fs.mkdirSync(output, { recursive: true });
try {
  for (const language of ['en', 'ar'])
    for (const mode of ['light', 'dark']) {
      const context = await browser.newContext({
        ignoreHTTPSErrors: true,
        reducedMotion: 'reduce',
        viewport: { width: 1440, height: 900 },
        permissions: ['clipboard-read', 'clipboard-write'],
      });
      await context.addCookies(
        Object.entries({ i18next: language, currentMode: mode }).map(([name, value]) => ({
          name,
          value,
          url: origin,
        })),
      );
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
              permissions: ['Tenants:View', 'States:View'],
            },
          };
        else if (endpoint.endsWith('/csrf')) body = { requestToken: 'synthetic' };
        else if (endpoint.endsWith('/runtime'))
          body = { catalogVersion: version, revision: 0, overrides: [] };
        else if (endpoint.endsWith('/modules/accessible')) body = [];
        else if (endpoint.endsWith('/getDashboardSummary')) body = dashboardFixture;
        else if (endpoint.endsWith('/realtime-token')) {
          status = 403;
          body = {};
        } else {
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
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(origin + '/home');
      await expect(page.locator('[data-dashboard=ready]')).toBeVisible();
      for (const [width, height, open] of [
        [1440, 900, false],
        [900, 820, false],
        [900, 820, true],
        [891, 820, false],
        [768, 640, false],
        [390, 844, false],
        [320, 720, false],
        [1440, 640, false],
      ]) {
        await page.setViewportSize({ width, height });
        const toggle = page.locator('.workspace-topbar .drawer-toggle button');
        if (width < 900) await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        if (((await toggle.getAttribute('aria-expanded')) === 'true') !== open)
          await toggle.click();
        const metrics = page.locator('.metrics');
        await expect
          .poll(() =>
            metrics.evaluate((element) => ({
              columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
              expected: element.clientWidth >= 1024 ? 6 : element.clientWidth >= 512 ? 3 : 2,
            })),
          )
          .toMatchObject(
            await metrics.evaluate((element) => ({
              expected: element.clientWidth >= 1024 ? 6 : element.clientWidth >= 512 ? 3 : 2,
            })),
          );
        const geometry = await metrics.evaluate((element) => ({
          width: element.clientWidth,
          overflow: element.scrollWidth - element.clientWidth,
          columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
        }));
        assert.equal(geometry.columns, geometry.width >= 1024 ? 6 : geometry.width >= 512 ? 3 : 2);
        assert.ok(geometry.overflow <= 1);
        await expect(page.locator('erp-metric-card')).toHaveCount(6);
        assert.equal(await page.locator('[data-testid=open-data]').count(), 0);
        const labels = await page
          .locator('erp-metric-card header > span:first-child')
          .evaluateAll((elements) =>
            elements.map((element) => ({
              font: parseFloat(getComputedStyle(element).fontSize),
              width: element.getBoundingClientRect().width,
            })),
          );
        assert.ok(
          labels.every((label) => label.font <= 11 && label.width >= 45),
          JSON.stringify(labels),
        );
        const innerOverflow = await page
          .locator('.capacity, .subscriptions, .tenant-list, .panel-row')
          .evaluateAll((elements) =>
            elements.map((element) => ({
              cls: element.className,
              overflow: element.scrollHeight - element.clientHeight,
            })),
          );
        assert.ok(
          innerOverflow.every((entry) => entry.overflow <= 1),
          JSON.stringify(innerOverflow),
        );
        const viewport = page.locator('.dashboard-viewport [role=region]');
        await viewport.evaluate((element) => {
          element.scrollTop = element.scrollHeight;
        });
        const last = await page.locator('.panel-row erp-surface-card').last().boundingBox();
        const bounds = await viewport.boundingBox();
        assert.ok(last && bounds && last.y + last.height <= bounds.y + bounds.height + 1);
        await expect(page.locator('[data-testid=manage-tenants]')).toBeVisible();
        const outer = await page.evaluate(() => ({
          x: document.documentElement.scrollWidth - innerWidth,
          y: document.documentElement.scrollHeight - innerHeight,
        }));
        assert.ok(outer.x <= 1 && outer.y <= 1, JSON.stringify(outer));
        await viewport.evaluate((element) => {
          element.scrollTop = 0;
        });
        await page.screenshot({
          path: path.join(output, `${language}-${mode}-${width}-${height}-${open}.png`),
        });
        results.push({ language, mode, width, height, open, geometry, innerOverflow, outer });
        fs.writeFileSync(
          path.join(output, 'partial-results.json'),
          JSON.stringify(results, null, 2),
        );
        console.log(
          JSON.stringify({
            width,
            height,
            open,
            panels: await page
              .locator(
                '.dashboard-content, .panel-row, erp-surface-card, .dashboard-viewport p-scrollarea-content',
              )
              .evaluateAll((elements) =>
                elements.map((element) => ({
                  cls: element.className,
                  height: element.getBoundingClientRect().height,
                  rows: getComputedStyle(element).gridTemplateRows,
                })),
              ),
          }),
        );
      }
      await page.setViewportSize({ width: 1440, height: 900 });
      const viewportControl = page.getByRole('button', {
        name: core[language]['displayDebugger.open'],
        exact: true,
      });
      const triggerColors = await viewportControl.evaluate((element) => ({
        foreground: getComputedStyle(element).color,
        background: getComputedStyle(element.closest('.workspace-topbar')).backgroundColor,
      }));
      const triggerFg = luminance(triggerColors.foreground),
        triggerBg = luminance(triggerColors.background);
      assert.ok(
        (Math.max(triggerFg, triggerBg) + 0.05) / (Math.min(triggerFg, triggerBg) + 0.05) >= 4.5,
        JSON.stringify(triggerColors),
      );
      await page
        .getByRole('button', { name: core[language]['displayDebugger.copy'], exact: true })
        .click();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe('1440 × 900 · lg');
      await page
        .getByRole('button', { name: core[language]['displayDebugger.open'], exact: true })
        .click();
      const select = page.getByRole('combobox', {
        name: core[language]['displayDebugger.preset'],
        exact: true,
      });
      await select.click();
      const colors = await page
        .locator('.p-select-overlay')
        .last()
        .evaluate((element) => ({
          background: getComputedStyle(element).backgroundColor,
          color: getComputedStyle(element).color,
        }));
      assert.notEqual(colors.color, colors.background);
      const foreground = luminance(colors.color),
        background = luminance(colors.background);
      assert.ok(
        (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05) >=
          4.5,
      );
      const popup = context.waitForEvent('page');
      await page.getByRole('option', { name: '390 × 844', exact: true }).click();
      const preview = await popup;
      await preview.waitForLoadState();
      await expect(preview.locator('erp-responsive-preview-host iframe')).toBeVisible();
      const frame = preview.frameLocator('erp-responsive-preview-host iframe');
      await expect(frame.locator('[data-dashboard=ready]')).toBeVisible();
      const child = preview.frames().find((item) => item.name() === 'erp-responsive-preview');
      assert.ok(child);
      assert.deepEqual(await child.evaluate(() => [innerWidth, innerHeight]), [390, 844]);
      assert.equal(await preview.evaluate(() => opener), null);
      const loadStamp = await child.evaluate(() => performance.timeOrigin);
      await preview
        .getByRole('combobox', { name: core[language]['displayDebugger.preset'], exact: true })
        .click();
      await preview.getByRole('option', { name: '900 × 820', exact: true }).click();
      await expect.poll(() => child.evaluate(() => [innerWidth, innerHeight])).toEqual([900, 820]);
      assert.equal(await child.evaluate(() => performance.timeOrigin), loadStamp);
      assert.equal(new URL(page.url()).searchParams.has('erp-responsive-host'), false);
      await preview.screenshot({ path: path.join(output, `${language}-${mode}-preview.png`) });
      const closed = preview.waitForEvent('close');
      await preview
        .getByRole('button', { name: core[language]['displayDebugger.closePreview'], exact: true })
        .click();
      await closed;
      assert.deepEqual(errors, []);
      results.push({
        language,
        mode,
        previewNewTab: true,
        iframeResizedWithoutReload: true,
        originalTabPreserved: true,
        colors,
      });
      await context.close();
    }
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(
    JSON.stringify({
      dashboardCases: results.filter((item) => 'width' in item).length,
      previewCases: 4,
    }),
  );
} finally {
  await browser.close();
}

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

// Loads the production build through Playwright routing; never launches or restarts
// an application server. All API requests are fixtures, with no live report writes.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4210';
const build = path.join(root, 'dist/erp-angular/browser');
const output = path.resolve(
  process.env.REPORT_PAGINATION_ARTIFACTS ??
    path.join(root, '../.codex-tmp/report-runtime-review/manager-pagination'),
);
await fs.mkdir(output, { recursive: true });
const catalog = await fs.readFile(
  path.join(root, 'src/app/platform/localization/catalog.generated.ts'),
  'utf8',
);
const catalogVersion = catalog.match(/[a-f0-9]{64}/)?.[0];
const core = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const reporting = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/reporting.json'), 'utf8'),
);
const filtersMode = process.argv.includes('--filters');
const detailsMode = process.argv.includes('--details');
assert.ok(catalogVersion);
const hash = 'a'.repeat(64);
const cases = ['en', 'ar'].flatMap((language) =>
  ['light', 'dark'].flatMap((mode) =>
    [1213, 780, 390].map((width) => ({ language, width, mode, palette: 'green' })),
  ),
);
const results = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const scenario of cases) {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width: scenario.width, height: 900 },
      reducedMotion: 'reduce',
    });
    const requests = [];
    try {
      await context.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (url.origin !== origin) return route.abort();
        const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
        const requested = path.resolve(build, relative);
        if (requested !== build && !requested.startsWith(build + path.sep)) return route.abort();
        const file = path.extname(relative) ? requested : path.join(build, 'index.html');
        const mime =
          {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.woff2': 'font/woff2',
            '.svg': 'image/svg+xml',
            '.png': 'image/png',
            '.ico': 'image/x-icon',
          }[path.extname(file)] ?? 'application/octet-stream';
        try {
          await route.fulfill({ body: await fs.readFile(file), contentType: mime });
        } catch {
          await route.fulfill({ status: 404, body: '' });
        }
      });
      await context.addCookies(
        Object.entries({
          i18next: scenario.language,
          currentMode: scenario.mode,
          themePalette: scenario.palette,
        }).map(([name, value]) => ({ name, value, url: origin })),
      );
      await context.route('**/api/**', async (route) => {
        const url = new URL(route.request().url());
        let body = [];
        if (/\/(session|refresh)$/.test(url.pathname))
          body = {
            isAuthenticated: true,
            user: {
              ...sessionFixture,
              roles: ['super_admin'],
              permissions: [
                'Countries:Edit',
                'GlobalCrystalReports:View',
                'GlobalCrystalReports:Create',
                'GlobalCrystalReports:Upload',
                'GlobalCrystalReports:Download',
                'GlobalCrystalReportAccess:View',
              ],
            },
          };
        else if (url.pathname.endsWith('/runtime'))
          body = { catalogVersion, revision: 1, overrides: [] };
        else if (url.pathname.endsWith('/csrf')) body = { requestToken: 'fixture' };
        else if (url.pathname.endsWith('/manage/entities'))
          body = [
            {
              entityKey: 'countries',
              scope: 'global',
              filters: [],
              contractSchemaVersion: 1,
              contractFingerprint: hash,
            },
          ];
        else if (url.pathname.endsWith('/manage') || url.pathname.endsWith('/manage/query')) {
          const query =
            route.request().method() === 'POST'
              ? route.request().postDataJSON()
              : Object.fromEntries(url.searchParams);
          requests.push(query);
          const size = Number(query.pageSize ?? 10);
          const start = (Number(query.page ?? 1) - 1) * size;
          let all = Array.from({ length: 125 }, (_, i) => ({
            id: 'c6518e27-5e26-4790-932c-' + String(i).padStart(12, '0'),
            entityKey: 'countries',
            reportKey: 'directory-' + i,
            displayName: 'Directory ' + i,
            description: null,
            updatedOn: '2026-11-01T00:00:00Z',
            currentVersionNumber: 1,
            isPublished: true,
            isArchived: false,
            rowVersion: 'AAAAAAAAAAA=',
          }));
          for (const group of query.filters ?? []) {
            all = all.filter((row) =>
              group.constraints.every((rule) => {
                const value = group.field === 'status' ? 'published' : row[group.field];
                return rule.matchMode === 'contains'
                  ? String(value).includes(rule.value)
                  : value === rule.value;
              }),
            );
          }
          body = {
            items: all.slice(start, start + size),
            totalCount: all.length,
          };
        } else if (/\/manage\/[a-f0-9-]{36}$/.test(url.pathname)) {
          body = {
            id: url.pathname.split('/').at(-1),
            entityKey: 'countries',
            reportKey: 'directory-0',
            displayName: 'Directory 0',
            description: 'Saved report description',
            updatedOn: '2026-11-01T00:00:00Z',
            currentVersionNumber: 1,
            isPublished: true,
            isArchived: false,
            rowVersion: 'AAAAAAAAAAA=',
            viewName: 'ref.vw_Countries',
            versions: [
              {
                id: '104c0411-c988-449d-9a36-e27d2d7532f5',
                versionNumber: 1,
                originalFileName: 'Countries.rpt',
                size: 100,
                sha256: hash,
                summaryTitle: 'Country directory',
                summarySubject: 'دليل الدول',
                validationStatus: 'Valid',
                validationReason: null,
                validationContractSchemaVersion: 1,
                validationContractFingerprint: hash,
                isPublished: true,
                createdOn: '2026-11-01T00:00:00Z',
              },
            ],
          };
        } else if (url.pathname.endsWith('/access'))
          body = {
            access: [],
            allowedRights: ['Run', 'Download', 'Upload', 'Publish'],
            canView: true,
            canEdit: false,
            rowVersion: 'AAAAAAAAAAA=',
          };
        else if (url.pathname.endsWith('/roles')) body = { items: [], totalCount: 0 };
        else if (url.pathname.endsWith('/deployment-candidates'))
          body = { items: [], totalCount: 0 };
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(origin + '/administration/global-crystal-reports');
      // The canonical catalog supplies the translated accessible label.
      const manager = page.locator('erp-global-template-manager');
      await manager.waitFor();

      await manager.locator('erp-collection-footer').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await manager.locator('td').first().waitFor();
      if (detailsMode) {
        const captions = reporting[scenario.language];
        const toolbar = manager.locator('erp-data-table').first().locator('.collection-actions');
        const actionLabels = [
          'globalTemplates.design.uploadExisting',
          'globalTemplates.registerExisting',
          'globalTemplates.design.title',
          'globalTemplates.downloadSchema',
        ].map((key) => captions[key]);
        const trigger = toolbar.getByRole('button', {
          name: core[scenario.language]['actions.buttons'],
          exact: true,
        });
        await expect(toolbar.getByRole('button')).toHaveCount(1);
        await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        const indicator = trigger.locator('.action-menu-indicator');
        await expect(indicator).toBeVisible();
        const indicatorLayout = await trigger.evaluate((element) => {
          const label = element.querySelector('[pbuttonlabel]');
          const indicator = element.querySelector('.action-menu-indicator');
          if (!label || !indicator) throw new Error('Dropdown label and indicator are required.');
          const text = label.getBoundingClientRect();
          const icon = indicator.getBoundingClientRect();
          const rtl = getComputedStyle(element).direction === 'rtl';
          return {
            trailing: rtl ? icon.right <= text.left : icon.left >= text.right,
            separator: Number.parseFloat(getComputedStyle(indicator).borderInlineStartWidth),
            width: icon.width,
          };
        });
        assert.equal(indicatorLayout.trailing, true, JSON.stringify(indicatorLayout));
        assert.ok(indicatorLayout.separator >= 1 && indicatorLayout.width >= 20);
        const toolbarLayout = await manager
          .locator('.collection-toolbar')
          .first()
          .evaluate((element) => {
            const nodes = [...element.querySelectorAll('input, [role="combobox"], button')].filter(
              (node) => node.getBoundingClientRect().width > 0,
            );
            const rects = nodes.map((node) => node.getBoundingClientRect());
            const center = (rect) => rect.top + rect.height / 2;
            return {
              singleRow: Math.max(...rects.map(center)) - Math.min(...rects.map(center)) < 8,
              locallyScrollable: getComputedStyle(element).overflowX === 'auto',
              documentOverflow: document.documentElement.scrollWidth > innerWidth + 1,
            };
          });
        assert.equal(toolbarLayout.singleRow, true, JSON.stringify({ scenario, toolbarLayout }));
        assert.equal(toolbarLayout.locallyScrollable, true);
        assert.equal(toolbarLayout.documentOverflow, false);
        assert.equal(await manager.locator('.collection-filters button erp-icon').count(), 0);
        await trigger.scrollIntoViewIfNeeded();
        await trigger.focus();
        await page.keyboard.press('Enter');
        const menu = page.getByRole('menu', {
          name: core[scenario.language]['actions.buttons'],
          exact: true,
        });
        await expect(menu).toBeVisible();
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(indicator).toHaveClass(/expanded/);
        assert.deepEqual(
          (await menu.getByRole('menuitem').allTextContents()).map((label) => label.trim()),
          actionLabels,
        );
        await expect(menu.locator('erp-icon svg')).toHaveCount(4);
        const menuBounds = await menu.boundingBox();
        assert.ok(
          menuBounds && menuBounds.x >= 0 && menuBounds.x + menuBounds.width <= scenario.width + 1,
        );
        const menuAppearance = await menu.evaluate((element) => {
          const root = element.closest('.p-menu');
          const firstItem = element.querySelector('.p-menu-item-link');
          if (!root || !firstItem) throw new Error('Menu root and item are required.');
          const surface = getComputedStyle(root);
          const item = getComputedStyle(firstItem);
          return {
            background: surface.backgroundColor,
            border: Number.parseFloat(surface.borderTopWidth),
            padding: Number.parseFloat(item.paddingTop),
            shadow: surface.boxShadow,
          };
        });
        assert.ok(
          !['transparent', 'rgba(0, 0, 0, 0)'].includes(menuAppearance.background),
          JSON.stringify(menuAppearance),
        );
        assert.ok(
          menuAppearance.border >= 1 && menuAppearance.padding >= 10,
          JSON.stringify(menuAppearance),
        );
        assert.notEqual(menuAppearance.shadow, 'none');
        await page.screenshot({
          path: path.join(
            output,
            `manager-${scenario.language}-${scenario.mode}-${scenario.width}.png`,
          ),
          fullPage: true,
        });
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Escape');
        await expect(menu).not.toBeVisible();
        await expect(trigger).toBeFocused();
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await expect(indicator).not.toHaveClass(/expanded/);
        await manager.locator('[data-collection-row]').first().dblclick();
        const dialog = page.getByRole('dialog');
        await expect(dialog.getByText('Saved report description', { exact: true })).toBeVisible();
        for (const value of [
          'Country directory',
          'دليل الدول',
          'Countries.rpt',
          'ref.vw_Countries',
        ])
          await expect(dialog.getByText(value, { exact: true })).toBeVisible();
        await expect(dialog.locator('.surface-footer button erp-icon svg')).toHaveCount(2);
        await dialog.screenshot({
          path: path.join(
            output,
            `metadata-${scenario.language}-${scenario.mode}-${scenario.width}.png`,
          ),
        });
        await dialog
          .getByRole('button', { name: core[scenario.language]['actions.close'], exact: true })
          .click();
        await trigger.click();
        await menu.getByRole('menuitem', { name: actionLabels[0], exact: true }).click();
        await expect(
          dialog.getByRole('textbox', {
            name: captions['crystalReports.description'],
            exact: true,
          }),
        ).toBeVisible();
        await expect(dialog.locator('button[type="submit"] erp-icon svg')).toHaveCount(1);
        await expect(dialog.locator('.form-tools button erp-icon svg')).toHaveCount(1);
        await dialog.screenshot({
          path: path.join(
            output,
            `upload-${scenario.language}-${scenario.mode}-${scenario.width}.png`,
          ),
        });
        await dialog
          .getByRole('button', { name: core[scenario.language]['actions.cancel'], exact: true })
          .click();
      }
      const footer = manager.locator('erp-collection-footer').first();

      const layout = await footer.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const nodes = Array.from(
          element.querySelectorAll('.p-paginator-current, .p-paginator button, erp-option-select'),
        );
        const rects = nodes.map((node) => node.getBoundingClientRect());
        return {
          fits: rects.every((r) => r.left >= bounds.left - 1 && r.right <= bounds.right + 1),
          noOverlap: rects.every((r, i) =>
            rects.every(
              (other, j) =>
                i === j ||
                r.right <= other.left + 1 ||
                other.right <= r.left + 1 ||
                r.bottom <= other.top + 1 ||
                other.bottom <= r.top + 1,
            ),
          ),
          documentOverflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      });
      assert.equal(layout.fits, true, JSON.stringify({ scenario, layout }));
      assert.equal(layout.noOverlap, true);
      assert.equal(layout.documentOverflow, false);
      await footer.screenshot({
        path: path.join(
          output,
          scenario.language + '-' + scenario.mode + '-' + scenario.width + '.png',
        ),
      });
      const next = footer.locator('.p-paginator-next');
      const initialRequests = requests.length;
      await next.click();
      await page.waitForFunction(
        () => document.querySelector('.p-paginator-prev')?.disabled === false,
      );
      assert.equal(requests.length, initialRequests);
      assert.equal(await footer.locator('.p-paginator-page').count(), 0);
      await footer.locator('.p-paginator-last').click();
      await page.waitForFunction(
        () => document.querySelector('.p-paginator-next')?.disabled === true,
      );
      assert.equal(String(requests.at(-1).page), '13');
      assert.equal(String(requests.at(-1).pageSize), '10');
      const combo = footer.getByRole('combobox');
      await combo.click();
      await page.getByRole('option', { name: /^(25|٢٥)$/ }).click();
      await page.waitForFunction(
        () => document.querySelector('.p-paginator-prev')?.disabled === true,
      );
      assert.equal(String(requests.at(-1).page), '1');
      assert.equal(String(requests.at(-1).pageSize), '25');
      if (filtersMode) {
        const captions = core[scenario.language];
        await expect(manager.locator('p-column-filter')).toHaveCount(6);
        const openFilter = async (key) => {
          await manager
            .locator(`th[data-column-key="${key}"] p-column-filter`)
            .getByRole('button')
            .first()
            .click();
          await expect(page.locator('.p-datatable-filter-overlay')).toBeVisible();
        };
        const overlay = page.locator('.p-datatable-filter-overlay');
        await openFilter('title');
        const before = requests.length;
        await overlay.locator('erp-grid-filter-input input').fill('Directory 12');
        assert.equal(requests.length, before);
        await overlay
          .getByRole('button', { name: captions['collections.apply'], exact: true })
          .click();
        await expect.poll(() => requests.at(-1).filters?.[0]?.field).toBe('displayName');
        assert.equal(requests.at(-1).page, 1);
        await expect(manager.locator('[data-collection-row]')).toHaveCount(6);
        await openFilter('status');
        await overlay.locator('erp-option-select').getByRole('combobox').click();
        await page
          .getByRole('option', {
            name: reporting[scenario.language]['crystalReports.published'],
            exact: true,
          })
          .click();
        await overlay
          .getByRole('button', { name: captions['collections.apply'], exact: true })
          .click();
        await expect.poll(() => requests.at(-1).filters?.length).toBe(2);
        assert.ok(
          requests
            .at(-1)
            .filters.some(
              (group) => group.field === 'status' && group.constraints[0].value === 'published',
            ),
        );
        await expect(manager.locator('[data-collection-row]')).toHaveCount(6);
        await openFilter('status');
        await overlay.screenshot({
          path: path.join(
            output,
            `filter-${scenario.language}-${scenario.mode}-${scenario.width}.png`,
          ),
        });
        await overlay
          .locator('.p-datatable-filter-buttonbar')
          .getByRole('button', { name: captions['collections.clear'], exact: true })
          .click();
        await expect.poll(() => requests.at(-1).filters?.length).toBe(1);
        await openFilter('title');
        await overlay
          .locator('.p-datatable-filter-buttonbar')
          .getByRole('button', { name: captions['collections.clear'], exact: true })
          .click();
        await expect.poll(() => requests.at(-1).filters ?? []).toEqual([]);
        await expect(manager.locator('[data-collection-row]')).toHaveCount(25);
      }
      assert.deepEqual(errors, []);
      results.push({
        scenario,
        layout,
        countriesRecordNavigation: true,
        samePageNavigationWithoutRequest: true,
        lastRecordLoadsServerPage: true,
        sizeChangeResetsPage: true,
        columnFiltersAppliedAndCleared: filtersMode,
        managerActionsAndMetadata: detailsMode,
        actionMenuAndSingleRow: detailsMode,
        errors,
      });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

await fs.writeFile(
  path.join(output, 'browser-results.json'),
  JSON.stringify(results, null, 2) + '\n',
);
console.log(JSON.stringify({ passed: results.length, output }));

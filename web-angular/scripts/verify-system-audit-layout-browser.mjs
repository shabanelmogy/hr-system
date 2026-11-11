import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { serveAngularFixtureBuild } from './angular-build-browser-fixture.mjs';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import {
  auditFixture,
  auditDetailFixture,
} from '../src/app/platform/system-audit/audit.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const origin = 'https://localhost:4220';
const output = path.resolve(
  process.env.AUDIT_LAYOUT_ARTIFACTS ?? path.join(root, '../.codex-tmp/audit-layout'),
);
const core = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const version = (
  await fs.readFile(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
).match(/[a-f0-9]{64}/)[0];
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
async function inspectFooter(footer) {
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeInViewport({ ratio: 1 });
  const result = await footer.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const count = element.querySelector('.record-count');
    const controls = [
      ...element.querySelectorAll(
        '.record-controls button, .record-count, .page-count, erp-option-select, .selection-controls button',
      ),
    ].map((control) => {
      const box = control.getBoundingClientRect();
      return {
        label: control.getAttribute('aria-label') ?? control.textContent.trim(),
        left: box.left,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
      };
    });
    return {
      bounds: bounds.toJSON(),
      countWidth: count.clientWidth,
      countScrollWidth: count.scrollWidth,
      countText: count.textContent.trim(),
      recordArrowCount: element.querySelectorAll('.record-controls button').length,
      duplicateArrowCount: element.querySelectorAll('.cursor-page-controls button').length,
      additionalPageControls: element.querySelectorAll('erp-action-menu-button, p-paginator')
        .length,
      controls,
    };
  });
  assert.ok(result.countScrollWidth <= result.countWidth + 1, JSON.stringify(result));
  assert.equal(result.recordArrowCount, 4);
  assert.equal(result.duplicateArrowCount, 0);
  assert.equal(result.additionalPageControls, 0);
  for (const control of result.controls) {
    assert.ok(
      control.left >= result.bounds.left - 1 &&
        control.right <= result.bounds.right + 1 &&
        control.top >= result.bounds.top - 1 &&
        control.bottom <= result.bounds.bottom + 1,
      JSON.stringify({ control, bounds: result.bounds }),
    );
  }
  for (let left = 0; left < result.controls.length; left++)
    for (let right = left + 1; right < result.controls.length; right++) {
      const a = result.controls[left],
        b = result.controls[right];
      assert.ok(
        Math.min(a.right, b.right) - Math.max(a.left, b.left) <= 1 ||
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) <= 1,
        JSON.stringify({ overlap: [a, b] }),
      );
    }
  return result;
}
try {
  for (const language of ['en', 'ar'])
    for (const mode of ['light', 'dark'])
      for (const viewport of [
        { width: 390, height: 740 },
        { width: 493, height: 1057 },
        { width: 800, height: 740 },
        { width: 1440, height: 740 },
        { width: 844, height: 390 },
      ]) {
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          reducedMotion: 'reduce',
          viewport,
        });
        const errors = [];
        let writes = 0;
        try {
          await serveAngularFixtureBuild(
            context,
            root,
            origin,
            path.resolve(
              process.env.ANGULAR_FIXTURE_BUILD ?? path.join(root, 'dist/erp-angular/browser'),
            ),
          );
          await context.addCookies(
            Object.entries({ i18next: language, currentMode: mode, themePalette: 'green' }).map(
              ([name, value]) => ({ name, value, url: origin }),
            ),
          );
          await context.route('**/api/**', async (route) => {
            const request = route.request(),
              endpoint = new URL(request.url()).pathname;
            if (request.method() !== 'GET') {
              writes++;
              return route.abort();
            }
            let body,
              status = 200;
            if (endpoint.endsWith('/session'))
              body = {
                isAuthenticated: true,
                user: {
                  ...sessionFixture,
                  roles: ['super_admin'],
                  permissions: ['SystemAuditTrail:View', 'Countries:View'],
                },
              };
            else if (endpoint.endsWith('/csrf')) body = { requestToken: 'layout-fixture-token' };
            else if (endpoint.endsWith('/runtime'))
              body = { catalogVersion: version, revision: 0, overrides: [] };
            else if (endpoint.endsWith('/modules/accessible')) body = [];
            else if (endpoint.endsWith('/realtime-token')) {
              status = 403;
              body = {};
            } else if (endpoint.endsWith('/system-audit-trail/filters'))
              body = { modules: [{ moduleCode: 'hr', entityNames: ['Department'] }] };
            else if (endpoint.endsWith('/countries')) {
              const query = new URL(request.url()).searchParams;
              assert.equal(query.get('pageSize'), '10');
              body = {
                items: Array.from({ length: 10 }, (_, index) => ({
                  id: index + 1,
                  nameAr: 'دولة ' + (index + 1),
                  nameEn: 'Country ' + (index + 1),
                  alpha2Code: null,
                  alpha3Code: null,
                  phoneCode: null,
                  currencyCode: null,
                  createdOn: '2026-01-01T00:00:00Z',
                  updatedOn: null,
                  isDeleted: false,
                  statesCount: 0,
                })),
                metaData: {
                  currentPage: 1,
                  pageNumber: 1,
                  pageSize: 10,
                  totalCount: 12,
                  totalPages: 2,
                  hasPrev: false,
                  hasNext: true,
                },
              };
            } else if (endpoint.endsWith('/system-audit-trail'))
              body = {
                items: Array.from({ length: 25 }, (_, i) => ({ ...auditFixture, id: i + 1 })),
                nextCursor: 'layout-next',
                totalCount: 1250,
              };
            else if (endpoint.includes('/system-audit-trail/')) body = auditDetailFixture;
            else {
              errors.push('Unexpected API ' + endpoint);
              return route.abort();
            }
            return route.fulfill({
              status,
              contentType: 'application/json',
              body: JSON.stringify(body),
            });
          });
          const page = await context.newPage();
          page.on('pageerror', (error) => errors.push(error.message));
          await page.goto(origin + '/super-admin/audit-trail');
          const workspace = page.getByTestId('system-audit');
          const grid = workspace.locator('erp-audit-collection > erp-data-table');
          const text = core[language];
          await expect(workspace).toHaveAttribute('data-kind', 'ready');
          await expect(grid.locator('erp-collection-footer')).not.toContainText(
            text['pagination.unknownTotal'],
          );
          await expect(grid.locator('.size-settings .page-count')).toContainText(
            text['pagination.page'],
          );
          const check = async (navigation, zoom = 1) => {
            const footer = await inspectFooter(grid.locator('erp-collection-footer'));
            const geometry = await grid.evaluate((element) => {
              const body = element.querySelector('.table-body').getBoundingClientRect();
              const header = element.querySelector('thead').getBoundingClientRect();
              const shell = element.querySelector('.collection-shell');
              return {
                bodyHeight: body.height,
                headerHeight: header.height,
                shellHeight: shell.clientHeight,
                shellScrollHeight: shell.scrollHeight,
                outerWidth: document.documentElement.scrollWidth,
                outerHeight: document.documentElement.scrollHeight,
              };
            });
            assert.ok(
              geometry.bodyHeight >= geometry.headerHeight + 52,
              JSON.stringify({ viewport, navigation, zoom, geometry }),
            );
            assert.ok(
              geometry.outerWidth <= page.viewportSize().width + 1 &&
                geometry.outerHeight <= page.viewportSize().height + 1,
              JSON.stringify(geometry),
            );
            const criteria = grid.locator('erp-audit-criteria');
            for (const key of (await criteria.count()) ? ['module', 'to'] : []) {
              const control =
                key === 'module'
                  ? criteria.getByRole('combobox', { name: text['auditLog.' + key], exact: true })
                  : criteria.getByRole('textbox', { name: text['auditLog.' + key], exact: true });
              await control.focus();
              await expect(control).toBeFocused();
              await expect(control).toBeInViewport({ ratio: 1 });
            }
            const options = grid.getByRole('button', {
              name: text['actions.gridOptions'],
              exact: true,
            });
            if (page.viewportSize().width < 600) {
              await expect(options.locator('[pButtonLabel]')).toBeHidden();
              const box = await options.boundingBox();
              assert.ok(box && box.width <= 44, JSON.stringify(box));
              const searchBox = await grid
                .locator('.search-controls erp-text-field input')
                .boundingBox();
              assert.ok(
                searchBox &&
                  Math.abs(searchBox.y + searchBox.height / 2 - box.y - box.height / 2) <= 2,
                JSON.stringify({ options: box, search: searchBox }),
              );
            }
            await page.screenshot({
              path: path.join(
                output,
                `${language}-${mode}-${viewport.width}x${viewport.height}-${navigation}-${zoom}.png`,
              ),
              fullPage: true,
            });
            const firstCell = grid.locator('tbody [data-collection-row] > td').first();
            await firstCell.scrollIntoViewIfNeeded();
            await expect(firstCell).toBeInViewport({ ratio: 1 });
            const rowReachable = await firstCell.evaluate((cell) => {
              const box = cell.getBoundingClientRect();
              const target = document.elementFromPoint(
                box.x + box.width / 2,
                box.y + box.height / 2,
              );
              return {
                reachable: target !== null && cell.contains(target),
                cell: box.toJSON(),
                coveringElement: target?.outerHTML.slice(0, 400),
              };
            });
            assert.equal(rowReachable.reachable, true, JSON.stringify(rowReachable));
            await page.screenshot({
              path: path.join(
                output,
                `${language}-${mode}-${viewport.width}x${viewport.height}-${navigation}-${zoom}-data.png`,
              ),
              fullPage: true,
            });
            results.push({
              language,
              mode,
              viewport,
              navigation,
              equivalentZoom: zoom,
              effectiveViewport: page.viewportSize(),
              geometry,
              footer,
              rowReachable,
              writes,
            });
          };
          if (viewport.width === 493) await check('collapsed');
          await page
            .locator('erp-page-header')
            .getByRole('button', { name: text['navigation.filter'], exact: true })
            .click();
          await check('initial');
          const selectionFooters = [];
          const firstSelection = grid
            .locator('tbody [data-collection-row]')
            .first()
            .getByRole('checkbox');
          await firstSelection.check();
          selectionFooters.push({
            selected: 1,
            footer: await inspectFooter(grid.locator('erp-collection-footer')),
          });
          await firstSelection.uncheck();
          const pageSelection = grid.getByRole('checkbox', {
            name: text['collections.selectPage'],
            exact: true,
          });
          await pageSelection.check();
          selectionFooters.push({
            selected: 25,
            footer: await inspectFooter(grid.locator('erp-collection-footer')),
          });
          await pageSelection.uncheck();
          results.at(-1).selectionFooters = selectionFooters;
          if (viewport.width === 1440) {
            const open = page
              .getByRole('banner')
              .getByRole('button', { name: text['menu.openSidebar'], exact: true });
            const close = page.getByRole('banner').getByRole('button', {
              name: text['menu.closeSidebar'],
              exact: true,
            });
            if (await open.isVisible()) await open.click();
            await expect(close).toBeVisible();
            await check('open');
            await close.click();
            await expect(open).toBeVisible();
            await check('closed');
            // Exercise the reduced CSS viewport corresponding to125% browser zoom.
            await page.setViewportSize({
              width: Math.floor(viewport.width / 1.25),
              height: Math.floor(viewport.height / 1.25),
            });
            await check('closed', 1.25);
          }
          await grid.locator('tbody [data-collection-row]').first().click();
          const detail = page.getByRole('dialog', {
            name: text['auditLog.entities.Department'],
            exact: true,
          });
          await expect(detail.locator('erp-audit-changes tbody [data-collection-row]')).toHaveCount(
            10,
          );
          const knownFooter = await inspectFooter(
            detail.locator('erp-audit-changes erp-collection-footer'),
          );
          assert.ok(knownFooter.countText.includes('26') || knownFooter.countText.includes('٢٦'));
          await page.goto(origin + '/dev/countries');
          const countries = page.getByTestId('countries');
          await expect(countries).toHaveAttribute('data-kind', 'ready');
          await page.locator('erp-page-header .filter button').click();
          const referenceGrid = countries.locator('erp-data-table').first();
          const referenceFooter = await inspectFooter(
            referenceGrid.locator('erp-collection-footer'),
          );
          const referenceCell = referenceGrid.locator('tbody [data-collection-row] > td').first();
          await referenceCell.scrollIntoViewIfNeeded();
          await expect(referenceCell).toBeInViewport({ ratio: 1 });
          assert.equal(
            await referenceCell.evaluate((cell) => {
              const box = cell.getBoundingClientRect();
              const target = document.elementFromPoint(
                box.x + box.width / 2,
                box.y + box.height / 2,
              );
              return target !== null && cell.contains(target);
            }),
            true,
          );
          await page.screenshot({
            path: path.join(
              output,
              `${language}-${mode}-${viewport.width}x${viewport.height}-countries-reference.png`,
            ),
          });
          results.at(-1).countriesReference = {
            effectiveViewport: page.viewportSize(),
            footer: referenceFooter,
            rowReachable: true,
          };
          assert.deepEqual(errors, []);
          assert.equal(writes, 0);
          console.log(
            `Audit layout passed ${language}/${mode}/${viewport.width}x${viewport.height}`,
          );
        } catch (error) {
          console.log(JSON.stringify({ language, mode, viewport, errors, writes }));
          throw error;
        } finally {
          await context.close();
        }
      }
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  await browser.close();
}

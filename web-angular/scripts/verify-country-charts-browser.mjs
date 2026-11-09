import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { getTheme, themePaletteOrder } from '@app/tokens';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { dashboardFixture } from '../src/app/platform/tenants/dashboard.fixture.ts';
import { serveAngularFixtureBuild } from './angular-build-browser-fixture.mjs';

// Actual shell/native canvases; all API responses are intercepted synthetic reads.
const root = path.resolve(import.meta.dirname, '..'),
  origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220',
  api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(root, '../.codex-tmp/angular-country-charts');
fs.mkdirSync(output, { recursive: true });
const core = JSON.parse(
    fs.readFileSync(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
  ),
  captions = JSON.parse(
    fs.readFileSync(path.join(root, 'src/locales/generated/reference-countries.json'), 'utf8'),
  );
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const smoke = process.argv.includes('--smoke'),
  layoutOnly = process.argv.includes('--layout'),
  fixtureBuild = layoutOnly || process.argv.includes('--fixture'),
  focused = process.argv.includes('--focused'),
  results = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const palette of smoke || focused || layoutOnly ? ['green'] : themePaletteOrder)
    for (const mode of smoke ? ['light'] : ['light', 'dark'])
      for (const language of smoke ? ['en'] : ['en', 'ar'])
        for (const width of layoutOnly
          ? [320, 390, 690, 900, 1012, 1440, 844]
          : smoke
            ? [1440]
            : [390, 1440]) {
          const height = layoutOnly
            ? width === 844
              ? 390
              : width === 900
                ? 640
                : 823
            : width === 390
              ? 780
              : 1050;
          const context = await browser.newContext({
            ignoreHTTPSErrors: true,
            viewport: { width, height },
            reducedMotion: 'reduce',
          });
          if (fixtureBuild)
            await serveAngularFixtureBuild(
              context,
              root,
              origin,
              path.resolve(root, '../.codex-tmp/countries-pagination-dev/browser'),
            );
          await context.addCookies(
            Object.entries({ themePalette: palette, currentMode: mode, i18next: language }).map(
              ([name, value]) => ({ name, value, url: origin }),
            ),
          );
          const rows = Array.from({ length: 12 }, (_, index) => {
            const id = index + 1;
            return {
              id,
              nameAr: 'دولة ' + id,
              nameEn: 'Country ' + id,
              alpha2Code: null,
              alpha3Code: null,
              phoneCode: null,
              currencyCode: id % 4 === 0 ? null : id % 4 === 2 ? 'EGP' : 'USD',
              statesCount: id % 3,
              isDeleted: false,
              createdOn: `2026-${String(Math.ceil(id / 4)).padStart(2, '0')}-${String(id).padStart(2, '0')}T00:00:00Z`,
              updatedOn: null,
            };
          });
          const reads = [],
            errors = [];
          let dataMode = 'normal',
            denied = false,
            hold = false,
            waiting = false,
            release = () => {};
          await context.route(api + '/api/**', async (route) => {
            const request = route.request(),
              url = new URL(request.url()),
              p = url.pathname;
            let body,
              status = 200;
            if (p.endsWith('/realtime-token')) {
              status = 403;
              body = {};
            } else if (p.endsWith('/csrf')) body = { requestToken: 'synthetic-csrf' };
            else if (p.endsWith('/session') || p.endsWith('/refresh'))
              body = {
                isAuthenticated: true,
                user: {
                  ...sessionFixture,
                  roles: ['super_admin'],
                  permissions: denied
                    ? []
                    : [
                        'Countries:View',
                        'Countries:Create',
                        'Countries:Edit',
                        'Countries:Archive',
                        'Countries:Restore',
                      ],
                  tenantReadOnly: false,
                },
              };
            else if (p.endsWith('/runtime'))
              body = { catalogVersion: version, revision: 0, overrides: [] };
            else if (p.endsWith('/getDashboardSummary')) body = dashboardFixture;
            else if (p.endsWith('/modules/accessible')) body = [];
            else if (p === '/api/v1/countries' && request.method() === 'GET') {
              const query = Object.fromEntries(url.searchParams);
              reads.push(query);
              const modeAtDispatch = dataMode;
              if (hold) {
                hold = false;
                waiting = true;
                await new Promise((resolve) => (release = resolve));
                waiting = false;
              }
              if (modeAtDispatch === 'error') {
                status = 503;
                body = { title: 'Synthetic read failure' };
              } else {
                const size = Number(query.pageSize),
                  number = Number(query.pageNumber),
                  search = (query.search ?? '').toLowerCase();
                let matching =
                  modeAtDispatch === 'empty'
                    ? []
                    : rows.filter(
                        (row) =>
                          !search ||
                          row.nameEn.toLowerCase().includes(search) ||
                          row.nameAr.includes(search),
                      );
                if (modeAtDispatch === 'zero')
                  matching = matching.map((row) => ({
                    ...row,
                    currencyCode: null,
                    statesCount: 0,
                  }));
                matching = [...matching].sort(
                  (a, b) =>
                    (query.sortDirection === 'asc' ? 1 : -1) *
                    a.createdOn.localeCompare(b.createdOn),
                );
                const totalCount = matching.length,
                  totalPages = Math.ceil(totalCount / size);
                body = {
                  items: matching.slice((number - 1) * size, number * size),
                  metaData: {
                    currentPage: number,
                    pageNumber: number,
                    pageSize: size,
                    totalCount,
                    totalPages,
                    hasNext: number < totalPages,
                    hasPrev: number > 1,
                  },
                };
              }
            } else throw Error('Unexpected chart API ' + request.method() + ' ' + p);
            await route.fulfill({
              status,
              contentType: 'application/json',
              body: JSON.stringify(body),
            });
          });
          const page = await context.newPage();
          page.on('pageerror', (error) => errors.push(error.message));
          page.on('dialog', async (dialog) => {
            errors.push('Native dialog ' + dialog.type());
            await dialog.dismiss();
          });
          const text = core[language],
            country = captions[language],
            region = page.getByTestId('countries'),
            header = page.locator('erp-page-header');
          const pickView = async (id) => {
            const direct = header.locator(`[data-view=${id}] button`);
            if (await direct.count()) await direct.click();
            else {
              await header
                .getByRole('button', { name: text['navigation.moreViews'], exact: true })
                .click();
              await page
                .locator('.overflow-views')
                .getByRole('button', { name: text['views.' + id], exact: true })
                .click();
            }
          };
          const refresh = () => header.locator('.refresh button').click();
          const metricValues = () => region.locator('erp-metric-card strong').allTextContents();
          const nativeFacts = () =>
            page.evaluate(() =>
              Array.from(document.querySelectorAll('erp-chart-panel p-chart')).map((element) => {
                const chart = ng.getComponent(element).chart;
                if (!chart) return null;
                window.__erpChartConstructor = chart.constructor;
                const canvas = chart.canvas,
                  rect = canvas.getBoundingClientRect(),
                  pixels = chart.ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                const panel = element.closest('erp-chart-panel'),
                  frame = panel.querySelector('section'),
                  heading = frame.querySelector('h2'),
                  style = getComputedStyle(frame),
                  titleStyle = getComputedStyle(heading);
                return {
                  id: panel.dataset.chartId,
                  type: chart.config.type,
                  labels: chart.data.labels,
                  values: chart.data.datasets.map((series) => series.data),
                  color:
                    typeof chart.data.datasets[0].backgroundColor === 'function'
                      ? 'gradient'
                      : chart.data.datasets[0].backgroundColor,
                  gradient:
                    chart.getDatasetMeta(0).dataset?.options?.backgroundColor instanceof
                    CanvasGradient,
                  width: rect.width,
                  height: rect.height,
                  painted: pixels.some((value, index) => index % 4 === 3 && value > 0),
                  rtl: chart.options.plugins.legend.rtl,
                  animation: chart.options.animation,
                  live: Object.keys(chart.constructor.instances).length,
                  canvasLabel: canvas.getAttribute('aria-label'),
                  presentation: {
                    padding: style.padding,
                    radius: style.borderRadius,
                    titleSize: titleStyle.fontSize,
                    titleWeight: titleStyle.fontWeight,
                    font: titleStyle.fontFamily,
                  },
                };
              }),
            );
          if (layoutOnly) {
            await page.goto(origin + '/dev/countries');
            await expect(region).toHaveAttribute('data-kind', 'ready');
            await pickView('chart');
            await expect(region.locator('canvas')).toHaveCount(4);
            await page.evaluate(() => document.fonts.ready);
            const navigation = page.locator('.drawer-toggle button');
            for (const expanded of width >= 900 ? [false, true] : [false]) {
              if ((await navigation.getAttribute('aria-expanded')) !== String(expanded))
                await navigation.click();
              await expect
                .poll(async () => {
                  const facts = await nativeFacts();
                  return (
                    facts.length === 4 &&
                    facts.every((fact) => fact?.painted && fact.height >= 180 && fact.live === 4)
                  );
                })
                .toBe(true);
              const metrics = region.locator('.metrics');
              const plots = region.locator('.plots');
              const geometry = await plots.evaluate((element) => {
                const workspace = element.closest('.chart-scroll');
                const metricGrid = workspace.querySelector('.metrics');
                const panels = [...element.children].map((panel) =>
                  panel.getBoundingClientRect().toJSON(),
                );
                return {
                  width: workspace.clientWidth,
                  columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
                  metricColumns: getComputedStyle(metricGrid).gridTemplateColumns.split(' ').length,
                  panels,
                };
              });
              assert.equal(geometry.columns, geometry.width >= 800 ? 2 : 1);
              assert.equal(geometry.metricColumns, geometry.width >= 672 ? 4 : 2);
              assert.ok(
                geometry.panels.every(
                  (panel) =>
                    panel.width >= Math.min(260, geometry.width - 20) && panel.height >= 319,
                ),
                JSON.stringify(geometry),
              );
              await expect(metrics.locator('erp-metric-card')).toHaveCount(4);
              await expect(region.locator('table.sr-only')).toHaveCount(4);
              const scroll = region.locator('.chart-scroll p-scrollarea-viewport');
              await scroll.focus();
              await scroll.press('Control+End');
              await expect
                .poll(() =>
                  scroll.evaluate((element) => {
                    const last = element
                      .querySelector('erp-chart-panel:last-child')
                      .getBoundingClientRect();
                    const viewport = element.getBoundingClientRect();
                    return last.bottom <= viewport.bottom + 2 && last.bottom > viewport.top;
                  }),
                )
                .toBe(true);
              const charts = await nativeFacts();
              assert.ok(
                charts.every(
                  (chart) => chart.rtl === (language === 'ar') && chart.animation === false,
                ),
              );
              await scroll.evaluate((element) => element.scrollTo(0, 0));
              assert.ok(
                await page.evaluate(
                  () =>
                    document.documentElement.scrollHeight <= innerHeight + 1 &&
                    document.documentElement.scrollWidth <= innerWidth + 1,
                ),
              );
              await page.screenshot({
                path: path.join(
                  output,
                  `layout-${mode}-${language}-${width}x${height}-${expanded ? 'open' : 'closed'}.png`,
                ),
                animations: 'disabled',
              });
              results.push({
                palette,
                mode,
                language,
                width,
                height,
                expanded,
                geometry,
                passed: true,
              });
              console.log(
                `Chart layout passed ${mode}/${language}/${width}x${height}/${expanded ? 'open' : 'closed'}`,
              );
            }
            const before = reads.length;
            await page.evaluate(() => {
              const renderer = ng.getComponent(document.querySelector('erp-chart-renderer'));
              renderer.theme.setMode(renderer.theme.mode() === 'dark' ? 'light' : 'dark', false);
            });
            await expect
              .poll(async () => (await nativeFacts()).every((chart) => chart?.live === 4))
              .toBe(true);
            assert.equal(reads.length, before);
            await pickView('grid');
            await expect
              .poll(() =>
                page.evaluate(() => Object.keys(window.__erpChartConstructor.instances).length),
              )
              .toBe(0);
            assert.deepEqual(errors, []);
            await context.close();
            continue;
          }
          await page.goto(origin + '/dev/countries');
          await expect(region).toHaveAttribute('data-kind', 'ready');
          const navigationToggle = page.locator('.drawer-toggle button');
          if (width >= 900 && (await navigationToggle.getAttribute('aria-expanded')) === 'true')
            await navigationToggle.click();
          await header.locator('.filter button').click();
          await region.locator('.search-controls erp-text-field input').fill('Country');
          await expect.poll(() => reads.at(-1)?.search).toBe('Country');
          await expect(region).toHaveAttribute('data-kind', 'ready');
          await region.locator('[data-collection-row]').first().locator('td').nth(1).click();
          await page.keyboard.press('Control+End');
          await expect.poll(() => reads.at(-1)?.pageNumber).toBe('2');
          await expect(region).toHaveAttribute('data-kind', 'ready');
          hold = true;
          await pickView('chart');
          await expect.poll(() => waiting).toBe(true);
          await expect(region.locator('canvas')).toHaveCount(0);
          await expect(region.locator('erp-metric-card')).toHaveCount(0);
          release();
          await expect(region).toHaveAttribute('data-kind', 'ready');
          await expect(region.locator('canvas')).toHaveCount(4);
          await page.evaluate(() => document.fonts.ready);
          assert.equal(reads.at(-1).pageNumber, '1');
          assert.equal(reads.at(-1).search, 'Country');
          assert.equal(reads.at(-1).sortBy, 'createdOn');
          assert.equal(reads.at(-1).sortDirection, 'desc');
          await expect(header.locator('.filter')).toHaveCount(0);
          await expect(region.locator('.collection-toolbar,erp-collection-footer')).toHaveCount(0);
          await expect(region.locator('.scope-note')).toHaveCount(0);
          assert.ok(!(await region.textContent()).includes('Charts summarize'));
          assert.deepEqual(await metricValues(), ['12', '10', '9', '2']);
          await expect
            .poll(async () => {
              const values = await nativeFacts();
              return (
                values.length === 4 &&
                values.every(
                  (value) =>
                    value &&
                    value.width > 40 &&
                    value.height > 100 &&
                    value.painted &&
                    value.live === 4,
                )
              );
            })
            .toBe(true);
          const charts = await nativeFacts(),
            byId = (id) => charts.find((chart) => chart.id === id),
            expected = getTheme(palette, mode);
          assert.deepEqual(byId('states').values, [[2, 2, 2, 1, 1, 1]]);
          assert.deepEqual(byId('coverage').values, [[6, 4]]);
          assert.deepEqual(byId('currencies').labels, ['USD', 'EGP']);
          assert.deepEqual(byId('currencies').values, [[5, 2]]);
          assert.deepEqual(byId('timeline').labels, ['2026-01', '2026-02', '2026-03']);
          assert.deepEqual(byId('timeline').values, [[2, 6, 10]]);
          assert.equal(byId('states').color, expected.colors.primary);
          assert.equal(byId('currencies').color[0], expected.colors.brand2);
          for (const chart of charts) {
            assert.equal(chart.rtl, language === 'ar');
            assert.equal(chart.animation, false);
            assert.ok(chart.canvasLabel);
          }
          assert.equal(byId('timeline').gradient, true);
          await expect(region.locator('.sr-only table,table.sr-only')).toHaveCount(4);
          await page.screenshot({
            path: path.join(output, `${palette}-${mode}-${language}-${width}-charts.png`),
            fullPage: true,
            animations: 'disabled',
          });
          const layout = await region.locator('.plots').evaluate((element) => {
            const containers = [];
            for (let parent = element.parentElement; parent; parent = parent.parentElement) {
              const style = getComputedStyle(parent);
              if (style.containerType !== 'normal')
                containers.push({
                  tag: parent.tagName,
                  className: parent.className,
                  type: style.containerType,
                  height: parent.getBoundingClientRect().height,
                });
            }
            return {
              columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
              autoRows: getComputedStyle(element).gridAutoRows,
              templateRows: getComputedStyle(element).gridTemplateRows,
              plotHeight: element.getBoundingClientRect().height,
              plotStyle: element.getAttribute('style'),
              containers,
              viewportHeight: element.closest('.chart-scroll').getBoundingClientRect().height,
              panels: Array.from(element.children).map((child) => {
                const rect = child.getBoundingClientRect();
                return { width: rect.width, height: rect.height };
              }),
            };
          });
          fs.writeFileSync(
            path.join(output, 'latest-layout.json'),
            JSON.stringify(layout, null, 2),
          );
          assert.equal(layout.columns, width === 390 ? 1 : 2);
          assert.ok(layout.panels.every((panel) => panel.height >= 279));
          assert.ok(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          );
          const scroll = region.locator('.chart-scroll p-scrollarea-viewport');
          await scroll.evaluate((element) => {
            element.scrollTop = element.scrollHeight;
          });
          await expect
            .poll(() =>
              scroll.evaluate((element) => {
                const last = element
                    .querySelector('erp-chart-panel:last-child')
                    .getBoundingClientRect(),
                  viewport = element.getBoundingClientRect();
                return last.bottom <= viewport.bottom + 2 && last.bottom > viewport.top;
              }),
            )
            .toBe(true);
          await page.screenshot({
            path: path.join(output, `${palette}-${mode}-${language}-${width}-charts-lower.png`),
            fullPage: true,
            animations: 'disabled',
          });
          await scroll.evaluate((element) => {
            element.scrollTop = 0;
          });
          const beforeRepaint = reads.length;
          await page.evaluate(() => {
            const renderer = ng.getComponent(document.querySelector('erp-chart-renderer'));
            renderer.theme.setMode(renderer.theme.mode() === 'dark' ? 'light' : 'dark', false);
            renderer.locale.setLanguage(renderer.locale.language() === 'ar' ? 'en' : 'ar');
          });
          await expect
            .poll(async () => {
              const charts = await nativeFacts();
              return (
                charts.length === 4 &&
                charts.every((chart) => chart?.rtl === (language !== 'ar') && chart.live === 4)
              );
            })
            .toBe(true);
          assert.equal(reads.length, beforeRepaint);
          await page.evaluate(
            ({ language, mode }) => {
              const renderer = ng.getComponent(document.querySelector('erp-chart-renderer'));
              renderer.theme.setMode(mode, false);
              renderer.locale.setLanguage(language);
            },
            { language, mode },
          );
          await pickView('grid');
          await expect
            .poll(() =>
              page.evaluate(() => Object.keys(window.__erpChartConstructor.instances).length),
            )
            .toBe(0);
          await pickView('chart');
          await expect(region.locator('canvas')).toHaveCount(4);
          dataMode = 'zero';
          await refresh();
          await expect(region).toHaveAttribute('data-kind', 'ready');
          await expect(region.locator('canvas')).toHaveCount(2);
          assert.deepEqual(await metricValues(), ['12', '10', '0', '0']);
          await expect(region.locator('[data-chart-id=states]')).toContainText(
            text['chartCommon.emptyTitle'],
          );
          await expect(region.locator('[data-chart-id=currencies]')).toContainText(
            text['chartCommon.emptyTitle'],
          );
          await expect
            .poll(async () => {
              const values = await nativeFacts();
              return values.length === 2 && values.every((value) => value?.live === 2);
            })
            .toBe(true);
          dataMode = 'empty';
          await refresh();
          await expect(region).toContainText(country['countries.charts.noData']);
          await expect(region.locator('canvas,erp-metric-card')).toHaveCount(0);
          await expect
            .poll(() =>
              page.evaluate(() => Object.keys(window.__erpChartConstructor.instances).length),
            )
            .toBe(0);
          dataMode = 'error';
          await refresh();
          await expect(region).toHaveAttribute('data-kind', 'error');
          await expect(region.locator('canvas,erp-metric-card')).toHaveCount(0);
          dataMode = 'normal';
          await region.getByRole('button', { name: text['actions.retry'], exact: true }).click();
          await expect(region.locator('canvas')).toHaveCount(4);
          hold = true;
          await refresh();
          await expect.poll(() => waiting).toBe(true);
          denied = true;
          await page.evaluate(() => {
            const channel = new BroadcastChannel('erp-browser-session-context');
            channel.postMessage({ kind: 'session-changed' });
            channel.close();
          });
          await expect(region.locator('canvas,erp-metric-card')).toHaveCount(0);
          release();
          await expect(region).toHaveAttribute('data-kind', 'forbidden');
          await expect(region.locator('canvas,erp-metric-card')).toHaveCount(0);
          assert.deepEqual(errors, []);
          results.push({
            palette,
            mode,
            language,
            width,
            charts,
            layout,
            chartNoFiltersOrScopeText: true,
            firstPageRetainsCriteria: true,
            pageOnlyCounts: true,
            nativePaint: true,
            accessibleAlternatives: true,
            repaintNoGet: true,
            zeroAndEmpty: true,
            errorRetry: true,
            authorityMask: true,
            destroyOnExit: true,
            passed: true,
          });
          await context.close();
          console.log(`Countries charts passed ${palette}/${mode}/${language}/${width}`);
        }
  fs.writeFileSync(
    path.join(
      output,
      layoutOnly
        ? 'layout-results.json'
        : smoke
          ? 'smoke-results.json'
          : focused
            ? 'focused-results.json'
            : 'results.json',
    ),
    JSON.stringify(results, null, 2),
  );
} finally {
  await browser.close();
}

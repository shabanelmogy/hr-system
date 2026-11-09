import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { themePaletteOrder } from '@app/tokens';
import { dashboardFixture } from '../src/app/platform/tenants/dashboard.fixture.ts';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { serveAngularFixtureBuild } from './angular-build-browser-fixture.mjs';
import { verifyCountryGridLayout } from './country-grid-layout-assertions.mjs';

// Intercepted read acceptance (GET/POST query): no SQL/host business writes or real credentials.
const app = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const apiOrigin = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const focused = process.argv.includes('--focused');
const contextOnly = process.argv.includes('--context-only');
const full = process.argv.includes('--full');
const visualOnly = process.argv.includes('--visual-only');
const cardLayout = process.argv.includes('--card-layout');
const gridLayout = process.argv.includes('--grid-layout');
const searchLayout = process.argv.includes('--search-layout');
const mediumLayout = gridLayout || cardLayout || process.argv.includes('--medium-layout');
const paginationOnly = searchLayout || mediumLayout || process.argv.includes('--pagination-layout');
const output = path.resolve(
  app,
  contextOnly
    ? '../.codex-tmp/angular-country-cell-context'
    : '../.codex-tmp/angular-countries-screen',
);
fs.mkdirSync(output, { recursive: true });
const core = JSON.parse(fs.readFileSync(path.join(app, 'src/locales/generated/core.json'), 'utf8'));
const countries = JSON.parse(
  fs.readFileSync(path.join(app, 'src/locales/generated/reference-countries.json'), 'utf8'),
);
const version = fs
  .readFileSync(path.join(app, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const fixtures = Array.from({ length: 12 }, (_, index) => {
  const id = index + 1,
    suffix = String(id).padStart(2, '0');
  return {
    id,
    nameAr: id === 1 ? 'مصر' : `دولة اختبار ${suffix}`,
    nameEn: id === 1 ? 'Egypt' : `Test Country ${suffix}`,
    alpha2Code: id === 1 ? 'EG' : null,
    alpha3Code: id === 1 ? 'EGY' : null,
    phoneCode: id === 1 ? '+20' : null,
    currencyCode: id === 1 ? 'EGP' : null,
    createdOn: `2026-01-${suffix}T00:00:00Z`,
    updatedOn: null,
    isDeleted: false,
    statesCount: id === 1 ? 4 : 0,
  };
});
const archived = {
  ...fixtures[0],
  id: 13,
  nameAr: 'دولة مؤرشفة',
  nameEn: 'Archived Country',
  isDeleted: true,
};
if (cardLayout || gridLayout) {
  Object.assign(fixtures.at(-1), {
    nameEn: 'United Republic of Countries With a Long Official Administrative Name',
    nameAr: 'الجمهورية المتحدة للدول ذات الاسم الرسمي الطويل في السجلات الإدارية',
    alpha2Code: 'EG',
    alpha3Code: 'EGY',
    phoneCode: '+20',
    currencyCode: 'EGP',
    statesCount: 12,
  });
}
function pageResult(url, rows) {
  const p = url.searchParams,
    pageNumber = Number(p.get('pageNumber')),
    pageSize = Number(p.get('pageSize'));
  const status = p.get('status');
  let filtered = rows.filter(
    (row) => status === 'all' || row.isDeleted === (status === 'archived'),
  );
  const field = p.get('searchField'),
    operator = p.get('searchOperator'),
    search = (p.get('search') ?? '').toLowerCase();
  if (search)
    filtered = filtered.filter((row) => {
      const values =
        field === 'all'
          ? ['nameAr', 'nameEn', 'alpha2Code', 'alpha3Code', 'phoneCode', 'currencyCode'].map(
              (key) => String(row[key] ?? '').toLowerCase(),
            )
          : [String(row[field] ?? '').toLowerCase()];
      const match = (value) =>
        operator === 'equals' || operator === 'doesNotEqual'
          ? value === search
          : operator === 'startsWith'
            ? value.startsWith(search)
            : operator === 'endsWith'
              ? value.endsWith(search)
              : value.includes(search);
      return operator === 'doesNotContain' || operator === 'doesNotEqual'
        ? values.every((value) => !match(value))
        : values.some(match);
    });
  const sortBy = p.get('sortBy'),
    direction = p.get('sortDirection') === 'desc' ? -1 : 1;
  filtered.sort(
    (a, b) => String(a[sortBy] ?? '').localeCompare(String(b[sortBy] ?? '')) * direction,
  );
  const totalCount = filtered.length,
    totalPages = Math.ceil(totalCount / pageSize);
  return {
    items: filtered.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
    metaData: {
      currentPage: pageNumber,
      pageNumber,
      pageSize,
      totalPages,
      totalCount,
      hasPrev: pageNumber > 1,
      hasNext: pageNumber < totalPages,
    },
  };
}

async function verifyCompactHeader(header, caption, badgesBelow = true) {
  const title = header.getByRole('heading', { level: 1 });
  await expect(title).toHaveText(caption);
  await expect(header.locator('.view-toggles button')).toHaveCount(5);
  const bounds = await header.evaluate((element) =>
    Object.fromEntries(
      ['h1', '.title-block', '.header-badges', '.primary-action', '.secondary-controls'].map(
        (selector) => [selector, element.querySelector(selector)?.getBoundingClientRect().toJSON()],
      ),
    ),
  );
  const {
    h1: heading,
    '.title-block': titleBlock,
    '.header-badges': badges,
    '.primary-action': add,
    '.secondary-controls': controls,
  } = bounds;
  assert.ok(
    add &&
      controls &&
      add.top < titleBlock.bottom &&
      add.bottom > titleBlock.top &&
      controls.top >= Math.max(titleBlock.bottom, add.bottom) - 1,
    JSON.stringify(bounds),
  );
  if (badgesBelow) assert.ok(badges.top >= heading.bottom - 1, JSON.stringify(bounds));
  const row = await header.evaluate((element) => {
    const positions = [...element.querySelectorAll('.secondary-controls button')]
      .map((button) => button.getBoundingClientRect())
      .filter((box) => box.width)
      .map((box) => box.y + box.height / 2);
    return {
      offset: Math.max(...positions) - Math.min(...positions),
      overflow: element.scrollWidth - element.clientWidth,
    };
  });
  assert.ok(row.offset <= 2 && row.overflow <= 1, JSON.stringify(row));
}

const browser = await chromium.launch({ channel: 'chrome', headless: true }),
  results = [];
try {
  for (const palette of full ? themePaletteOrder : ['green'])
    for (const mode of ['light', 'dark'])
      for (const language of ['en', 'ar'])
        for (const width of searchLayout
          ? [390, 690, 900, 1012, 1440]
          : gridLayout
            ? [320, 690, 844, 1012, 1440]
            : cardLayout
              ? [320, 690, 1012]
              : mediumLayout
                ? [1012, 1024]
                : paginationOnly
                  ? [320, 390, 570, 571, 640, 690, 799, 800, 844, 899]
                  : [390, 1440]) {
          const height = paginationOnly ? (width === 844 ? 390 : width === 320 ? 720 : 823) : 1050;
          const context = await browser.newContext({
            ignoreHTTPSErrors: true,
            viewport: { width, height },
            reducedMotion: 'reduce',
            ...(gridLayout && width <= 844 ? { hasTouch: true, isMobile: true } : {}),
          });
          if (paginationOnly) {
            await serveAngularFixtureBuild(
              context,
              app,
              origin,
              path.resolve(app, '../.codex-tmp/countries-pagination-dev/browser'),
            );
          }
          await context.addCookies(
            Object.entries({ i18next: language, currentMode: mode, themePalette: palette }).map(
              ([name, value]) => ({ name, value, url: origin }),
            ),
          );
          const reads = [],
            errors = [];
          let sessionChecks = 0;
          await context.route(apiOrigin + '/api/**', async (route) => {
            const url = new URL(route.request().url()),
              pathname = url.pathname;
            let body;
            if (pathname.endsWith('/realtime-token')) {
              await route.fulfill({ status: 403, contentType: 'application/json', body: '{}' });
              return;
            } else if (pathname.endsWith('/csrf')) body = { requestToken: 'synthetic' };
            else if (pathname.endsWith('/session') || pathname.endsWith('/refresh')) {
              sessionChecks++;
              body = {
                isAuthenticated: true,
                user: {
                  ...sessionFixture,
                  roles: ['super_admin'],
                  permissions: paginationOnly
                    ? [
                        'Countries:View',
                        'Countries:Archive',
                        'Countries:Create',
                        'GlobalDataExports:Export',
                        'GlobalCrystalReports:View',
                      ]
                    : ['Countries:View'],
                },
              };
            } else if (pathname.endsWith('/runtime'))
              body = { catalogVersion: version, revision: 0, overrides: [] };
            else if (pathname.endsWith('/getDashboardSummary')) body = dashboardFixture;
            else if (pathname.endsWith('/modules/accessible')) body = [];
            else if (pathname === '/api/v1/countries') {
              reads.push(Object.fromEntries(url.searchParams));
              body = pageResult(url, fixtures);
            } else if (/^\/api\/v1\/countries\/\d+$/.test(pathname)) {
              const row = fixtures.find((row) => row.id === Number(pathname.split('/').at(-1)));
              assert.ok(row);
              const { statesCount, ...detail } = row;
              body = detail;
            } else if (pathname === '/api/v1/countries/query') {
              assert.equal(route.request().method(), 'POST');
              assert.equal(route.request().headers()['x-erp-xsrf'], 'synthetic');
              const query = route.request().postDataJSON();
              reads.push(query);
              const filtered = fixtures.filter((row) =>
                (query.filters ?? []).every((group) => {
                  const checks = group.constraints.map((rule) => {
                    const value = row[group.field],
                      target = rule.value,
                      left = String(value ?? '').toLowerCase(),
                      right = String(target).toLowerCase();
                    switch (rule.matchMode) {
                      case 'contains':
                        return left.includes(right);
                      case 'notContains':
                        return !left.includes(right);
                      case 'startsWith':
                        return left.startsWith(right);
                      case 'endsWith':
                        return left.endsWith(right);
                      case 'equals':
                        return typeof target === 'string' ? left === right : value === target;
                      case 'notEquals':
                        return typeof target === 'string' ? left !== right : value !== target;
                      case 'gte':
                        return value >= target;
                      case 'gt':
                        return value > target;
                      case 'lte':
                        return value <= target;
                      case 'lt':
                        return value < target;
                      case 'dateIs':
                        return String(value ?? '').slice(0, 10) === target;
                      case 'dateIsNot':
                        return String(value ?? '').slice(0, 10) !== target;
                      default:
                        throw Error('Unsupported fixture mode');
                    }
                  });
                  return group.operator === 'or' ? checks.some(Boolean) : checks.every(Boolean);
                }),
              );
              const queryUrl = new URL(apiOrigin + '/api/v1/countries');
              for (const [key, value] of Object.entries(query))
                if (key !== 'filters') queryUrl.searchParams.set(key, String(value));
              body = pageResult(queryUrl, filtered);
            } else throw Error('Unexpected actual Countries screen API ' + pathname);
            await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
          });
          const page = await context.newPage();
          page.on('pageerror', (error) => errors.push(error.message));
          const text = core[language],
            region = page.getByTestId('countries'),
            rows = page.locator('[data-collection-row]');
          if (paginationOnly) {
            await page.goto(origin + '/dev/countries');
          } else {
            await page.goto(origin + '/home');
            await page.getByTestId('open-data').getByRole('button').click();
            await expect(page.getByRole('complementary')).toContainText(
              text['menu.globalGeography'],
            );
            await page
              .getByRole('complementary')
              .getByRole('button', { name: text['menu.countries'], exact: true })
              .click();
          }
          await expect(region).toHaveAttribute('data-kind', 'ready');
          await expect(rows).toHaveCount(10);
          await page.evaluate(() => document.fonts.ready);
          const searchToggle = page.locator('erp-page-header .filter button');
          await expect(searchToggle).toHaveAttribute('aria-expanded', 'false');
          await expect(region.locator('.search-controls')).toHaveCount(0);
          await searchToggle.click();
          if (gridLayout) {
            await searchToggle.click();
            await verifyCountryGridLayout({
              page,
              region,
              width,
              mode,
              language,
              output,
              text,
              reads,
              results,
            });
            assert.deepEqual(errors, []);
            await context.close();
            continue;
          }
          if (cardLayout) {
            await searchToggle.click();
            await page.locator('erp-page-header [data-view=cards] button').click();
            const cards = region.locator('erp-card-list');
            await expect(cards.locator('[data-collection-row]')).toHaveCount(10);
            const navigation = page.locator('.drawer-toggle button');
            for (const opened of width >= 900 ? [false, true] : [false]) {
              if ((await navigation.getAttribute('aria-expanded')) !== String(opened))
                await navigation.click();
              if (width >= 900)
                await expect
                  .poll(() =>
                    page
                      .locator('.workspace-sidebar')
                      .evaluate((element) => Math.round(element.getBoundingClientRect().width)),
                  )
                  .toBe(opened ? 280 : 64);
              const first = cards.locator('[data-collection-row]').first();
              const title = first.locator('h2');
              const subtitle = first.locator('.card-heading p');
              await expect(title).toHaveAttribute(
                'title',
                language === 'ar' ? fixtures.at(-1).nameAr : fixtures.at(-1).nameEn,
              );
              await expect(subtitle).toHaveAttribute(
                'title',
                language === 'ar' ? fixtures.at(-1).nameEn : fixtures.at(-1).nameAr,
              );
              const dimensions = await first.evaluate((element) => {
                const selection = element.querySelector('.card-selection').getBoundingClientRect();
                const heading = element.querySelector('header').getBoundingClientRect();
                const body = element.querySelector('.surface-content').getBoundingClientRect();
                const title = element.querySelector('h2');
                const style = getComputedStyle(title);
                const actions = [...element.querySelectorAll('erp-row-actions button')].map(
                  (button) => button.getBoundingClientRect().toJSON(),
                );
                return {
                  selection: selection.toJSON(),
                  heading: heading.toJSON(),
                  body: body.toJSON(),
                  titleHeight: title.getBoundingClientRect().height,
                  lineHeight: parseFloat(style.lineHeight),
                  actions,
                  height: element.getBoundingClientRect().height,
                };
              });
              assert.ok(
                dimensions.selection.width >= 44 &&
                  dimensions.selection.height >= 44 &&
                  dimensions.selection.y >= dimensions.heading.y &&
                  dimensions.selection.bottom <= dimensions.body.y,
                JSON.stringify(dimensions),
              );
              assert.ok(
                dimensions.titleHeight > dimensions.lineHeight &&
                  dimensions.titleHeight <= dimensions.lineHeight * 2 + 1,
                JSON.stringify(dimensions),
              );
              assert.ok(
                dimensions.actions.every((action) => action.width >= 44 && action.height >= 44),
              );
              assert.ok(
                dimensions.actions.length > 1 &&
                  Math.abs(dimensions.actions[0].x - dimensions.actions[1].x) >= 52,
              );
              await expect(
                first.locator('erp-country-card-header .card-heading erp-status-badge'),
              ).toHaveCount(0);
              await expect(first.locator('erp-progress-meter')).toContainText('100%');
              const checkbox = first.getByRole('checkbox');
              const clear = region
                .locator('erp-collection-footer')
                .getByRole('button', { name: text['common.unselectAll'], exact: true });
              await first.locator('.card-selection').click({ position: { x: 4, y: 4 } });
              await expect(checkbox).toBeChecked();
              await expect(clear).toBeEnabled();
              await clear.click();
              await expect(checkbox).not.toBeChecked();
              await first.focus();
              await page.keyboard.press('Space');
              await expect(checkbox).toBeChecked();
              await clear.click();
              const body = await cards.locator('.cards').evaluate((element) => ({
                columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
                overflow: element.scrollWidth - element.clientWidth,
              }));
              assert.equal(body.columns, width === 1012 ? (opened ? 2 : 3) : width === 690 ? 2 : 1);
              assert.ok(body.overflow <= 1);
              assert.ok(
                await page.evaluate(
                  () =>
                    document.documentElement.scrollWidth <= innerWidth + 1 &&
                    document.documentElement.scrollHeight <= innerHeight + 1,
                ),
              );
              await page.screenshot({
                path: path.join(
                  output,
                  `cards-final-${mode}-${language}-${width}-${opened ? 'open' : 'closed'}.png`,
                ),
                animations: 'disabled',
              });
              results.push({
                mode,
                language,
                width,
                opened,
                dimensions,
                columns: body.columns,
                passed: true,
              });
              console.log(
                `Card layout passed ${language}/${mode}/${width}/${opened ? 'open' : 'closed'}`,
              );
            }
            assert.deepEqual(errors, []);
            await context.close();
            continue;
          }
          if (mediumLayout) {
            const header = page.locator('erp-page-header');
            const navigation = page.locator('.drawer-toggle button');
            for (const opened of [false, true]) {
              if ((await navigation.getAttribute('aria-expanded')) !== String(opened)) {
                await navigation.click();
              }
              await expect(navigation).toHaveAttribute('aria-expanded', String(opened));
              await verifyCompactHeader(header, countries[language]['countries.viewTitle']);
              await expect(header.locator('.primary-action button')).not.toHaveClass(/icon-only/);
              await expect(
                header.locator('erp-collection-export-menu button.icon-only'),
              ).toBeVisible();
              for (const view of ['grid', 'cards']) {
                await header.locator(`[data-view=${view}] button`).click();
                await expect(
                  region.locator(view === 'grid' ? 'erp-data-table' : 'erp-card-list'),
                ).toBeVisible();
                const toolbar = region.locator('.collection-toolbar');
                const search = toolbar.getByRole('textbox');
                const filter = header.getByRole('button', {
                  name: text['navigation.filter'],
                  exact: true,
                });
                await expect(search).toBeVisible();
                await expect(filter).toHaveAttribute('aria-expanded', 'true');
                assert.ok(
                  await toolbar.evaluate(
                    (element) =>
                      element.scrollWidth - element.clientWidth <= 1 && element.clientHeight <= 190,
                  ),
                );
                if (view === 'cards') {
                  const tracks = await region
                    .locator('.cards')
                    .evaluate((element) =>
                      getComputedStyle(element).gridTemplateColumns.split(' ').map(parseFloat),
                    );
                  assert.equal(tracks.length, opened ? 2 : 3);
                  assert.ok(
                    tracks.every((track) => track >= 260),
                    JSON.stringify(tracks),
                  );
                }
                await search.fill('Test Country');
                await expect.poll(() => reads.at(-1)?.search).toBe('Test Country');
                await expect(region).toHaveAttribute('data-kind', 'ready');
                const filteredRequests = reads.length;
                await filter.click();
                await expect(filter).toHaveAttribute('aria-expanded', 'false');
                await expect(search).toHaveCount(0);
                await expect(region.locator('erp-collection-footer')).toBeVisible();
                await filter.press('Enter');
                await expect(filter).toHaveAttribute('aria-expanded', 'true');
                await expect(search).toHaveValue('Test Country');
                assert.equal(reads.length, filteredRequests);
                await toolbar
                  .getByRole('button', { name: text['general.clear'], exact: true })
                  .click();
                await expect.poll(() => reads.at(-1)?.search ?? '').toBe('');
                await expect(region).toHaveAttribute('data-kind', 'ready');
                assert.ok(
                  await page.evaluate(
                    () =>
                      document.documentElement.scrollWidth <= innerWidth + 1 &&
                      document.documentElement.scrollHeight <= innerHeight + 1,
                  ),
                );
                if (width === 1012)
                  await page.screenshot({
                    path: path.join(
                      output,
                      `medium-${language}-${mode}-${opened ? 'open' : 'closed'}-${view}.png`,
                    ),
                    animations: 'disabled',
                  });
                results.push({
                  palette,
                  mode,
                  language,
                  width,
                  height,
                  opened,
                  view,
                  passed: true,
                });
              }
            }
            assert.deepEqual(errors, []);
            await context.close();
            continue;
          }
          if (paginationOnly) {
            const header = page.locator('erp-page-header');
            if (width < 1200)
              await verifyCompactHeader(
                header,
                countries[language]['countries.viewTitle'],
                height > 480,
              );
            if (width <= 599 || height <= 480) {
              await expect(header.locator('.primary-action button')).toHaveClass(/icon-only/);
            }
            if (width <= 759 || height <= 480) {
              await expect(
                header.locator('erp-collection-export-menu button.icon-only'),
              ).toBeVisible();
            }
            for (const view of ['grid', 'cards']) {
              if (view === 'cards') {
                await page.locator('erp-page-header [data-view=cards] button').click();
                await expect(region.locator('erp-card-list')).toBeVisible();
              }
              const toolbar = region.locator('.collection-toolbar');
              const search = toolbar.getByRole('textbox');
              await expect(search).toBeVisible();
              await expect(toolbar.getByTestId('status')).toBeVisible();
              await expect(search).toHaveAttribute('autocomplete', 'off');
              assert.ok(
                await search.evaluate((element) => {
                  const shell = element.closest('.collection-shell');
                  const style = getComputedStyle(shell);
                  const available =
                    shell.clientWidth -
                    parseFloat(style.paddingInlineStart) -
                    parseFloat(style.paddingInlineEnd);
                  return (
                    parseFloat(getComputedStyle(element).fontSize) === (available <= 896 ? 14 : 16)
                  );
                }),
                'Compact collection search keeps a readable 14px input',
              );
              for (const field of ['.search-field', '.search-operator']) {
                const selector = toolbar.locator(field);
                assert.ok(
                  await selector.evaluate((element) => {
                    const label = element.querySelector('label');
                    const control = element.querySelector('p-select');
                    const shell = element.closest('.collection-shell');
                    const shellStyle = getComputedStyle(shell);
                    const compact =
                      shell.clientWidth -
                        parseFloat(shellStyle.paddingInlineStart) -
                        parseFloat(shellStyle.paddingInlineEnd) <=
                      544;
                    const labelBox = label.getBoundingClientRect();
                    const controlBox = control.getBoundingClientRect();
                    const diagnostic = JSON.stringify({
                      width: shell.clientWidth,
                      compact,
                      label: labelBox.toJSON(),
                      control: controlBox.toJSON(),
                      clip: getComputedStyle(label).clipPath,
                      font: getComputedStyle(label).fontSize,
                      valueFont: getComputedStyle(control.querySelector('.selected-value'))
                        .fontSize,
                      aria: control.querySelector('[role="combobox"]')?.getAttribute('aria-label'),
                      text: label.textContent.trim(),
                    });
                    const valid =
                      label &&
                      control &&
                      parseFloat(getComputedStyle(label).fontSize) === 12 &&
                      parseFloat(
                        getComputedStyle(control.querySelector('.selected-value')).fontSize,
                      ) ===
                        (shell.clientWidth -
                          parseFloat(shellStyle.paddingInlineStart) -
                          parseFloat(shellStyle.paddingInlineEnd) <=
                        896
                          ? 14
                          : 16) &&
                      control.querySelector('[role="combobox"]')?.getAttribute('aria-label') ===
                        label.textContent.trim() &&
                      (compact
                        ? getComputedStyle(label).clipPath === 'inset(50%)'
                        : labelBox.top < controlBox.top &&
                          labelBox.bottom > controlBox.top &&
                          label.scrollWidth <= label.clientWidth + 1);
                    if (!valid) throw Error(diagnostic);
                    return valid;
                  }),
                );
                assert.ok(
                  await selector
                    .locator('p-select')
                    .evaluate((element) => element.getBoundingClientRect().height >= 44),
                );
              }
              assert.ok(
                await search.evaluate((element) => {
                  const label = element.closest('erp-text-field').querySelector('label');
                  return (
                    label.htmlFor === element.id &&
                    !!element.placeholder &&
                    (element.closest('.collection-shell').clientWidth > 544 ||
                      getComputedStyle(label).clipPath === 'inset(50%)')
                  );
                }),
                'Search retains its label association and placeholder at compact widths',
              );
              const toolbarBounds = await toolbar.evaluate((element) => ({
                width: element.clientWidth,
                scrollWidth: element.scrollWidth,
                controls: [
                  ...element.querySelectorAll('erp-option-select, erp-text-field, erp-button'),
                ].map((control) => {
                  const { x, y, width } = control.getBoundingClientRect();
                  return {
                    label: control.getAttribute('data-testid') ?? control.className,
                    x,
                    y,
                    width,
                  };
                }),
              }));
              if (searchLayout) {
                const rows = await toolbar.evaluate((element) => {
                  const search = element.querySelector('.search-controls').getBoundingClientRect();
                  const criteria = [
                    ...element.querySelectorAll(
                      '[toolbarFilters] p-select, [toolbarFilters] button, .toolbar-content button, .grid-options button',
                    ),
                  ]
                    .map((control) => control.getBoundingClientRect())
                    .filter((box) => box.width > 0);
                  return {
                    searchBottom: search.bottom,
                    criteriaTop: Math.min(...criteria.map((box) => box.top)),
                  };
                });
                assert.ok(rows.criteriaTop >= rows.searchBottom + 7, JSON.stringify(rows));
              }
              if (searchLayout && (width === 690 || width === 1012)) {
                const positions = await toolbar.evaluate((element) =>
                  [
                    ...element.querySelectorAll(
                      '[toolbarFilters] p-select, [toolbarFilters] button, .toolbar-content button, .grid-options button',
                    ),
                  ]
                    .filter((control) => control.getBoundingClientRect().width > 0)
                    .map((control) => {
                      const box = control.getBoundingClientRect();
                      return box.y + box.height / 2;
                    }),
                );
                assert.ok(
                  Math.max(...positions) - Math.min(...positions) <= 2,
                  JSON.stringify(positions),
                );
              }
              assert.ok(
                toolbarBounds.scrollWidth - toolbarBounds.width <= 1,
                JSON.stringify(toolbarBounds),
              );
              if (width === 690) {
                assert.ok(
                  await toolbar
                    .locator('.search-operator .p-select-label')
                    .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
                );
                const toolbarRow = await toolbar.evaluate((element) =>
                  [...element.querySelectorAll('.search-controls p-select, .search-controls input')]
                    .filter((control) => control.getBoundingClientRect().width > 0)
                    .map((control) => {
                      const { y, height } = control.getBoundingClientRect();
                      return y + height / 2;
                    }),
                );
                assert.ok(
                  Math.max(...toolbarRow) - Math.min(...toolbarRow) <= 2,
                  JSON.stringify(toolbarBounds),
                );
              }
              if (width <= 640) {
                const query = await search.boundingBox();
                const status = await toolbar.getByTestId('status').boundingBox();
                assert.ok(query.y + query.height <= status.y, JSON.stringify({ query, status }));
                if (width <= 390) {
                  const field = await toolbar.locator('.search-field').boundingBox();
                  const operator = await toolbar.locator('.search-operator').boundingBox();
                  assert.ok(
                    Math.abs(field.y - operator.y) <= 1 && field.y + field.height <= query.y,
                  );
                }
              }
              const footer = region.locator('erp-collection-footer');
              const summary = footer.locator('.selection-summary');
              const clear = summary.getByRole('button', {
                name: text['common.unselectAll'],
                exact: true,
              });
              const selectPage = region.getByRole('checkbox', {
                name: text['collections.selectPage'],
                exact: true,
              });
              await expect(clear).toBeDisabled();
              await expect(selectPage).toHaveCount(1);
              await expect(
                (view === 'grid' ? region.locator('thead') : footer).getByRole('checkbox', {
                  name: text['collections.selectPage'],
                  exact: true,
                }),
              ).toHaveCount(1);
              const checkbox = rows.first().locator('p-checkbox');
              await checkbox.click();
              await expect(checkbox.getByRole('checkbox')).toBeChecked();
              await expect(summary.locator('[aria-live]')).toHaveText(
                text['collections.selected'].replace('{{count}}', '1'),
              );
              const archive = toolbar.getByTestId('archive-selected').getByRole('button');
              await expect(archive).toBeVisible();
              assert.ok(
                await archive.evaluate((button) => {
                  const sample = document.createElement('span');
                  sample.style.color = 'var(--primary)';
                  button.append(sample);
                  const matches = getComputedStyle(button).color === getComputedStyle(sample).color;
                  sample.remove();
                  return matches;
                }),
              );
              await clear.click();
              await expect(checkbox.getByRole('checkbox')).not.toBeChecked();
              await expect(clear).toBeDisabled();
              if (view === 'cards') {
                await selectPage.click();
                await expect(summary.locator('[aria-live]')).toHaveText(
                  text['collections.selected'].replace('{{count}}', '10'),
                );
                await clear.click();
                await expect(selectPage).not.toBeChecked();
              }
              const pager = region.locator('.record-navigation-layout');
              await expect(pager.locator('.record-count')).toBeVisible();
              const selection = await summary.boundingBox();
              const pagination = await pager.boundingBox();
              assert.ok(
                selection.y < pagination.y + pagination.height &&
                  pagination.y < selection.y + selection.height,
                JSON.stringify({ selection, pagination }),
              );
              const geometry = await pager.evaluate((element) => {
                const panel = element.getBoundingClientRect();
                const recordColumn = element
                  .querySelector('.record-controls')
                  .getBoundingClientRect();
                const centerArea = panel.width <= 512 ? recordColumn : panel;
                const record = element.querySelector('.record-count').getBoundingClientRect();
                const size = element.querySelector('.size-settings').getBoundingClientRect();
                return {
                  width: panel.width,
                  centerOffset: Math.abs(
                    record.x + record.width / 2 - centerArea.x - centerArea.width / 2,
                  ),
                  rowOffset: Math.abs(record.y + record.height / 2 - size.y - size.height / 2),
                  overflow: element.scrollWidth - element.clientWidth,
                };
              });
              console.log(
                `Countries layout ${language}/${mode}/${width}x${height}/${view}`,
                geometry,
              );
              assert.ok(geometry.overflow <= 1, JSON.stringify(geometry));
              assert.ok(geometry.rowOffset <= 1, JSON.stringify(geometry));
              assert.ok(geometry.centerOffset <= 2, JSON.stringify(geometry));
              if (width === 690) {
                const body = await region.locator('[collectionBody]').boundingBox();
                const toolbarBox = await toolbar.boundingBox();
                const footerBox = await footer.boundingBox();
                assert.ok(
                  toolbarBox.y + toolbarBox.height <= body.y &&
                    body.height >= 200 &&
                    body.y + body.height <= footerBox.y + 1 &&
                    footerBox.y + footerBox.height <= height,
                  JSON.stringify({ toolbarBox, body, footerBox }),
                );
                assert.ok(
                  await page.evaluate(
                    () =>
                      document.documentElement.scrollHeight <= window.innerHeight + 1 &&
                      document.documentElement.scrollWidth <= window.innerWidth + 1,
                  ),
                );
              }
              if (
                width === 320 ||
                width === 690 ||
                (searchLayout && (width === 900 || width === 1440))
              ) {
                await page.screenshot({
                  path: path.join(
                    output,
                    `layout-${language}-${mode}-${width}x${height}-${view}.png`,
                  ),
                  animations: 'disabled',
                });
              }
            }
            assert.deepEqual(errors, []);
            results.push({ palette, mode, language, width, height, passed: true });
            await context.close();
            continue;
          }
          if (width === 1440) {
            await page
              .locator('.drawer-header')
              .getByRole('button', { name: text['menu.closeSidebar'], exact: true })
              .click();
          }
          await expect(page.locator('erp-countries-read-page p-column-filter')).toHaveCount(11);
          if (contextOnly) {
            const menu = page.locator('.p-contextmenu'),
              filter = menu.getByRole('menuitem', {
                name: text['collections.filterByCellValue'],
                exact: true,
              });
            const cell = (id, key) =>
              rows
                .filter({ has: page.locator(`[data-row-action=view][data-action-row="${id}"]`) })
                .locator(`td[data-cell-column="${key}"]`);
            const openCell = async (id, key) => {
              const target = cell(id, key);
              await target.evaluate((element) =>
                element.scrollIntoView({ block: 'nearest', inline: 'center' }),
              );
              await target.click({ button: 'right' });
              await expect(menu).toBeVisible();
            };
            await page.locator('erp-collection-footer .record-controls button').last().click();
            await expect(rows).toHaveCount(2);
            assert.equal(reads.at(-1).pageNumber, '2');
            const before = reads.length;
            await openCell(2, 'nameEn');
            await expect(filter.locator('erp-icon svg')).toHaveCount(1);
            await expect(
              menu
                .getByRole('menuitem', { name: text['actions.view'], exact: true })
                .locator('erp-icon svg'),
            ).toHaveCount(1);
            const style = await menu.evaluate((element) => {
              const box = element.getBoundingClientRect();
              return {
                background: getComputedStyle(element).backgroundColor,
                left: box.left,
                right: box.right,
              };
            });
            assert.notEqual(style.background, 'rgba(0, 0, 0, 0)');
            assert.ok(style.left >= 0 && style.right <= width + 1);
            await page.screenshot({
              path: path.join(output, `${mode}-${language}-${width}-cell-menu.png`),
              fullPage: true,
              animations: 'disabled',
            });
            await page.keyboard.press('Escape');
            await expect(menu).not.toBeVisible();
            assert.equal(reads.length, before);
            await openCell(2, 'nameEn');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
            await expect(region).toHaveAttribute('data-kind', 'ready');
            await expect(rows).toHaveCount(1);
            await expect.poll(() => reads.at(-1).pageNumber).toBe('1');
            assert.equal(reads.at(-1).search, 'Test Country 02');
            assert.equal(reads.at(-1).searchOperator, 'equals');
            assert.equal(reads.length, before + 1);
            await page
              .locator('th[data-column-key=nameEn] p-column-filter')
              .getByRole('button')
              .click();
            const native = page.locator('.p-datatable-filter-overlay');
            await expect(native.locator('erp-grid-filter-input input')).toHaveValue(
              'Test Country 02',
            );
            await expect(native).toContainText(text['collections.equals']);
            await page
              .locator('th[data-column-key=nameEn] p-column-filter')
              .getByRole('button')
              .click();
            await expect(native).not.toBeVisible();
            const rule = (field) =>
              reads.at(-1).filters?.find((group) => group.field === field)?.constraints[0];
            await openCell(2, 'statesCount');
            await filter.click();
            await expect.poll(() => rule('statesCount')?.value).toBe(0);
            assert.equal(rule('nameEn').value, 'Test Country 02');
            await openCell(2, 'isDeleted');
            await filter.click();
            await expect.poll(() => rule('isDeleted')?.value).toBe(false);
            assert.equal(rule('statesCount').value, 0);
            await openCell(2, 'createdOn');
            await filter.click();
            await expect.poll(() => rule('createdOn')?.value).toBe('2026-01-02');
            assert.equal(rule('createdOn').matchMode, 'dateIs');
            assert.equal(reads.at(-1).filters.length, 4);
            assert.equal(reads.at(-1).status, 'active');
            await page.getByTestId('reset').getByRole('button').click();
            await expect(rows).toHaveCount(10);
            await openCell(12, 'updatedOn');
            await expect(filter).toHaveCount(0);
            await menu.getByRole('menuitem', { name: text['actions.view'], exact: true }).click();
            const details = page.getByRole('dialog', {
              name: countries[language]['countries.view'],
              exact: true,
            });
            await expect(details).toBeVisible();
            await details
              .getByRole('button', { name: text['actions.close'], exact: true })
              .last()
              .click();
            assert.deepEqual(errors, []);
            results.push({
              palette,
              mode,
              language,
              width,
              style,
              textExact: true,
              zero: true,
              falseValue: true,
              dateIs: true,
              otherCriteriaRetained: true,
              serverFirstPage: true,
              nativeFilterSynchronized: true,
              nullNotFiltered: true,
              rowViewRetained: true,
              icons: true,
              keyboardEnterEscape: true,
              passed: true,
            });
            await context.close();
            console.log(`Cell context filter passed ${mode}/${language}/${width}`);
            continue;
          }

          await expect
            .poll(() =>
              page
                .locator('th[data-column-key] .column-header>span:first-child')
                .evaluateAll((titles) =>
                  titles
                    .filter((title) => title.scrollWidth > title.clientWidth + 1)
                    .map((title) => title.textContent),
                ),
            )
            .toEqual([]);
          const header = page.locator('erp-countries-read-page erp-page-header');
          await expect(header).toHaveClass(/collection-header/);
          if (process.argv.includes('--inspect-pagination')) {
            console.log(
              JSON.stringify(
                await page.locator('erp-collection-footer').evaluate((element) => ({
                  html: element.innerHTML,
                  geometry: [
                    ...element.querySelectorAll(
                      'footer,.record-controls,.page-controls,.native-page-controls,p-paginator,.p-paginator,.p-paginator-content',
                    ),
                  ].map((node) => {
                    const style = getComputedStyle(node),
                      box = node.getBoundingClientRect();
                    return {
                      tag: node.tagName,
                      class: node.className,
                      width: box.width,
                      height: box.height,
                      display: style.display,
                      flex: style.flex,
                      minWidth: style.minWidth,
                      maxWidth: style.maxWidth,
                    };
                  }),
                })),
                null,
                2,
              ),
            );
            await context.close();
            break;
          }
          const geometry = await header.evaluate((element) => {
            const box = element.getBoundingClientRect(),
              title = element.querySelector('h1');
            return {
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
              font: getComputedStyle(title).fontSize,
              weight: getComputedStyle(title).fontWeight,
              documentWidth: document.documentElement.scrollWidth,
            };
          });
          assert.equal(geometry.font, width === 390 ? '16px' : '18px');
          assert.equal(geometry.weight, '600');
          assert.ok(geometry.documentWidth <= width + 1);
          assert.ok(
            Math.abs(geometry.x - (width === 390 ? 12 : language === 'ar' ? 24 : 88)) < 1,
            JSON.stringify({ language, width, geometry }),
          );
          assert.ok(Math.abs(geometry.y - (width === 390 ? 68 : 88)) < 1);
          // Returning focus and the first ordinary clicks must not reload an unchanged scope.
          const beforeFocusReads = reads.length,
            beforeFocusChecks = sessionChecks,
            firstRow = await rows.first().elementHandle();
          await region.evaluate((element) => {
            const kinds = [];
            const observer = new MutationObserver(() =>
              kinds.push(element.getAttribute('data-kind')),
            );
            observer.observe(element, { attributes: true, attributeFilter: ['data-kind'] });
            window.__countryFocusProbe = { observer, kinds };
          });
          const sessionResponse = page.waitForResponse((response) =>
            response.url().endsWith('/api/v1/browser-auth/session'),
          );
          await page.evaluate(() => window.dispatchEvent(new Event('focus')));
          await sessionResponse;
          await expect.poll(() => sessionChecks).toBeGreaterThan(beforeFocusChecks);
          await region.click({ position: { x: 6, y: 6 } });
          await rows.first().click();
          await page.evaluate(
            () =>
              new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
          );
          const focusKinds = await page.evaluate(() => {
            const probe = window.__countryFocusProbe;
            probe.observer.disconnect();
            delete window.__countryFocusProbe;
            return probe.kinds;
          });
          assert.deepEqual(focusKinds, [], 'Stable focus/ordinary clicks must not enter loading');
          assert.equal(reads.length, beforeFocusReads);
          assert.ok(
            await firstRow.evaluate((element) => element.isConnected),
            'Stable focus must preserve the rendered rows',
          );
          await page.screenshot({
            path: path.join(
              output,
              (full ? palette + '-' : '') + mode + '-' + language + '-' + width + '-grid.png',
            ),
            fullPage: true,
            animations: 'disabled',
          });
          const footerGeometry = await page.locator('erp-collection-footer').evaluate((element) => {
            const box = element.getBoundingClientRect(),
              controls = [...element.querySelectorAll('.record-controls button')].map((control) => {
                const rect = control.getBoundingClientRect();
                return rect.y + rect.height / 2;
              });
            return { height: box.height, width: box.width, centers: controls };
          });
          assert.ok(
            footerGeometry.height <= (width === 390 ? 145 : 88),
            JSON.stringify(footerGeometry),
          );
          assert.ok(
            Math.max(...footerGeometry.centers) - Math.min(...footerGeometry.centers) <= 2,
            JSON.stringify(footerGeometry),
          );
          await expect(page.locator('erp-collection-footer .record-navigation-layout')).toHaveCount(
            1,
          );
          await expect(page.locator('.record-navigation-layout .record-controls')).toHaveCount(1);
          await expect(
            page.locator('.record-navigation-layout .record-controls button'),
          ).toHaveCount(4);
          await expect(page.locator('.record-navigation-layout .record-count')).toHaveCount(1);
          await expect(page.locator('.p-paginator-pages')).toHaveCount(0);
          if (full && (palette !== 'green' || visualOnly)) {
            const inset = await page
              .locator('.collection-shell')
              .evaluate((element) => parseFloat(getComputedStyle(element).paddingInlineStart));
            assert.equal(inset, width === 390 ? 12 : 16);
            await page
              .getByRole('button', { name: text['actions.gridOptions'], exact: true })
              .click();
            const modal = page.getByRole('dialog', {
              name: text['actions.gridOptions'],
              exact: true,
            });
            await expect(modal).toBeVisible();
            const colors = await modal.evaluate((element) => {
              const reference = document.createElement('span');
              reference.style.color = 'var(--primary)';
              element.append(reference);
              const primary = getComputedStyle(reference).color;
              reference.remove();
              return {
                background: getComputedStyle(element).backgroundColor,
                active: getComputedStyle(element.querySelector('p-tab')).color,
                primary,
              };
            });
            assert.notEqual(colors.background, 'rgba(0, 0, 0, 0)');
            assert.equal(colors.active, colors.primary);
            await page.screenshot({
              path: path.join(
                output,
                palette + '-' + mode + '-' + language + '-' + width + '-options.png',
              ),
              fullPage: true,
              animations: 'disabled',
            });
            await modal
              .locator('.options-actions')
              .getByRole('button', { name: text['actions.close'], exact: true })
              .click();
            await expect(modal).not.toBeVisible();
            await page
              .locator('th[data-column-key=nameEn] p-column-filter')
              .getByRole('button')
              .click();
            const nativeMenu = page.locator('.p-datatable-filter-overlay');
            await expect(nativeMenu).toBeVisible();
            const background = await nativeMenu.evaluate(
              (element) => getComputedStyle(element).backgroundColor,
            );
            assert.notEqual(background, 'rgba(0, 0, 0, 0)');
            await expect(
              nativeMenu.getByRole('button', { name: text['collections.addRule'], exact: true }),
            ).toBeVisible();
            await page.screenshot({
              path: path.join(
                output,
                palette + '-' + mode + '-' + language + '-' + width + '-filter.png',
              ),
              fullPage: true,
              animations: 'disabled',
            });
            assert.deepEqual(errors, []);
            results.push({
              palette,
              mode,
              language,
              width,
              geometry,
              cardPadding: inset,
              colors,
              filterBackground: background,
              interactions: false,
              passed: true,
            });
            await context.close();
            console.log(`Actual Countries visual passed ${palette}/${mode}/${language}/${width}`);
            continue;
          }
          const pager = page.locator('erp-collection-footer .record-navigation-layout');
          await expect(pager.locator('.p-paginator-pages')).toHaveCount(0);
          await expect(pager.locator('erp-option-select label')).toHaveCount(0);
          const navigationLayout = await pager.evaluate((element) => {
            const box = element.getBoundingClientRect(),
              report = element.querySelector('.record-count').getBoundingClientRect(),
              settings = element.querySelector('.size-settings').getBoundingClientRect();
            return {
              centerOffset: Math.abs(report.x + report.width / 2 - box.x - box.width / 2),
              edgeOffset:
                getComputedStyle(element).direction === 'rtl'
                  ? settings.x - box.x
                  : box.right - settings.right,
            };
          });
          assert.ok(navigationLayout.centerOffset <= 2, JSON.stringify(navigationLayout));
          assert.ok(Math.abs(navigationLayout.edgeOffset) <= 2, JSON.stringify(navigationLayout));
          await expect(pager.locator('.page-count')).toHaveText(
            text['pagination.pages'] + ': ' + new Intl.NumberFormat(language).format(2),
          );

          const sizeGeometry = await pager
            .locator('erp-option-select p-select')
            .evaluate((element) => {
              const box = element.getBoundingClientRect();
              return { width: box.width, height: box.height };
            });
          assert.equal(sizeGeometry.width, 80);
          assert.equal(sizeGeometry.height, 32);
          await expect(pager.getByRole('combobox')).toHaveAccessibleName(
            text['pagination.rowsPerPage'],
          );
          assert.ok(
            await pager
              .locator('.p-select-label')
              .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
            'The selected page size must be fully visible',
          );
          const numberAlignment = await pager
            .locator('erp-option-select p-select')
            .evaluate((element) => {
              const box = element.getBoundingClientRect(),
                label = element.querySelector('.p-select-label'),
                range = document.createRange();
              range.selectNodeContents(label);
              const text = range.getBoundingClientRect();
              return {
                x: Math.abs(text.x + text.width / 2 - box.x - box.width / 2),
                y: Math.abs(text.y + text.height / 2 - box.y - box.height / 2),
              };
            });
          assert.ok(
            numberAlignment.x <= 1.5 && numberAlignment.y <= 1.5,
            JSON.stringify(numberAlignment),
          );
          await page.locator('erp-collection-footer').screenshot({
            path: path.join(output, mode + '-' + language + '-' + width + '-footer.png'),
            animations: 'disabled',
          });
          const record = (action) =>
            pager.getByRole('button', {
              name: text['pagination.goTo' + action + 'Record'],
              exact: true,
            });
          const active = page.locator('[data-collection-row][tabindex="0"]');
          const firstKey = await rows.first().getAttribute('data-collection-row'),
            secondKey = await rows.nth(1).getAttribute('data-collection-row');
          const initialReads = reads.length;
          await expect(record('First')).toBeDisabled();
          await expect(record('Next')).toBeEnabled();
          await record('Next').click();
          await expect(active).toHaveAttribute('data-collection-row', secondKey);
          await expect(active).toBeFocused();
          assert.equal(reads.length, initialReads);
          await record('Previous').click();
          await expect(active).toHaveAttribute('data-collection-row', firstKey);
          assert.equal(reads.length, initialReads);
          await rows.last().click();
          await record('Next').click();
          await expect(rows).toHaveCount(2);
          await expect(active).toHaveAttribute(
            'data-collection-row',
            JSON.stringify(['number', 2]),
          );
          await expect(active).toBeFocused();
          assert.equal(reads.at(-1).pageNumber, '2');
          await record('Last').click();
          await expect(rows).toHaveCount(2);
          await expect(active).toHaveAttribute(
            'data-collection-row',
            JSON.stringify(['number', 1]),
          );
          await expect(active).toBeFocused();
          await expect(record('Last')).toBeDisabled();
          assert.equal(reads.at(-1).pageNumber, '2');
          await record('First').click();
          await expect(rows).toHaveCount(10);
          await expect(active).toHaveAttribute('data-collection-row', firstKey);
          await expect(active).toBeFocused();
          assert.equal(reads.at(-1).pageNumber, '1');
          await pager
            .getByRole('combobox', { name: text['pagination.rowsPerPage'], exact: true })
            .click();
          await page
            .getByRole('option', { name: new Intl.NumberFormat(language).format(5), exact: true })
            .click();
          await expect(region).toHaveAttribute('data-kind', 'ready');
          await expect(rows).toHaveCount(5);
          assert.equal(reads.at(-1).pageNumber, '1');
          // One page still has independent row navigation; no page read is necessary.
          await pager
            .getByRole('combobox', { name: text['pagination.rowsPerPage'], exact: true })
            .click();
          await page
            .getByRole('option', { name: new Intl.NumberFormat(language).format(25), exact: true })
            .click();
          await expect(rows).toHaveCount(12);
          await expect(pager.locator('.page-count')).toHaveText(
            text['pagination.pages'] + ': ' + new Intl.NumberFormat(language).format(1),
          );
          await expect(pager.locator('.record-count')).toContainText('1');
          await expect(record('Next')).toBeEnabled();
          await expect(pager.locator('.record-count')).toHaveText('1 / 12');
          const onePageReads = reads.length;
          await record('Next').click();
          await expect(active).toHaveAttribute('data-collection-row', secondKey);
          await expect(active).toBeFocused();
          await record('Last').click();
          await expect(active).toHaveAttribute(
            'data-collection-row',
            JSON.stringify(['number', 1]),
          );
          await expect(record('Next')).toBeDisabled();
          await record('Previous').click();
          await expect(active).toHaveAttribute(
            'data-collection-row',
            JSON.stringify(['number', 2]),
          );
          await record('First').click();
          await expect(active).toHaveAttribute('data-collection-row', firstKey);
          assert.equal(reads.length, onePageReads);
          await pager
            .getByRole('combobox', { name: text['pagination.rowsPerPage'], exact: true })
            .click();
          await page
            .getByRole('option', { name: new Intl.NumberFormat(language).format(10), exact: true })
            .click();
          await expect(region).toHaveAttribute('data-kind', 'ready');
          await expect(rows).toHaveCount(10);
          const cardPadding = await page
            .locator('.collection-shell')
            .evaluate((element) => parseFloat(getComputedStyle(element).paddingInlineStart));
          assert.equal(cardPadding, width === 390 ? 12 : 16);
          await expect(page.locator('.filter-region').getByTestId('status')).toBeVisible();
          const toolbarGeometry = await page.locator('.collection-toolbar').evaluate((element) => {
            const controls = [
              ...element.querySelectorAll(
                '.search-field p-select,.search-operator p-select,.search-controls .input-row,[data-testid=status] p-select,[data-testid=reset] button,:scope>erp-button button',
              ),
            ].map((control) => {
              const box = control.getBoundingClientRect();
              return { y: box.y, height: box.height, center: box.y + box.height / 2 };
            });
            return {
              controls,
              scrollWidth: element.scrollWidth,
              width: element.clientWidth,
              documentWidth: document.documentElement.scrollWidth,
            };
          });
          assert.equal(toolbarGeometry.controls.length, 6);
          assert.ok(
            Math.max(...toolbarGeometry.controls.map((c) => c.center)) -
              Math.min(...toolbarGeometry.controls.map((c) => c.center)) <=
              1,
            JSON.stringify(toolbarGeometry),
          );
          assert.ok(toolbarGeometry.documentWidth <= width + 1);
          if (width === 390) assert.ok(toolbarGeometry.scrollWidth > toolbarGeometry.width);
          const options = page.getByRole('button', {
              name: text['actions.gridOptions'],
              exact: true,
            }),
            beforeOptions = reads.length;
          await options.click();
          const dialog = page.getByRole('dialog', {
            name: text['actions.gridOptions'],
            exact: true,
          });
          await expect(dialog).toBeVisible();
          await expect(dialog).toHaveAttribute('aria-modal', 'true');
          await expect(dialog.locator('p-tabs')).toBeVisible();
          await expect(dialog.getByTestId('status')).toHaveCount(0);
          await dialog
            .locator('p-selectbutton')
            .getByRole('button', { name: text['collections.compact'], exact: true })
            .click();
          await expect
            .poll(() =>
              rows
                .first()
                .locator('td')
                .first()
                .evaluate((element) => Math.round(element.getBoundingClientRect().height)),
            )
            .toBe(36);
          await page.screenshot({
            path: path.join(output, mode + '-' + language + '-' + width + '-options-display.png'),
            fullPage: true,
            animations: 'disabled',
          });
          await dialog.locator('p-tab[value=columns]').click();
          await expect(dialog.locator('.column-option')).toHaveCount(11);
          const columnSearch = dialog.getByRole('textbox', {
            name: text['collections.searchColumns'],
            exact: true,
          });
          await columnSearch.fill(countries[language]['countries.alpha2Code']);
          await expect(dialog.locator('.column-option')).toHaveCount(1);
          await columnSearch.fill('');
          await dialog.locator('[data-option-column=alpha2Code]').getByRole('checkbox').uncheck();
          await expect(page.locator('th[data-column-key=alpha2Code]')).toHaveCount(0);
          await expect(dialog.locator('[data-option-column=actions]')).toHaveCount(0);
          const nameColumn = dialog.locator('[data-option-column=nameEn]');
          await nameColumn.locator('.column-order erp-button').first().getByRole('button').click();
          await expect(dialog.locator('.column-option').nth(1)).toHaveAttribute(
            'data-option-column',
            'nameEn',
          );
          await nameColumn.locator('erp-option-select').getByRole('combobox').click();
          await dialog
            .getByRole('option', { name: text['collections.pinStart'], exact: true })
            .click();
          await expect(page.locator('th[data-column-key=nameEn]')).toHaveClass(
            /(^|\s)p-datatable-frozen-column(\s|$)/,
          );
          await page.screenshot({
            path: path.join(output, mode + '-' + language + '-' + width + '-options-columns.png'),
            fullPage: true,
            animations: 'disabled',
          });
          const modalBounds = await dialog.evaluate((element) => ({
            width: element.getBoundingClientRect().width,
            scroll: element.scrollWidth,
            client: element.clientWidth,
          }));
          assert.ok(modalBounds.width <= width - 30);
          assert.ok(modalBounds.scroll <= modalBounds.client + 1, JSON.stringify(modalBounds));
          await dialog
            .getByRole('button', { name: text['collections.resetDisplay'], exact: true })
            .click();
          await expect(page.locator('th[data-column-key=alpha2Code]')).toHaveCount(1);
          await expect(page.locator('th[data-column-key=nameEn]')).not.toHaveClass(
            /(^|\s)p-datatable-frozen-column(\s|$)/,
          );
          await expect
            .poll(() =>
              rows
                .first()
                .locator('td')
                .first()
                .evaluate((element) => Math.round(element.getBoundingClientRect().height)),
            )
            .toBe(52);
          await page.keyboard.press('Escape');
          await expect(dialog).not.toBeVisible();
          await expect(options).toBeFocused();
          assert.equal(reads.length, beforeOptions);
          await region
            .locator('[data-row-action="view"][data-action-row="12"]')
            .getByRole('button')
            .click();
          const details = page.getByRole('dialog', {
            name: countries[language]['countries.view'],
            exact: true,
          });
          await expect(details.locator('erp-country-read-details input[readonly]')).toHaveCount(6);
          assert.equal(
            await details.evaluate((element) => element.contains(document.activeElement)),
            false,
          );
          await expect(details.locator('.p-dialog-footer')).toHaveCount(0);
          const fieldSpacing = await details
            .locator('.form-content')
            .evaluate((element) => getComputedStyle(element).rowGap);
          assert.equal(fieldSpacing, '20px');
          await page.screenshot({
            path: path.join(output, mode + '-' + language + '-' + width + '-details.png'),
            fullPage: true,
            animations: 'disabled',
          });
          await details
            .locator('erp-country-read-details')
            .getByRole('button', { name: text['actions.close'], exact: true })
            .click();
          await expect(details).not.toBeVisible();
          const open = async (field) => {
            await page
              .locator(`th[data-column-key="${field}"] p-column-filter`)
              .getByRole('button')
              .click();
            await expect(page.locator('.p-datatable-filter-overlay')).toBeVisible();
          };
          await open('nameEn');
          const menu = page.locator('.p-datatable-filter-overlay');
          const menuStyle = await menu.evaluate((element) => ({
            background: getComputedStyle(element).backgroundColor,
            opacity: getComputedStyle(element).opacity,
          }));
          assert.notEqual(menuStyle.background, 'rgba(0, 0, 0, 0)');
          assert.equal(menuStyle.opacity, '1');
          await expect(menu.locator('.p-datatable-filter-operator')).toBeVisible();
          await expect(
            menu.getByRole('button', { name: text['collections.addRule'], exact: true }),
          ).toBeVisible();
          await page.screenshot({
            path: path.join(output, mode + '-' + language + '-' + width + '-native-filter.png'),
            fullPage: true,
            animations: 'disabled',
          });
          const buttonSpacing = await menu
            .locator('.p-datatable-filter-buttonbar button')
            .evaluateAll((buttons) =>
              buttons.map((button) => {
                const style = getComputedStyle(button);
                return {
                  inline: parseFloat(style.paddingInlineStart),
                  block: parseFloat(style.paddingBlockStart),
                  height: button.getBoundingClientRect().height,
                };
              }),
            );
          assert.equal(buttonSpacing.length, 2);
          for (const button of buttonSpacing) {
            assert.ok(button.inline >= 12, JSON.stringify(buttonSpacing));
            assert.ok(button.block >= 6);
            assert.ok(button.height >= 32);
          }
          const draft = menu.locator('erp-grid-filter-input').first();
          await draft.locator('input').fill('clear alignment');
          const clear = draft.locator('button.field-action');
          await expect(clear).toBeVisible();
          await expect(clear).toHaveClass(/p-button-icon-only/);
          const clearAlignment = await clear.evaluate((button) => {
            const row = button.closest('.input-row').getBoundingClientRect(),
              box = button.getBoundingClientRect(),
              icon = button.querySelector('svg').getBoundingClientRect();
            return {
              buttonOffset: Math.abs(box.y + box.height / 2 - row.y - row.height / 2),
              iconOffset: Math.abs(icon.y + icon.height / 2 - box.y - box.height / 2),
              iconWidth: icon.width,
              iconHeight: icon.height,
            };
          });
          assert.ok(clearAlignment.buttonOffset <= 1, JSON.stringify(clearAlignment));
          assert.ok(clearAlignment.iconOffset <= 1, JSON.stringify(clearAlignment));
          assert.equal(clearAlignment.iconWidth, 16);
          assert.equal(clearAlignment.iconHeight, 16);
          await page.screenshot({
            path: path.join(output, mode + '-' + language + '-' + width + '-clear-alignment.png'),
            fullPage: true,
            animations: 'disabled',
          });
          await clear.click();
          await expect(draft.locator('input')).toHaveValue('');
          await expect(draft.locator('input')).toBeFocused();
          const before = reads.length;
          await menu.locator('erp-grid-filter-input input').fill('Egypt');
          await menu
            .getByRole('button', { name: text['collections.addRule'], exact: true })
            .click();
          await menu.locator('erp-grid-filter-input input').nth(1).fill('Test Country 02');
          await menu.locator('.p-datatable-filter-operator').getByRole('combobox').click();
          await page
            .getByRole('option', { name: text['collections.matchAny'], exact: true })
            .click();
          assert.equal(reads.length, before);
          await menu.getByRole('button', { name: text['collections.apply'], exact: true }).click();
          await expect.poll(() => reads.at(-1)?.filters?.[0]?.constraints.length).toBe(2);
          await expect(region).toHaveAttribute('data-kind', 'ready');
          await expect(rows).toHaveCount(2);
          assert.equal(reads.at(-1).filters[0].operator, 'or');
          await open('alpha2Code');
          await menu.locator('erp-grid-filter-input input').fill('EG');
          await menu.getByRole('button', { name: text['collections.apply'], exact: true }).click();
          await expect.poll(() => reads.at(-1)?.filters?.length).toBe(2);
          await expect(region).toHaveAttribute('data-kind', 'ready');
          await expect(rows).toHaveCount(1);
          await open('alpha2Code');
          await menu
            .locator('.p-datatable-filter-buttonbar')
            .getByRole('button', { name: text['collections.clear'], exact: true })
            .click();
          await expect.poll(() => reads.at(-1)?.filters?.length).toBe(1);
          await expect(region).toHaveAttribute('data-kind', 'ready');
          await expect(rows).toHaveCount(2);
          await open('nameEn');
          await menu
            .locator('.p-datatable-filter-buttonbar')
            .getByRole('button', { name: text['collections.clear'], exact: true })
            .click();
          await expect.poll(() => reads.at(-1)?.filters).toBeUndefined();
          await expect(region).toHaveAttribute('data-kind', 'ready');
          await expect(rows).toHaveCount(10);
          await header.locator('[data-view=cards]').getByRole('button').click();
          await expect(page.locator('erp-card-list erp-surface-card')).toHaveCount(10);
          const cardReads = reads.length;
          await record('Next').click();
          await expect(active).toHaveAttribute('data-collection-row', secondKey);
          await expect(active).toBeFocused();
          assert.equal(reads.length, cardReads);
          await header.locator('[data-view=grid]').getByRole('button').click();
          await expect(rows).toHaveCount(10);
          assert.deepEqual(errors, []);
          results.push({
            palette,
            mode,
            language,
            width,
            menuStyle,
            geometry,
            toolbarGeometry,
            footerGeometry,
            navigationLayout,
            numberAlignment,
            focusKinds,
            focusRevalidatedWithoutDataReload: true,
            fieldSpacing,
            cardPadding,
            modalBounds,
            buttonSpacing,
            clearAlignment,
            serverRequests: reads.length,
            nativeFilters: 11,
            interactions: true,
            passed: true,
          });
          await context.close();
          console.log(`Actual Countries screen passed ${palette}/${mode}/${language}/${width}`);
        }
  fs.writeFileSync(
    path.join(
      output,
      gridLayout
        ? 'grid-layout-results.json'
        : cardLayout
          ? 'card-layout-results.json'
          : mediumLayout
            ? 'medium-results.json'
            : paginationOnly
              ? 'pagination-results.json'
              : full
                ? 'visual-results.json'
                : 'results.json',
    ),
    JSON.stringify(results, null, 2),
  );
} finally {
  await browser.close();
}

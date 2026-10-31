import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { themePaletteOrder } from '@app/tokens';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

// Intercepted GET acceptance only: no SQL/host business writes and no real credentials.
const app = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const apiOrigin = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const focused = process.argv.includes('--focused');
const output = path.resolve(app, '../.codex-tmp/angular-countries', focused ? 'focused' : 'full');
fs.mkdirSync(output, { recursive: true });
const core = JSON.parse(fs.readFileSync(path.join(app, 'src/locales/generated/core.json'), 'utf8'));
const countries = JSON.parse(fs.readFileSync(path.join(app, 'src/locales/generated/reference-countries.json'), 'utf8'));
const version = fs.readFileSync(path.join(app, 'src/app/platform/localization/catalog.generated.ts'), 'utf8').match(/[a-f0-9]{64}/)[0];
const fixtures = Array.from({ length: 12 }, (_, index) => {
  const id = index + 1, suffix = String(id).padStart(2, '0');
  return { id, nameAr: id === 1 ? 'مصر' : `دولة اختبار ${suffix}`, nameEn: id === 1 ? 'Egypt' : `Test Country ${suffix}`,
    alpha2Code: id === 1 ? 'EG' : null, alpha3Code: id === 1 ? 'EGY' : null,
    phoneCode: id === 1 ? '+20' : null, currencyCode: id === 1 ? 'EGP' : null,
    createdOn: `2026-01-${suffix}T00:00:00Z`, updatedOn: null, isDeleted: false, statesCount: id === 1 ? 4 : 0 };
});
const archived = { ...fixtures[0], id: 13, nameAr: 'دولة مؤرشفة', nameEn: 'Archived Country', isDeleted: true };
function pageResult(url, rows) {
  const p = url.searchParams, pageNumber = Number(p.get('pageNumber')), pageSize = Number(p.get('pageSize'));
  const status = p.get('status'); let filtered = rows.filter(row => status === 'all' || row.isDeleted === (status === 'archived'));
  const field = p.get('searchField'), operator = p.get('searchOperator'), search = (p.get('search') ?? '').toLowerCase();
  if (search) filtered = filtered.filter(row => {
    const values = field === 'all' ? ['nameAr', 'nameEn', 'alpha2Code', 'alpha3Code', 'phoneCode', 'currencyCode'].map(key => String(row[key] ?? '').toLowerCase()) : [String(row[field] ?? '').toLowerCase()];
    const match = value => operator === 'equals' || operator === 'doesNotEqual' ? value === search : operator === 'startsWith' ? value.startsWith(search) : operator === 'endsWith' ? value.endsWith(search) : value.includes(search);
    return operator === 'doesNotContain' || operator === 'doesNotEqual' ? values.every(value => !match(value)) : values.some(match);
  });
  const sortBy = p.get('sortBy'), direction = p.get('sortDirection') === 'desc' ? -1 : 1;
  filtered.sort((a, b) => String(a[sortBy] ?? '').localeCompare(String(b[sortBy] ?? '')) * direction);
  const totalCount = filtered.length, totalPages = Math.ceil(totalCount / pageSize);
  return { items: filtered.slice((pageNumber - 1) * pageSize, pageNumber * pageSize), metaData: {
    currentPage: pageNumber, pageNumber, pageSize, totalPages, totalCount, hasPrev: pageNumber > 1, hasNext: pageNumber < totalPages,
  } };
}
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const palette of focused ? ['green'] : themePaletteOrder) for (const mode of ['light', 'dark']) for (const language of ['en', 'ar']) for (const width of [390, 1440]) {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width, height: 1050 }, reducedMotion: 'reduce' });
    await context.addCookies(Object.entries({ themePalette: palette, currentMode: mode, i18next: language }).map(([name, value]) => ({ name, value, url: origin })));
    const state = { allowed: true, role: true, pageMode: 'ready', detailMode: 'ready', pageReads: [], detailReads: [], sessions: 0, includeArchive: false, release: null };
    await context.route(apiOrigin + '/api/**', async route => {
      const request = route.request(), url = new URL(request.url()), pathname = url.pathname;
      assert.equal(request.headers().authorization, undefined, 'Cookie contract must not acquire a bearer');
      let body, status = 200;
      if (pathname.endsWith('/csrf')) body = { requestToken: 'synthetic-countries-acceptance' };
      else if (pathname.endsWith('/session')) {
        state.sessions++;
        body = { isAuthenticated: true, user: { ...sessionFixture, roles: state.role ? ['super_admin'] : ['user'], permissions: state.allowed ? ['Countries:View'] : [] } };
      } else if (pathname.endsWith('/runtime')) body = { tenantId: sessionFixture.tenantId, companyId: 1, defaultLanguage: 'en', catalogVersion: version, revision: 0, overrides: [] };
      else if (pathname === '/api/v1/countries') {
        assert.equal(request.method(), 'GET');
        state.pageReads.push(Object.fromEntries(url.searchParams));
        if (state.pageMode === 'network') { await route.abort('failed'); return; }
        if (state.pageMode === 'delay') await new Promise(resolve => { state.release = resolve; });
        if (state.pageMode === 'forbidden') status = 403;
        if (state.pageMode === 'unauthorized') status = 401;
        body = state.pageMode === 'malformed' ? { items: fixtures, metaData: {} } : pageResult(url, state.pageMode === 'empty' ? [] : state.includeArchive ? [...fixtures, archived] : fixtures);
      } else if (/^\/api\/v1\/countries\/\d+$/.test(pathname)) {
        assert.equal(request.method(), 'GET'); const id = Number(pathname.split('/').at(-1)); state.detailReads.push(id);
        if (state.detailMode === 'delay') await new Promise(resolve => { state.release = resolve; });
        if (state.detailMode === 'missing') status = 404;
        if (state.detailMode === 'forbidden') status = 403;
        const row = [...fixtures, archived].find(row => row.id === id); const { statesCount, ...detail } = row;
        body = state.detailMode === 'malformed' ? { ...detail, id: -1 } : detail;
      } else throw Error('Unexpected Countries acceptance API ' + request.method() + ' ' + pathname);
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }).catch(() => {});
    });
    const page = await context.newPage(), errors = [], hotUpdates = [], nativeDialogs = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', async dialog => { nativeDialogs.push(dialog.type()); await dialog.dismiss(); });
    page.on('websocket', socket => socket.on('framereceived', frame => {
      try { const update = JSON.parse(String(frame.payload)); if (update.type === 'full-reload' || update.event === 'angular:component-update') hotUpdates.push(update); } catch {}
    }));
    const text = core[language], countryText = countries[language];
    const region = page.getByTestId('countries'), rows = page.locator('[data-collection-row]');
    const click = id => page.getByTestId(id).getByRole('button').click();
    const ready = async () => {
      await expect(region).toHaveAttribute('data-kind', 'ready');
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await expect(region).toHaveAttribute('data-kind', 'ready');
    };
    const choose = async (locator, label) => { await locator.getByRole('combobox').click(); await page.getByRole('option', { name: label, exact: true }).click(); };
    const search = () => page.locator('.search-controls input');
    const reset = async () => {
      await click('reset');
      await expect.poll(() => state.pageReads.at(-1)).toEqual({ pageNumber: '1', pageSize: '10', searchField: 'all', searchOperator: 'contains', status: 'active', sortBy: 'createdOn', sortDirection: 'desc' });
      await ready();
    };
    const broadcast = async () => { const count = state.sessions; await page.evaluate(() => { const channel = new BroadcastChannel('erp-browser-session-context'); channel.postMessage({ kind: 'session-changed' }); channel.close(); }); await expect.poll(() => state.sessions).toBe(count + 1); };
    await page.goto(origin + '/dev/countries'); await ready(); await expect(rows).toHaveCount(10); await page.evaluate(() => document.fonts.ready);
    assert.equal(state.pageReads.length, 1, 'Initial controlled desc sort must issue one GET');
    assert.equal(state.pageReads[0].sortBy, 'createdOn'); assert.equal(state.pageReads[0].sortDirection, 'desc'); assert.equal(state.pageReads[0].pageSize, '10');
    await expect(rows.first()).toHaveAttribute('data-collection-row', '["number",12]');
    await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    const geometry = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, viewport: innerWidth,
      rowHeight: document.querySelector('[data-collection-row]').getBoundingClientRect().height,
      footerHeight: document.querySelector('erp-collection-footer').getBoundingClientRect().height }));
    assert.ok(geometry.documentWidth <= width + 1); assert.equal(geometry.rowHeight, 52); assert.ok(geometry.footerHeight >= 52);
    await page.screenshot({ path: path.join(output, `${palette}-${mode}-${language}-${width}-grid.png`), fullPage: true, animations: 'disabled' });
    await click('cards-view'); await expect(page.locator('erp-card-list erp-surface-card')).toHaveCount(10); assert.equal(state.pageReads.length, 1);
    geometry.cardColumns = await page.locator('erp-card-list .cards').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    assert.equal(geometry.cardColumns, width === 390 ? 1 : 4);
    await expect(page.locator('.card-heading h2').first()).toHaveText(language === 'ar' ? 'دولة اختبار 12' : 'Test Country 12');
    await page.screenshot({ path: path.join(output, `${palette}-${mode}-${language}-${width}-cards.png`), fullPage: true, animations: 'disabled' });
    if (focused) {
      await choose(page.getByTestId('sort'), text['general.nameEn']); await ready(); await expect.poll(() => state.pageReads.at(-1).sortBy).toBe('nameEn');
      await click('direction'); await ready(); assert.equal(state.pageReads.at(-1).sortDirection, 'asc');
      await expect(page.locator('.card-heading h2').first()).toHaveText(language === 'ar' ? 'مصر' : 'Egypt');
      await page.locator('[data-view-id="1"]').getByRole('button').click(); await expect(page.locator('erp-country-read-details input')).toHaveCount(6);
      const detail = page.locator('erp-country-read-details'); assert.deepEqual(await detail.locator('input').evaluateAll(inputs => inputs.map(input => input.value)), ['مصر', 'Egypt', 'EG', 'EGY', '+20', 'EGP']);
      assert.ok(await detail.locator('input').evaluateAll(inputs => inputs.every(input => input.readOnly))); await expect(detail.locator('button[type=submit]')).toHaveCount(0);
      await expect(detail.locator('form')).toHaveAttribute('novalidate', '');
      await page.screenshot({ path: path.join(output, `${mode}-${language}-${width}-detail.png`), fullPage: true, animations: 'disabled' });
      await detail.getByRole('button', { name: text['actions.close'], exact: true }).click(); await expect(detail).toHaveCount(0);
      await reset(); await click('grid-view'); await ready();
      await page.getByRole('columnheader', { name: text['general.nameEn'], exact: false }).click(); await ready();
      await expect.poll(() => state.pageReads.at(-1).sortBy).toBe('nameEn');
      await reset(); const beforeLocale = state.pageReads.length; await click('language'); await click('language'); assert.equal(state.pageReads.length, beforeLocale);
      await page.locator('erp-collection-footer').getByRole('button', { name: text['pagination.next'], exact: true }).click(); await ready(); await expect(rows).toHaveCount(2); assert.equal(state.pageReads.at(-1).pageNumber, '2');
      await choose(page.locator('erp-collection-footer p-paginator'), new Intl.NumberFormat(language).format(5)); await ready(); await expect(rows).toHaveCount(5); assert.equal(state.pageReads.at(-1).pageNumber, '1');
      await page.locator('.record-controls').getByRole('button', { name: text['pagination.goToLastRecord'], exact: true }).click(); await expect.poll(() => state.pageReads.at(-1).pageNumber).toBe('3'); await ready();
      await reset();
      await search().fill('  Egypt  '); await expect.poll(() => state.pageReads.at(-1).search).toBe('Egypt'); await ready(); await expect(rows).toHaveCount(1);
      await choose(page.locator('.search-controls erp-option-select').first(), countryText['countries.alpha2Code']); await choose(page.locator('.search-controls erp-option-select').nth(1), text['search.equals']);
      await search().fill('eg'); await expect.poll(() => state.pageReads.at(-1).search).toBe('eg'); await ready(); await expect(rows).toHaveCount(1);
      const validReads = state.pageReads.length;
      await search().evaluate(input => { input.value = 'x'.repeat(201); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('blur')); });
      await expect(page.locator('.search-controls .error')).toBeVisible(); await page.waitForTimeout(350); assert.equal(state.pageReads.length, validReads);
      await reset(); state.includeArchive = true; await choose(page.getByTestId('status'), countryText['countries.status.archived']); await ready(); await expect(rows).toHaveCount(1); await expect(rows).toHaveAttribute('data-collection-row', '["number",13]');
      await reset();
      for (const scenario of ['empty', 'malformed', 'network', 'unauthorized']) {
        state.pageMode = scenario; await click('refresh'); await expect(region).toHaveAttribute('data-kind', scenario === 'empty' ? 'ready' : 'error'); await expect(rows).toHaveCount(0);
        state.pageMode = 'ready'; if (scenario === 'empty') await click('refresh'); else await region.getByRole('button', { name: text['actions.retry'], exact: true }).click();
        await ready(); await expect(rows).toHaveCount(10);
      }
      state.detailMode = 'missing'; await page.locator('[data-view-id="12"]').getByRole('button').click(); await expect(page.locator('[role=dialog] erp-feedback-state')).toBeVisible();
      await expect(page.locator('erp-country-read-details')).toHaveCount(0); state.detailMode = 'ready'; await page.getByRole('dialog').getByRole('button', { name: text['actions.retry'], exact: true }).click();
      await expect(page.locator('erp-country-read-details input')).toHaveCount(6); await page.locator('erp-country-read-details').getByRole('button', { name: text['actions.close'], exact: true }).click();
      state.detailMode = 'delay'; await page.locator('[data-view-id="12"]').getByRole('button').click(); await expect.poll(() => state.release !== null).toBe(true); await page.getByRole('dialog').getByRole('button', { name: text['actions.close'], exact: true }).click(); state.release(); state.release = null; state.detailMode = 'ready'; await expect(page.getByRole('dialog')).toHaveCount(0);
      state.pageMode = 'forbidden'; await click('refresh'); await expect(region).toHaveAttribute('data-kind', 'forbidden'); const deniedReads = state.pageReads.length;
      state.pageMode = 'ready'; await click('refresh'); assert.equal(state.pageReads.length, deniedReads); await broadcast(); await ready();
      state.allowed = false; await broadcast(); await expect(region).toHaveAttribute('data-kind', 'forbidden'); await expect(rows).toHaveCount(0); const revokedReads = state.pageReads.length;
      await click('refresh'); assert.equal(state.pageReads.length, revokedReads); state.allowed = true; state.role = false; await broadcast(); await expect(region).toHaveAttribute('data-kind', 'forbidden'); assert.equal(state.pageReads.length, revokedReads);
      state.role = true; await broadcast(); await ready(); await expect(rows).toHaveCount(10);
      state.pageMode = 'delay'; await click('refresh'); await expect.poll(() => state.release !== null).toBe(true); await page.goto(origin + '/dev/reads'); state.release(); state.release = null;
      await expect(region).toHaveCount(0);
    }
    assert.deepEqual(errors, []); assert.deepEqual(hotUpdates, [], 'Source changed during acceptance'); assert.deepEqual(nativeDialogs, []);
    results.push({ palette, mode, language, width, geometry, pageGets: state.pageReads.length, detailGets: state.detailReads.length, passed: true });
    await context.close(); console.log(`Countries read passed ${palette}/${mode}/${language}/${width}`);
  }
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`Countries read: ${results.length} ${focused ? 'focused lifecycle' : 'visual'} cases passed; intercepted GET fixtures only.`);
} finally { await browser.close(); }

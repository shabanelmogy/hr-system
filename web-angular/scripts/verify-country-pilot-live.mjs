import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { utils, write } from 'xlsx';
import { readApiEnvironment, resolveApiOrigin } from './configure-api.mjs';

// Explicit opt-in: creates uniquely named test Countries and archives only those
// records in finally. Archive preserves audit/history; it is not physical removal.
assert.ok(process.argv.includes('--test-writes'), 'Pass --test-writes for isolated test data.');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4210';
const api = process.env.ANGULAR_API_ORIGIN ?? resolveApiOrigin(readApiEnvironment()).origin;
const output = path.resolve(import.meta.dirname, '../../.codex-tmp/angular-country-pilot-live');
fs.mkdirSync(output, { recursive: true });
const resource = (name) =>
  JSON.parse(
    fs.readFileSync(path.resolve(import.meta.dirname, `../src/locales/generated/${name}.json`)),
  ).en;
const core = resource('core');
const countries = resource('reference-countries');
const marker = `ERPQA${Date.now()}`;
const owned = new Set();
const writes = [];
const cases = [];
const contexts = [];
const cleanup = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let writer;
let observer;
let stage = 'login';
let failure = null;

async function request(page, method, pathname, body) {
  return page.evaluate(
    async ({ api, method, pathname, body }) => {
      const headers = {};
      if (!['GET', 'HEAD'].includes(method)) {
        const csrf = await fetch(api + '/api/v1/browser-auth/csrf', { credentials: 'include' });
        if (!csrf.ok) throw new Error('CSRF unavailable');
        headers['X-ERP-XSRF'] = (await csrf.json()).requestToken;
        if (body !== undefined) headers['Content-Type'] = 'application/json';
      }
      const response = await fetch(api + pathname, {
        method,
        credentials: 'include',
        headers,
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const text = await response.text();
      return { status: response.status, body: text ? JSON.parse(text) : null };
    },
    { api, method, pathname, body },
  );
}

async function login() {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  contexts.push(context);
  await context.addCookies([{ name: 'i18next', value: 'en', url: origin }]);
  await context.route(api + '/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (
      ['GET', 'HEAD', 'OPTIONS'].includes(req.method()) ||
      url.pathname.startsWith('/api/v1/browser-auth/') ||
      url.pathname.startsWith('/hubs/company')
    )
      return route.continue();
    assert.ok(url.pathname.startsWith('/api/v1/countries'), 'Only Countries test mutations');
    const body = req.postDataJSON();
    if (req.method() === 'POST' && url.pathname === '/api/v1/countries') {
      assert.ok(body.nameEn.startsWith(marker), 'Only uniquely marked new test records');
    } else if (url.pathname === '/api/v1/countries/bulk') {
      assert.ok(body.countries.every((country) => country.nameEn.startsWith(marker)));
    } else if (url.pathname === '/api/v1/countries/bulk-archive') {
      assert.ok(
        body.ids.every((id) => owned.has(id)),
        'Only IDs created by this run',
      );
    } else {
      const id = Number(url.pathname.split('/')[4]);
      assert.ok(owned.has(id), 'Never edit/archive a pre-existing Country');
      if (body?.nameEn) assert.ok(body.nameEn.startsWith(marker));
    }
    writes.push({ method: req.method(), path: url.pathname });
    return route.continue();
  });
  const page = await context.newPage();
  await page.goto(origin + '/login');
  await page.locator('.demo-superadmin button').click();
  await expect(page).toHaveURL(origin + '/home', { timeout: 45000 });
  await page.goto(origin + '/dev/countries');
  await expect(page.getByTestId('countries')).toHaveAttribute('data-kind', 'ready', {
    timeout: 45000,
  });
  await expect.poll(() => live(page), { timeout: 45000 }).toBe('connected');
  await page.locator('erp-collection-frame .search-controls input').fill(marker);
  await expect.poll(() => snapshot(page).then((value) => value.query.search)).toBe(marker);
  await expect.poll(() => snapshot(page).then((value) => value.items.length)).toBe(0);
  return page;
}

const snapshot = (page) =>
  page.evaluate(() => {
    const state = ng.getComponent(document.querySelector('erp-countries-read-page')).state;
    return {
      query: state.query(),
      items: state.source().result?.rows ?? [],
      kind: state.source().kind,
    };
  });
const live = (page) =>
  page.evaluate(() =>
    ng.getComponent(document.querySelector('erp-countries-read-page')).state.liveStatus(),
  );
const sees = async (page, id, name) => {
  await expect
    .poll(async () => (await snapshot(page)).items.find((item) => item.id === id)?.nameEn, {
      timeout: 45000,
    })
    .toBe(name);
};
async function pick(page, view) {
  const header = page.locator('erp-page-header');
  const direct = header.locator(`[data-view=${view}] button`);
  if (await direct.isVisible()) await direct.click();
  else {
    await header.getByRole('button', { name: core['navigation.moreViews'], exact: true }).click();
    await page
      .locator('.overflow-views')
      .getByRole('button', { name: core['views.' + view], exact: true })
      .click();
  }
}
const detailResponse = (page, method, suffix = '') =>
  page.waitForResponse(
    (response) =>
      response.url().startsWith(api + '/api/v1/countries' + suffix) &&
      response.request().method() === method,
    { timeout: 30000 },
  );

try {
  writer = await login();
  observer = await login();
  cases.push({ name: 'two-real-cookie-sessions-and-authorized-hubs', passed: true });
  stage = 'create';
  await writer.locator('erp-page-header .primary-action').getByRole('button').click();
  const add = writer.getByRole('dialog', { name: countries['countries.add'], exact: true });
  const firstName = marker + ' Created';
  await add.locator('input[name=nameAr]').fill('دولة اختبار قبول ' + marker);
  await add.locator('input[name=nameEn]').fill(firstName);
  const createdResponse = detailResponse(writer, 'POST');
  await add.locator('button[type=submit]').click();
  const created = await createdResponse;
  assert.equal(created.status(), 201);
  const entity = await created.json();
  assert.ok(Number.isSafeInteger(entity.id));
  owned.add(entity.id);
  await expect(add).not.toBeVisible();
  await sees(writer, entity.id, firstName);
  await sees(observer, entity.id, firstName);
  cases.push({ name: 'ui-create-real-postcommit-delivery-to-second-session', passed: true });

  stage = 'edit';
  await writer.locator(`[data-row-action=edit][data-action-row="${entity.id}"] button`).click();
  const editor = writer.getByRole('dialog', { name: countries['countries.edit'], exact: true });
  await expect(editor.locator('input[name=nameEn]')).toHaveValue(firstName);
  const editedName = marker + ' Edited';
  await editor.locator('input[name=nameEn]').fill(editedName);
  const editedResponse = detailResponse(writer, 'PUT', '/' + entity.id);
  await editor.locator('button[type=submit]').click();
  assert.equal((await editedResponse).status(), 200);
  await sees(observer, entity.id, editedName);
  cases.push({ name: 'ui-edit-load-save-and-remote-reconciliation', passed: true });

  stage = 'missed-event-reconnect';
  await observer.context().setOffline(true);
  await expect.poll(() => live(observer), { timeout: 45000 }).not.toBe('connected');
  const reconnectedName = marker + ' Reconnected';
  const update = await request(writer, 'PUT', '/api/v1/countries/' + entity.id, {
    nameAr: entity.nameAr,
    nameEn: reconnectedName,
    alpha2Code: null,
    alpha3Code: null,
    phoneCode: null,
    currencyCode: null,
  });
  assert.equal(update.status, 200);
  await observer.context().setOffline(false);
  await expect.poll(() => live(observer), { timeout: 65000 }).toBe('connected');
  await sees(observer, entity.id, reconnectedName);
  assert.equal((await snapshot(observer)).query.search, marker);
  cases.push({ name: 'real-offline-missed-change-reconnect-retains-criteria', passed: true });

  stage = 'archive-restore';
  assert.equal((await request(writer, 'DELETE', '/api/v1/countries/' + entity.id)).status, 204);
  await expect
    .poll(() => snapshot(observer).then((value) => value.items.length), { timeout: 45000 })
    .toBe(0);
  assert.equal(
    (await request(writer, 'POST', `/api/v1/countries/${entity.id}/restore`)).status,
    204,
  );
  await sees(observer, entity.id, reconnectedName);
  cases.push({ name: 'real-archive-restore-and-remote-list-reconciliation', passed: true });

  stage = 'import';
  await pick(writer, 'import');
  const book = utils.book_new();
  utils.book_append_sheet(
    book,
    utils.aoa_to_sheet([
      ['nameAr', 'nameEn', 'alpha2Code', 'alpha3Code', 'phoneCode', 'currencyCode'],
      ['دولة استيراد اختبار ' + marker, marker + ' Imported', '', '', '', ''],
    ]),
    'Import',
  );
  await writer.locator('erp-country-import-view input[type=file]').setInputFiles({
    name: 'countries-acceptance.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from(write(book, { type: 'buffer', bookType: 'xlsx', compression: true })),
  });
  await expect(writer.getByTestId('import-preview')).toBeVisible();
  const importedResponse = detailResponse(writer, 'POST', '/bulk');
  await writer.getByTestId('import-submit').getByRole('button').click();
  assert.equal((await importedResponse).status(), 201);
  // Capture only exact marker records from the server, including cleanup after a
  // partial assertion failure; no assumptions about generated sequential IDs.
  const imported = await request(
    writer,
    'GET',
    '/api/v1/countries?pageNumber=1&pageSize=100&status=active&searchField=nameEn&searchOperator=startsWith&search=' +
      marker,
  );
  assert.equal(imported.status, 200);
  for (const item of imported.body.items) {
    assert.ok(item.nameEn.startsWith(marker));
    owned.add(item.id);
  }
  assert.equal(owned.size, 2);
  await expect
    .poll(() => snapshot(observer).then((value) => value.items.length), { timeout: 45000 })
    .toBe(2);
  cases.push({ name: 'real-xlsx-ui-bulk-import-and-remote-delivery', passed: true });
  stage = 'bulk-archive';
  const bulk = await request(writer, 'POST', '/api/v1/countries/bulk-archive', { ids: [...owned] });
  assert.equal(bulk.status, 200);
  await expect
    .poll(() => snapshot(observer).then((value) => value.items.length), { timeout: 45000 })
    .toBe(0);
  cases.push({ name: 'real-bulk-archive-owned-records-and-remote-delivery', passed: true });
} catch (error) {
  failure = {
    stage,
    type: error?.name ?? 'Error',
    message: String(error?.message ?? error).slice(0, 1800),
  };
} finally {
  if (observer)
    await observer
      .context()
      .setOffline(false)
      .catch(() => {});
  if (writer) {
    // Recover successful creates/imports if a later assertion failed. Exact
    // server-side name filtering is followed by an independent marker check.
    try {
      const found = await request(
        writer,
        'GET',
        '/api/v1/countries?pageNumber=1&pageSize=100&status=all&searchField=nameEn&searchOperator=startsWith&search=' +
          marker,
      );
      assert.equal(found.status, 200);
      for (const item of found.body.items) {
        assert.ok(item.nameEn.startsWith(marker));
        owned.add(item.id);
        if (!item.isDeleted) {
          const result = await request(writer, 'DELETE', '/api/v1/countries/' + item.id);
          cleanup.push({ id: item.id, status: result.status });
          assert.equal(result.status, 204);
        }
      }
      const checked = await request(
        writer,
        'GET',
        '/api/v1/countries?pageNumber=1&pageSize=100&status=all&searchField=nameEn&searchOperator=startsWith&search=' +
          marker,
      );
      assert.equal(checked.status, 200);
      assert.ok(
        checked.body.items.every((item) => item.nameEn.startsWith(marker) && item.isDeleted),
      );
      cleanup.push({ allOwnedArchived: true, ids: [...owned] });
    } catch (error) {
      cleanup.push({ allOwnedArchived: false, errorType: error?.name ?? 'Error' });
    }
  }
  for (const context of contexts) {
    const page = context.pages()[0];
    if (page) {
      const logout = await request(page, 'POST', '/api/v1/browser-auth/logout').catch(() => null);
      cleanup.push({ logoutStatus: logout?.status ?? null });
    }
    await context.close();
  }
  await browser.close();
  const passed = !failure && cleanup.some((item) => item.allOwnedArchived === true);
  fs.writeFileSync(
    path.join(output, 'results.json'),
    JSON.stringify(
      {
        date: new Date().toISOString(),
        origin,
        api,
        actualApi: true,
        normalTlsValidation: true,
        marker,
        cases,
        writes,
        cleanup,
        archivedRecordsRetained: true,
        failure,
        passed,
      },
      null,
      2,
    ),
  );
  console.log(
    `Live Countries pilot: ${cases.length} cases; ${passed ? 'passed' : 'failed at ' + stage}. Sanitized receipt saved.`,
  );
  if (!passed) process.exitCode = 1;
}

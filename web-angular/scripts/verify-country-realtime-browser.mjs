import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { utils, write } from 'xlsx';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

// The real installed SignalR client negotiates/handshakes with isolated browser
// fixtures. No connection, credential or business write reaches the hosted API.
const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(root, '../.codex-tmp/angular-country-realtime');
fs.mkdirSync(output, { recursive: true });
const core = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const countries = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/reference-countries.json'), 'utf8'),
);
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const fixture = {
  id: 1,
  nameAr: 'مصر',
  nameEn: 'Egypt',
  alpha2Code: 'EG',
  alpha3Code: 'EGY',
  phoneCode: '+20',
  currencyCode: 'EGP',
  createdOn: '2026-01-01T00:00:00Z',
  updatedOn: null,
  isDeleted: false,
  statesCount: 4,
};
const browser = await chromium.launch({ channel: 'chrome' }),
  results = [];

async function setup({
  language = 'en',
  width = 1440,
  denied = false,
  initiallyForbidden = false,
  failNegotiation = false,
  hubDenied = 0,
} = {}) {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width, height: 1000 },
    reducedMotion: 'reduce',
  });
  await context.addCookies(
    Object.entries({
      i18next: language,
      currentMode: language === 'ar' ? 'dark' : 'light',
      themePalette: 'green',
    }).map(([name, value]) => ({ name, value, url: origin })),
  );
  const state = {
      row: { ...fixture },
      reads: 0,
      details: 0,
      tokens: 0,
      sessions: 0,
      negotiations: 0,
      writes: 0,
      allowed: !initiallyForbidden,
      denied,
      failNegotiation,
      delay: false,
      release: null,
      sockets: [],
      closes: 0,
      events: 0,
    },
    errors = [];
  await context.route(api + '/**', async (route) => {
    try {
      const req = route.request(),
        url = new URL(req.url()),
        p = url.pathname;
      let status = 200,
        body;
      if (p === '/hubs/company/negotiate') {
        state.negotiations++;
        if (hubDenied) {
          status = hubDenied;
          body = {};
        } else if (state.failNegotiation) {
          state.failNegotiation = false;
          status = 503;
          body = {};
        } else
          body = {
            negotiateVersion: 1,
            connectionId: String(state.negotiations),
            connectionToken: 'fixture-' + state.negotiations,
            availableTransports: [{ transport: 'WebSockets', transferFormats: ['Text', 'Binary'] }],
          };
      } else {
        assert.equal(
          req.headers().authorization,
          undefined,
          'Browser API remains Cookie authenticated',
        );
        if (p.endsWith('/realtime-token')) {
          state.tokens++;
          status = state.denied ? 403 : 200;
          body = state.denied ? {} : { token: 'ephemeral-fixture-token' };
        } else if (p.endsWith('/csrf')) body = { requestToken: 'synthetic-realtime-csrf' };
        else if (p.endsWith('/session') || p.endsWith('/refresh')) {
          state.sessions++;
          body = {
            isAuthenticated: true,
            user: {
              ...sessionFixture,
              roles: ['super_admin'],
              permissions: state.allowed
                ? ['Countries:View', 'Countries:Create', 'Countries:Edit']
                : [],
            },
          };
        } else if (p.endsWith('/runtime'))
          body = { catalogVersion: version, revision: 0, overrides: [] };
        else if (p.endsWith('/modules/accessible')) body = [];
        else if (p === '/api/v1/countries') {
          assert.equal(req.method(), 'GET');
          state.reads++;
          if (state.delay)
            await new Promise((resolve) => {
              state.release = resolve;
            });
          const number = Number(url.searchParams.get('pageNumber') ?? 1),
            size = Number(url.searchParams.get('pageSize') ?? 10);
          body = {
            items: [state.row],
            metaData: {
              currentPage: number,
              pageNumber: number,
              pageSize: size,
              totalCount: 1,
              totalPages: 1,
              hasPrev: false,
              hasNext: false,
            },
          };
        } else if (p === '/api/v1/countries/1') {
          state.details++;
          const { statesCount, ...detail } = state.row;
          body = detail;
        } else {
          if (req.method() !== 'GET') state.writes++;
          throw new Error('Unexpected API ' + req.method() + ' ' + p);
        }
      }
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    } catch (error) {
      if (!/closed|handled|Interception|not found/i.test(String(error))) errors.push(String(error));
    }
  });
  await context.routeWebSocket(
    (url) => url.origin === api.replace('https:', 'wss:') && url.pathname === '/hubs/company',
    (ws) => {
      ws.onMessage((message) => {
        for (const part of String(message).split('\x1e').filter(Boolean)) {
          const data = JSON.parse(part);
          if (data.protocol === 'json') {
            ws.send('{}\x1e');
            state.sockets.push(ws);
          }
        }
      });
      ws.onClose(() => {
        state.closes++;
      });
    },
  );
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__countryReadTransitions = [];
    let previous;
    new MutationObserver(() => {
      const current = document.querySelector('[data-testid=countries]')?.getAttribute('data-kind');
      if (current && current !== previous) {
        window.__countryReadTransitions.push({ kind: current, at: performance.now() });
        previous = current;
      }
    }).observe(document, { attributes: true, childList: true, subtree: true });
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('dialog', async (dialog) => {
    errors.push('Native dialog ' + dialog.type());
    await dialog.dismiss();
  });
  await page.goto(origin + '/dev/countries');
  const region = page.getByTestId('countries'),
    text = core[language],
    local = countries[language];
  await expect(region).toHaveAttribute('data-kind', initiallyForbidden ? 'forbidden' : 'ready', {
    timeout: 60000,
  });
  if (!initiallyForbidden && !denied && !hubDenied) {
    await expect.poll(() => state.sockets.length).toBe(1);
    await expect.poll(() => state.reads).toBeGreaterThanOrEqual(2);
    await expect(region).toHaveAttribute('data-kind', 'ready');
  }
  const send = (target = 'ReceiveEntityChanged', payload, sameId) => {
    state.events++;
    state.sockets.at(-1).send(
      JSON.stringify({
        type: 1,
        target,
        arguments: [
          payload ?? {
            eventId: '00000000-0000-4000-8000-' + String(sameId ?? state.events).padStart(12, '0'),
            occurredAtUtc: '2026-10-31T12:00:00.0000000Z',
            resource: 'countries',
            action: 'updated',
            entityId: '1',
          },
        ],
      }) + '\x1e',
    );
  };
  async function pick(id) {
    const header = page.locator('erp-page-header'),
      direct = header.locator(`[data-view=${id}] button`);
    if ((await direct.count()) && (await direct.isVisible())) await direct.click();
    else {
      await header.getByRole('button', { name: text['navigation.moreViews'], exact: true }).click();
      await page
        .locator('.overflow-views')
        .getByRole('button', { name: text['views.' + id], exact: true })
        .click();
    }
  }
  return { context, page, state, errors, region, text, local, send, pick };
}

try {
  for (const language of ['en', 'ar'])
    for (const width of [390, 1440]) {
      const f = await setup({ language, width }),
        { context, page, state, errors, region, text, local, send, pick } = f;
      const opening = await page.evaluate(() => window.__countryReadTransitions);
      assert.equal(
        opening.filter((item) => item.kind === 'loading').length,
        1,
        'Opening/reconciliation must not clear the grid for a second loader',
      );
      const row = page.locator('[data-collection-row]').first();
      await row.evaluate((element) => {
        element.dataset.realtimeProof = 'retained';
        element.focus({ preventScroll: true });
      });
      let before = state.reads;
      state.row = { ...state.row, nameAr: 'دولة محدثة', nameEn: 'Remote country' };
      for (let i = 0; i < 15; i++) send();
      send('ReceiveEntityChanged', { invalid: true });
      send('ReceiveEntityChanged', {
        eventId: '00000000-0000-4000-8000-999999999999',
        occurredAtUtc: '2026-10-31T00:00:00Z',
        resource: 'states',
        action: 'updated',
        entityId: '1',
      });
      await expect(region).toContainText('Remote country');
      assert.equal(state.reads, before + 1);
      await expect(row).toHaveAttribute('data-realtime-proof', 'retained');
      await expect(row).toBeFocused();
      before = state.reads;
      send('ReceiveEntityChanged', undefined, 1); // duplicate from the burst
      // A later independent mutation while a snapshot is pending must retain one trailing read.
      state.delay = true;
      send();
      await expect.poll(() => state.reads).toBe(before + 1);
      send();
      send();
      await page.waitForTimeout(300);
      assert.equal(state.reads, before + 1);
      await expect(region).toHaveAttribute('data-kind', 'ready');
      await expect(region).toContainText('Remote country');
      state.delay = false;
      state.release();
      await expect.poll(() => state.reads).toBe(before + 2);
      await expect(region).toHaveAttribute('data-kind', 'ready');
      state.row = { ...state.row, nameAr: 'بعد إعادة الاتصال', nameEn: 'Reconnected country' };
      before = state.reads;
      await state.sockets.at(-1).close({ code: 1001, reason: 'fixture offline' });
      await expect.poll(() => state.sockets.length).toBe(2);
      await expect(region).toContainText('Reconnected country');
      assert.equal(state.reads, before + 1);
      assert.ok(state.tokens >= 2);
      // A dirty create form is not reconstructed or dismissed by a remote hint.
      await page
        .locator('erp-page-header')
        .getByRole('button', { name: local['countries.add'], exact: true })
        .click();
      const editor = page.getByRole('dialog', { name: local['countries.add'], exact: true }),
        name = editor.getByRole('textbox', { name: text['general.nameEn'], exact: true });
      await expect(name).toBeVisible();
      await name.fill('Keep my draft');
      before = state.reads;
      send();
      await expect.poll(() => state.reads).toBe(before + 1);
      await expect(name).toHaveValue('Keep my draft');
      await expect(page.getByRole('dialog')).toHaveCount(1);
      await editor
        .getByRole('button', { name: text['actions.cancel'], exact: true })
        .last()
        .click();
      await page
        .getByRole('dialog')
        .getByRole('button', { name: text['messages.discardChanges'], exact: true })
        .click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await pick('import');
      const view = page.locator('erp-country-import-view');
      const book = utils.book_new();
      utils.book_append_sheet(
        book,
        utils.aoa_to_sheet([
          ['nameAr', 'nameEn', 'alpha2Code', 'alpha3Code', 'phoneCode', 'currencyCode'],
          ['مسودة', 'Import draft', '', '', '', ''],
        ]),
        'Import',
      );
      await view.locator('input[type=file]').setInputFiles({
        name: 'draft.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: Buffer.from(write(book, { type: 'buffer', bookType: 'xlsx' })),
      });
      await expect(view.getByTestId('import-preview')).toBeVisible();
      before = state.reads;
      send();
      await expect.poll(() => state.reads).toBe(before + 1);
      await expect(view).toContainText('Import draft');
      assert.equal(state.writes, 0);
      // Explicit revocation uses the canonical session barrier and disposes the hub.
      state.allowed = false;
      const sessions = state.sessions;
      send('ReceiveTokenRevoked', 'fixture-revoked');
      await expect.poll(() => state.sessions).toBeGreaterThan(sessions);
      await expect(region).toHaveAttribute('data-kind', 'forbidden');
      await expect(view).toHaveCount(0);
      const tokens = state.tokens;
      await page.waitForTimeout(1200);
      assert.equal(state.tokens, tokens);
      assert.ok(state.closes >= 1);
      assert.deepEqual(errors, []);
      await expect(
        page
          .getByRole('alert', { name: text['authorization.forbidden.title'], exact: true })
          .getByRole('heading'),
      ).toBeInViewport({ ratio: 1 });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      await page.screenshot({
        path: path.join(output, `${language}-${width}.png`),
        fullPage: true,
      });
      results.push({
        language,
        width,
        opening,
        oneOpeningLoader: true,
        remoteBurst: true,
        pendingTrailingRead: true,
        reconnect: true,
        editorDraft: true,
        importDraft: true,
        revocation: true,
        passed: true,
      });
      await context.close();
      console.log(`Realtime browser passed ${language}/${width}`);
    }
  for (const scenario of ['forbidden', 'token-denied', 'initial-retry', 'hub401', 'hub403']) {
    const { context, state, errors } = await setup({
      initiallyForbidden: scenario === 'forbidden',
      denied: scenario === 'token-denied',
      failNegotiation: scenario === 'initial-retry',
      hubDenied: scenario.startsWith('hub') ? Number(scenario.slice(3)) : 0,
    });
    if (scenario === 'forbidden') {
      assert.equal(state.tokens, 0);
      assert.equal(state.reads, 0);
    }
    if (scenario === 'token-denied') {
      await expect.poll(() => state.tokens).toBe(1);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      assert.equal(state.tokens, 1);
      assert.equal(state.sockets.length, 0);
    }
    if (scenario === 'initial-retry') assert.equal(state.negotiations, 2);
    if (scenario.startsWith('hub')) {
      await expect.poll(() => state.negotiations).toBe(1);
      const sessions = state.sessions;
      await new Promise((resolve) => setTimeout(resolve, 2200));
      assert.equal(state.negotiations, 1);
      assert.equal(state.sessions, sessions);
      assert.equal(state.sockets.length, 0);
    }
    assert.equal(state.writes, 0);
    assert.deepEqual(errors, []);
    results.push({ scenario, passed: true });
    await context.close();
    console.log('Realtime browser passed ' + scenario);
  }
  fs.writeFileSync(
    path.join(output, 'results.json'),
    JSON.stringify({ date: new Date().toISOString(), results }, null, 2),
  );
  console.log(`Countries realtime ${results.length} browser cases passed.`);
} finally {
  await browser.close();
}

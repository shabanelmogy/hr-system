import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { utils, write, read } from 'xlsx';
import { chromium, expect } from '@playwright/test';
import { themePaletteOrder } from '@app/tokens';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
const root = path.resolve(import.meta.dirname, '..'),
  origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220',
  api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(root, '../.codex-tmp/angular-country-import');
fs.mkdirSync(output, { recursive: true });
const core = JSON.parse(
    fs.readFileSync(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
  ),
  country = JSON.parse(
    fs.readFileSync(path.join(root, 'src/locales/generated/reference-countries.json'), 'utf8'),
  );
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const headers = ['nameAr', 'nameEn', 'alpha2Code', 'alpha3Code', 'phoneCode', 'currencyCode'],
  mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
export function workbook(rows, header = headers, formula = false) {
  const book = utils.book_new(),
    sheet = utils.aoa_to_sheet([header, ...rows]);
  if (formula) sheet.A2 = { t: 'n', v: 2, f: '1+1' };
  utils.book_append_sheet(book, sheet, 'Import');
  return Buffer.from(write(book, { type: 'buffer', bookType: 'xlsx', compression: true }));
}
const valid = Array.from({ length: 12 }, (_, i) => [
  'دولة ' + (i + 1),
  'Country ' + (i + 1),
  '',
  '',
  '',
  '',
]);
const mixed = workbook([
  ...valid,
  ['دولة مكررة', 'Country 1', '', '', '', ''],
  ['', 'Invalid', '', '', '', ''],
]);
const focused = process.argv.includes('--focused'),
  compact = process.argv.includes('--compact'),
  smoke = process.argv.includes('--smoke'),
  journeys = process.argv.includes('--journeys'),
  browser = await chromium.launch({ channel: 'chrome' }),
  results = [];
async function setup({
  language = 'en',
  mode = 'light',
  width = 1440,
  palette = 'green',
  action = 'success',
  permitted = true,
  readOnly = false,
} = {}) {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width, height: width === 390 ? 780 : 1050 },
    reducedMotion: 'reduce',
    acceptDownloads: true,
  });
  await context.addCookies(
    Object.entries({ i18next: language, currentMode: mode, themePalette: palette }).map(
      ([name, value]) => ({ name, value, url: origin }),
    ),
  );
  const state = { posts: [], reads: 0, action, permitted, readOnly, sessions: 0 },
    errors = [];
  await context.route(api + '/api/**', async (route) => {
    try {
      const req = route.request(),
        url = new URL(req.url()),
        p = url.pathname;
      let status = 200,
        body;
      assert.equal(req.headers().authorization, undefined);
      if (p.endsWith('/realtime-token')) {
        status = 403;
        body = {};
      } // Realtime has its own negotiated browser suite.
      else if (p.endsWith('/csrf')) body = { requestToken: 'synthetic-import-csrf' };
      else if (p.endsWith('/session') || p.endsWith('/refresh')) {
        state.sessions++;
        body = {
          isAuthenticated: true,
          user: {
            ...sessionFixture,
            firstName: 'Fixture',
            lastName: 'Import',
            roles: ['super_admin'],
            permissions: ['Countries:View', ...(state.permitted ? ['Countries:Create'] : [])],
            tenantReadOnly: state.readOnly,
          },
        };
      } else if (p.endsWith('/runtime'))
        body = { catalogVersion: version, revision: 0, overrides: [] };
      else if (p.endsWith('/modules/accessible')) body = [];
      else if (p === '/api/v1/countries/bulk') {
        assert.equal(req.method(), 'POST');
        assert.equal(req.headers()['x-erp-xsrf'], 'synthetic-import-csrf');
        const payload = req.postDataJSON();
        assert.deepEqual(Object.keys(payload), ['countries']);
        assert.ok(payload.countries.length > 0 && payload.countries.length <= 100);
        state.posts.push(payload);
        if (state.action === 'delay') await new Promise((resolve) => (state.release = resolve));
        if (state.action === 'network') {
          await route.abort('failed');
          return;
        }
        status =
          state.action === 'duplicate'
            ? 409
            : state.action === 'denied'
              ? 403
              : state.action === 'server'
                ? 503
                : state.action === 'field'
                  ? 400
                  : 201;
        body =
          state.action === 'malformed'
            ? { createdCount: 0 }
            : status === 409
              ? { errors: { 'Country.Duplicated': ['private server details'] } }
              : status === 400
                ? {
                    errors: {
                      'Countries[0].NameEn': [
                        'This name is reserved. Choose another country name.',
                      ],
                    },
                  }
                : status === 201
                  ? { createdCount: payload.countries.length }
                  : {};
      } else if (p === '/api/v1/countries') {
        state.reads++;
        const page = Number(url.searchParams.get('pageNumber') ?? 1),
          size = Number(url.searchParams.get('pageSize') ?? 10);
        body = {
          items: [],
          metaData: {
            currentPage: page,
            pageNumber: page,
            pageSize: size,
            totalCount: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      } else throw Error('Unexpected import API ' + p);
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    } catch (error) {
      if (!/closed|handled|Interception|not found/i.test(String(error))) errors.push(String(error));
    }
  });
  const p = await context.newPage();
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('dialog', async (d) => {
    errors.push('Native dialog ' + d.type());
    await d.dismiss();
  });
  await p.goto(origin + '/dev/countries');
  await expect(p.getByTestId('countries')).toHaveAttribute('data-kind', 'ready', {
    timeout: 60000,
  });
  const text = core[language],
    header = p.locator('erp-page-header'),
    view = p.locator('erp-country-import-view');
  async function pick(id) {
    const direct = header.locator(`[data-view=${id}] button`);
    if ((await direct.count()) && (await direct.isVisible())) await direct.click();
    else {
      await header.getByRole('button', { name: text['navigation.moreViews'], exact: true }).click();
      await p
        .locator('.overflow-views')
        .getByRole('button', { name: text['views.' + id], exact: true })
        .click();
    }
  }
  const select = async (buffer = mixed, name = 'countries.xlsx') => {
    await view
      .locator('input[type=file]')
      .setInputFiles({ name, mimeType: name.endsWith('.xlsx') ? mime : 'text/plain', buffer });
  };
  const submit = () => view.getByTestId('import-submit').getByRole('button').click(),
    clear = () => view.getByTestId('import-clear').getByRole('button').click();
  return { p, context, state, errors, view, pick, select, submit, clear, text };
}
try {
  if (!focused && !journeys)
    for (const palette of smoke || compact ? ['green'] : themePaletteOrder)
      for (const mode of smoke ? ['light'] : ['light', 'dark'])
        for (const language of smoke ? ['en'] : ['en', 'ar'])
          for (const width of smoke ? [1440] : [390, 1440]) {
            const f = await setup({ palette, mode, language, width });
            const { p, view, state, pick, select, submit, context, errors, text } = f;
            await pick('import');
            await expect(view).toBeVisible();
            const heading = view.locator('.import-heading');
            const actionButtons = heading.getByRole('button');
            await expect(actionButtons).toHaveCount(4);
            await expect(view.locator('.requirements')).not.toHaveAttribute('open');
            if (compact) {
              await view.locator('.requirements summary').click();
              await expect(view.locator('.requirements-content')).toBeVisible();
              await view.locator('.requirements summary').click();
            }
            await expect(view.locator('p-fileupload')).toHaveCount(1);
            const downloaded = p.waitForEvent('download');
            await view.getByTestId('import-template').getByRole('button').click();
            const download = await downloaded;
            assert.equal(download.suggestedFilename(), 'countries-import-template.xlsx');
            const book = read(fs.readFileSync(await download.path()));
            assert.deepEqual(utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1 }), [
              headers,
            ]);
            await select();
            await expect(view.getByTestId('import-preview')).toBeVisible();
            assert.equal(state.posts.length, 0);
            const preview = view.getByTestId('import-preview');
            await expect(preview.locator('tbody tr')).toHaveCount(10);
            const size = preview.locator('erp-collection-footer [role=combobox]');
            if (await size.count()) {
              await size.click();
              await p.getByRole('option', { name: '25', exact: true }).click();
              await expect(preview.locator('tbody tr')).toHaveCount(14);
            }
            await submit();
            await expect(view).toContainText(
              country[language]['countries.import.importSuccess'].replace('{{count}}', '12'),
            );
            assert.equal(state.posts.length, 1);
            assert.equal(state.posts[0].countries.length, 12);
            assert.ok(
              state.posts[0].countries.every((row) => row.nameAr && row.nameEn !== 'Invalid'),
            );
            await expect(view).toContainText(
              country[language]['countries.import.duplicateField'].replace('{{row}}', '2'),
            );
            await expect(view).toContainText(country[language]['countries.import.errors.required']);
            const measured = await view.evaluate((element) => {
              const rail = element.querySelector('.status-summary').getBoundingClientRect();
              const railStyle = getComputedStyle(element.querySelector('.status-summary'));
              const preview = element.querySelector('.preview').getBoundingClientRect();
              const card = element
                .querySelector('erp-surface-card > section')
                .getBoundingClientRect();
              const tableBody = element
                .querySelector('.p-datatable-table-container')
                .getBoundingClientRect();
              const title = element.querySelector('.import-heading h2').getBoundingClientRect();
              const buttons = [...element.querySelectorAll('.header-actions button')].map(
                (button) => button.getBoundingClientRect(),
              );
              const cards = [...element.querySelectorAll('.status-summary erp-metric-card')].map(
                (card) => card.getBoundingClientRect(),
              );
              const rtl = getComputedStyle(element).direction === 'rtl';
              const verificationLabel = [
                ...element.querySelectorAll('.status-summary header > span:first-child'),
              ].find((label) => label.textContent.toLowerCase().includes('verification'));
              let verificationFits = true;
              if (verificationLabel?.firstChild) {
                const range = document.createRange();
                const text = verificationLabel.textContent;
                range.setStart(
                  verificationLabel.firstChild,
                  text.toLowerCase().indexOf('verification'),
                );
                range.setEnd(verificationLabel.firstChild, text.length);
                verificationFits = range.getClientRects().length === 1;
              }
              return {
                railAtEnd: rtl ? rail.right <= preview.left + 1 : rail.left >= preview.right - 1,
                vertical: cards.every((card, i) => i === 0 || card.top >= cards[i - 1].bottom),
                compactCards: cards.every((card) => card.height <= 72),
                headerSingleRow: buttons.every(
                  (button) =>
                    Math.abs(button.y + button.height / 2 - title.y - title.height / 2) <= 4,
                ),
                actionsAtEnd: rtl
                  ? buttons.every((button) => button.right <= title.left)
                  : buttons.every((button) => button.left >= title.right),
                mobilePreviewFirst: preview.bottom <= rail.top,
                previewTop: preview.top,
                cardBottom: card.bottom,
                viewportHeight: innerHeight,
                bodyHeight: tableBody.height,
                verificationFits,
                separator: Number.parseFloat(
                  innerWidth > 899 ? railStyle.borderInlineStartWidth : railStyle.borderTopWidth,
                ),
              };
            });
            assert.ok(measured.vertical && measured.compactCards, JSON.stringify(measured));
            assert.ok(measured.bodyHeight >= 65, JSON.stringify(measured));
            assert.ok(
              Math.abs(measured.cardBottom - measured.viewportHeight) <= 32,
              JSON.stringify(measured),
            );
            assert.equal(measured.separator, 1);
            assert.ok(measured.verificationFits, JSON.stringify(measured));
            if (width > 899) {
              assert.ok(
                measured.railAtEnd && measured.headerSingleRow && measured.actionsAtEnd,
                JSON.stringify(measured),
              );
              assert.ok(measured.previewTop < 450, JSON.stringify(measured));
            } else assert.ok(measured.mobilePreviewFirst, JSON.stringify(measured));
            await expect(view.getByTestId('import-submit').getByRole('button')).toBeDisabled();
            assert.equal(state.posts.length, 1);
            await expect(view.locator('p-fileupload button')).toBeEnabled();
            assert.equal(
              await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
              true,
            );
            assert.deepEqual(errors, []);
            await p
              .locator('.workspace-scroll p-scrollarea-viewport')
              .evaluate((e) => (e.scrollTop = 0));
            if (palette === 'green')
              await p.screenshot({
                path: path.join(output, `${language}-${mode}-${width}-result.png`),
                fullPage: true,
              });
            results.push({
              palette,
              mode,
              language,
              width,
              template: true,
              valid: 12,
              invalid: 2,
              measured,
              oneBatch: true,
              passed: true,
            });
            await context.close();
            console.log(`Import passed ${palette}/${mode}/${language}/${width}`);
          }
  if (focused) {
    for (const action of [
      'duplicate',
      'field',
      'denied',
      'server',
      'network',
      'malformed',
      'delay',
    ]) {
      const f = await setup({ action }),
        { p, view, state, pick, select, submit, clear, text, context, errors } = f;
      await pick('import');
      await select(workbook([valid[0]]));
      await submit();
      if (action === 'delay') {
        await expect.poll(() => state.posts.length).toBe(1);
        await expect(view.getByTestId('import-clear').getByRole('button')).toBeDisabled();
        await expect(view.locator('p-fileupload button')).toBeDisabled();
        await pick('cards');
        await expect(view).toBeVisible();
        state.release();
        await expect(view).toContainText('1 countries uploaded');
      } else if (action === 'denied') {
        await expect(view.getByRole('alert')).toBeVisible();
        await expect(view.getByTestId('import-preview')).toHaveCount(0);
      } else {
        await expect(view).toContainText(
          action === 'duplicate'
            ? country.en['countries.import.duplicateOnServer']
            : action === 'field'
              ? 'This name is reserved. Choose another country name.'
              : text['imports.submissionUncertain'],
        );
        await expect(view.getByTestId('import-submit').getByRole('button')).toBeDisabled();
        assert.equal(state.posts.length, 1);
        if (!['duplicate', 'field'].includes(action)) {
          await expect(view.locator('p-fileupload button')).toBeDisabled();
          await view
            .getByRole('button', { name: text['imports.reviewRecords'], exact: true })
            .click();
          await expect(view).toHaveCount(0);
        }
      }
      assert.deepEqual(errors, []);
      results.push({ action, passed: true });
      await context.close();
    }
    for (const scenario of [
      'extension',
      'headers',
      'formula',
      'limit',
      'empty',
      'zip',
      'no-create',
      'read-only',
      'discard',
    ]) {
      const f = await setup({
          permitted: scenario !== 'no-create',
          readOnly: scenario === 'read-only',
        }),
        { p, view, state, pick, select, clear, context, errors, text } = f;
      if (scenario === 'no-create' || scenario === 'read-only') {
        const direct = p.locator('erp-page-header [data-view=import]');
        await expect(direct).toHaveCount(0);
      } else {
        await pick('import');
        let bytes = mixed,
          name = 'countries.xlsx',
          key;
        if (scenario === 'extension') {
          name = 'bad.txt';
          key = 'unsupportedExtension';
        }
        if (scenario === 'headers') {
          bytes = workbook([valid[0]], ['wrong', ...headers.slice(1)]);
          key = 'invalidHeaders';
        }
        if (scenario === 'formula') {
          bytes = workbook([valid[0]], headers, true);
          key = 'formulaNotAllowed';
        }
        if (scenario === 'limit') {
          bytes = workbook(Array.from({ length: 101 }, () => valid[0]));
          key = 'rowLimitExceeded';
        }
        if (scenario === 'empty') {
          bytes = workbook([]);
          key = 'emptyFile';
        }
        if (scenario === 'zip') {
          bytes = Buffer.from('fake xlsx');
          key = 'invalidWorkbook';
        }
        await select(bytes, name);
        if (scenario === 'discard') {
          await expect(view.getByTestId('import-preview')).toBeVisible();
          await clear();
          const dialog = p.getByRole('dialog');
          await expect(dialog).toBeVisible();
          await dialog
            .getByRole('button', { name: text['actions.cancel'], exact: true })
            .last()
            .click();
          await expect(view.getByTestId('import-preview')).toBeVisible();
        } else
          await expect(view).toContainText(
            core.en['imports.errors.' + key]
              .replace('{{maxRows}}', '100')
              .replace('{{expectedHeaders}}', headers.join(', ')),
          );
      }
      assert.equal(state.posts.length, 0);
      assert.deepEqual(errors, []);
      results.push({ scenario, passed: true });
      await context.close();
    }
  }
  if (journeys)
    for (const scenario of [
      'file-replacement',
      'view-discard',
      'permission-revocation',
      'pending-permission-revocation',
      'keyboard-paging',
    ]) {
      const f = await setup({
          action: scenario === 'pending-permission-revocation' ? 'delay' : 'success',
        }),
        { p, view, state, pick, select, submit, text, context, errors } = f;
      await pick('import');
      await select();
      const preview = view.getByTestId('import-preview');
      await expect(preview.locator('tbody tr')).toHaveCount(10);
      const answer = async (accepted) => {
        const dialog = p.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog
          .getByRole('button', {
            name: text[accepted ? 'messages.discardChanges' : 'actions.cancel'],
            exact: true,
          })
          .last()
          .click();
        await expect(dialog).toHaveCount(0);
      };
      if (scenario === 'file-replacement') {
        await select(workbook([valid[0]]), 'replacement.xlsx');
        await answer(false);
        await expect(view).toContainText('countries.xlsx');
        await expect(preview.locator('tbody tr')).toHaveCount(10);
        await select(workbook([valid[0]]), 'replacement.xlsx');
        await answer(true);
        await expect(view).toContainText('replacement.xlsx');
        await expect(preview.locator('tbody tr')).toHaveCount(1);
      } else if (scenario === 'view-discard') {
        await pick('cards');
        await answer(false);
        await expect(preview).toBeVisible();
        await pick('cards');
        await answer(true);
        await expect(view).toHaveCount(0);
        await pick('import');
        await expect(view.getByTestId('import-preview')).toHaveCount(0);
      } else if (scenario === 'keyboard-paging') {
        const size = preview.locator('erp-collection-footer [role=combobox]');
        await size.focus();
        await size.press('ArrowDown');
        await size.press('End');
        await size.press('Enter');
        await expect(preview.locator('tbody tr')).toHaveCount(14);
        await size.focus();
        await size.press('ArrowDown');
        await size.press('Home');
        await size.press('Enter');
        await expect(preview.locator('tbody tr')).toHaveCount(5);
        const next = preview
          .locator('erp-collection-footer')
          .getByRole('button', { name: text['pagination.next'], exact: true });
        await next.focus();
        await next.press('Enter');
        await expect(preview.locator('tbody tr').first().locator('td').first()).toHaveText('7');
      } else {
        if (scenario === 'pending-permission-revocation') {
          await submit();
          await expect.poll(() => state.posts.length).toBe(1);
        }
        const previousSessions = state.sessions;
        state.permitted = false;
        await p.evaluate(() => window.dispatchEvent(new Event('focus')));
        await expect.poll(() => state.sessions).toBeGreaterThan(previousSessions);
        await expect(view).toHaveCount(0);
        if (state.release) {
          state.release();
          await p.evaluate(
            () =>
              new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
          );
          await expect(p.getByText('12 countries uploaded', { exact: true })).toHaveCount(0);
        }
      }
      assert.equal(state.posts.length, scenario === 'pending-permission-revocation' ? 1 : 0);
      assert.deepEqual(errors, []);
      results.push({ scenario, passed: true });
      await context.close();
      console.log(`Import journey passed ${scenario}`);
    }
  fs.writeFileSync(
    path.join(
      output,
      journeys ? 'journey-results.json' : focused ? 'focused-results.json' : 'results.json',
    ),
    JSON.stringify({ date: new Date().toISOString(), results }, null, 2),
  );
  console.log(`Countries Import ${results.length} browser cases passed.`);
} finally {
  await browser.close();
}

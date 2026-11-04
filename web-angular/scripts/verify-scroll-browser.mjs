import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { themePaletteOrder } from '@app/tokens';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

const root = path.resolve(import.meta.dirname, '..'),
  origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220',
  api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(root, '../.codex-tmp/angular-scroll');
fs.mkdirSync(output, { recursive: true });
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const catalog = [
  {
    code: 'reference-data',
    name: 'ReferenceData',
    isDefault: true,
    submodules: [
      { code: 'addresses', name: 'Addresses', entryPath: null, requiredPermissions: [] },
    ],
  },
  {
    code: 'hr',
    name: 'HR',
    isDefault: true,
    submodules: [{ code: 'basic-data', name: 'Basic', entryPath: null, requiredPermissions: [] }],
  },
  {
    code: 'acc',
    name: 'Accounting',
    isDefault: false,
    submodules: [
      { code: 'ledger-setup', name: 'Ledger', entryPath: null, requiredPermissions: [] },
    ],
  },
];
const browser = await chromium.launch({ channel: 'chrome' }),
  results = [],
  focused = process.argv.includes('--focused');

async function setup({ palette = 'green', mode = 'light', language = 'en', width = 1440 } = {}) {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width, height: 320 },
    reducedMotion: 'reduce',
  });
  await context.addCookies(
    Object.entries({ themePalette: palette, currentMode: mode, i18next: language }).map(
      ([name, value]) => ({ name, value, url: origin }),
    ),
  );
  const errors = [];
  await context.route(api + '/**', async (route) => {
    const p = new URL(route.request().url()).pathname;
    let body;
    if (p.endsWith('/csrf')) body = { requestToken: 'synthetic-scroll-csrf' };
    else if (p.endsWith('/session') || p.endsWith('/refresh'))
      body = { isAuthenticated: true, user: sessionFixture };
    else if (p.endsWith('/runtime')) body = { catalogVersion: version, revision: 0, overrides: [] };
    else if (p.endsWith('/modules/accessible')) body = catalog;
    else {
      errors.push('Unexpected API ' + p);
      await route.fulfill({ status: 503, body: '{}' });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(origin + '/apps');
  try {
    await expect(page.locator('.launcher-tile')).toHaveCount(3, { timeout: 20000 });
  } catch (error) {
    console.log(
      JSON.stringify({
        url: page.url(),
        errors,
        body: (await page.locator('body').innerText()).slice(0, 1500),
      }),
    );
    await page.screenshot({ path: path.join(output, 'setup-failure.png') });
    throw error;
  }
  return { page, context, errors };
}
async function nativeStyle(locator) {
  return locator.evaluate((element) => {
    const thumb = getComputedStyle(element, '::-webkit-scrollbar-thumb'),
      bar = getComputedStyle(element, '::-webkit-scrollbar');
    return {
      radius: thumb.borderRadius,
      color: thumb.backgroundColor,
      width: bar.width,
      height: bar.height,
      border: thumb.borderTopWidth,
    };
  });
}
try {
  for (const palette of focused ? [] : themePaletteOrder)
    for (const mode of ['light', 'dark'])
      for (const language of ['en', 'ar'])
        for (const width of [390, 1440]) {
          const { page, context, errors } = await setup({ palette, mode, language, width });
          const colors = await page.evaluate(() => {
            const probe = document.createElement('span');
            probe.style.display = 'none';
            document.body.append(probe);
            const colors = ['--erp-scrollbar-thumb', '--erp-scrollbar-thumb-hover'].map((token) => {
              probe.style.backgroundColor = 'var(' + token + ')';
              return getComputedStyle(probe).backgroundColor;
            });
            probe.remove();
            return colors;
          });
          const viewport = page.locator('.workspace-scroll p-scrollarea-viewport'),
            track = page.locator('.workspace-scroll p-scrollarea-scrollbar'),
            handle = track.locator('p-scrollarea-handle');
          await expect
            .poll(() => viewport.evaluate((e) => e.scrollHeight > e.clientHeight))
            .toBe(true);
          await expect(track).toBeVisible();
          const nativeViewport = await viewport.evaluate((e) => ({
            width: getComputedStyle(e).scrollbarWidth,
            display: getComputedStyle(e, '::-webkit-scrollbar').display,
          }));
          assert.ok(
            nativeViewport.width === 'none' || nativeViewport.display === 'none',
            'PrimeNG retains its hidden browser scrollbar',
          );
          const style = await handle.evaluate((e) => ({
            radius: getComputedStyle(e).borderRadius,
            color: getComputedStyle(e).backgroundColor,
            width: e.getBoundingClientRect().width,
            duration: getComputedStyle(e).transitionDuration,
          }));
          assert.equal(style.radius, '999px');
          assert.equal(style.width, 10);
          assert.equal(style.duration, '0s');
          assert.notEqual(style.color, 'rgba(0, 0, 0, 0)');
          const area = await viewport.boundingBox(),
            bar = await track.boundingBox();
          assert.ok(language === 'ar' ? bar.x < area.x + 12 : bar.x > area.x + area.width - 16);
          await viewport.hover();
          await page.mouse.wheel(0, 180);
          await expect.poll(() => viewport.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
          await viewport.focus();
          await page.keyboard.press('Home');
          await expect.poll(() => viewport.evaluate((e) => e.scrollTop)).toBe(0);
          await page.keyboard.press('PageDown');
          await expect.poll(() => viewport.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
          if (palette === 'green') {
            await page.keyboard.press('Home');
            await expect.poll(() => viewport.evaluate((e) => e.scrollTop)).toBe(0);
            const thumb = await handle.boundingBox();
            await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2);
            await page.mouse.down();
            await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2 + 35, {
              steps: 5,
            });
            await page.mouse.up();
            await expect.poll(() => viewport.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
          }
          // New ordinary containers require neither a feature class nor a JS scroll wrapper.
          await page.evaluate(() => {
            const panel = document.createElement('div');
            panel.id = 'global-scroll-proof';
            panel.tabIndex = 0;
            panel.style.cssText =
              'position:fixed;inset:80px auto auto 20px;width:240px;height:120px;overflow:scroll;background:var(--surface);z-index:9999';
            const content = document.createElement('div');
            content.style.cssText = 'width:700px;height:600px';
            panel.append(content);
            document.body.append(panel);
            const textarea = document.createElement('textarea');
            textarea.id = 'textarea-scroll-proof';
            textarea.value = Array.from({ length: 30 }, () => 'Synthetic shared scrolling').join(
              '\n',
            );
            textarea.style.cssText =
              'position:fixed;inset:80px auto auto 280px;width:180px;height:100px;z-index:9999';
            document.body.append(textarea);
          });
          await page.mouse.move(0, 0);
          const ordinary = page.locator('#global-scroll-proof'),
            ordinaryStyle = await nativeStyle(ordinary),
            textareaStyle = await nativeStyle(page.locator('#textarea-scroll-proof'));
          assert.equal(ordinaryStyle.width, '10px');
          assert.equal(ordinaryStyle.height, '10px');
          assert.equal(ordinaryStyle.radius, '999px');
          assert.equal(ordinaryStyle.border, '2px');
          for (const actual of [
            ordinaryStyle.color,
            textareaStyle.color,
            (await nativeStyle(page.locator('html'))).color,
            style.color,
          ])
            assert.ok(colors.includes(actual), 'All surfaces use the shared resting/hover colors');
          for (const key of ['width', 'height', 'radius', 'border'])
            assert.equal(textareaStyle[key], ordinaryStyle[key]);
          await ordinary.hover();
          await page.mouse.wheel(0, 100);
          await expect.poll(() => ordinary.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
          await ordinary.evaluate(
            (e) => (e.scrollLeft = document.documentElement.dir === 'rtl' ? -100 : 100),
          );
          assert.ok(Math.abs(await ordinary.evaluate((e) => e.scrollLeft)) > 0);
          await page
            .locator('#global-scroll-proof, #textarea-scroll-proof')
            .evaluateAll((nodes) => nodes.forEach((node) => node.remove()));
          // A real PrimeNG overlay is appended to body and gets the same global style.
          await page.locator('erp-module-context [role=combobox]').click();
          const list = page.locator('.p-select-list-container');
          await expect(list).toBeVisible();
          await page.mouse.move(0, 0);
          assert.ok(colors.includes((await nativeStyle(list)).color));
          await page.keyboard.press('Escape');
          if (palette === 'green')
            await page.screenshot({
              path: path.join(output, `${mode}-${language}-${width}.png`),
              fullPage: true,
            });
          await page.setViewportSize({ width, height: 1200 });
          await expect(track).toBeHidden();
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            true,
          );
          assert.deepEqual(errors, []);
          results.push({
            palette,
            mode,
            language,
            width,
            style,
            ordinaryStyle,
            wheel: true,
            keyboard: true,
            drag: palette === 'green',
            overlay: true,
            textarea: true,
            horizontal: true,
            resize: true,
            passed: true,
          });
          await context.close();
          console.log(`Global scroll passed ${palette}/${mode}/${language}/${width}`);
        }
  if (focused)
    for (const language of ['en', 'ar'])
      for (const width of [390, 1440]) {
        const { page, context, errors } = await setup({ language, width });
        await page.setViewportSize({ width, height: 780 });
        await page.goto(origin + '/dev/collections');
        await expect(page.locator('[data-collection-row]')).toHaveCount(10);
        const grid = page.locator('.p-datatable-table-container');
        assert.equal((await nativeStyle(grid)).width, '10px');
        if (await grid.evaluate((e) => e.scrollWidth > e.clientWidth)) {
          await grid.evaluate(
            (e) => (e.scrollLeft = document.documentElement.dir === 'rtl' ? -100 : 100),
          );
          assert.ok(Math.abs(await grid.evaluate((e) => e.scrollLeft)) > 0);
        }
        const size = page.locator('erp-collection-footer [role=combobox]');
        await size.focus();
        await size.press('ArrowDown');
        await size.press('End');
        await size.press('Enter');
        await expect(page.locator('[data-collection-row]')).toHaveCount(37);
        await page.goto(origin + '/dev/form-close');
        await page.getByTestId('long').getByRole('button').click();
        await page.getByTestId('nested').getByRole('button').click();
        const dialog = page.locator('.p-dialog-content');
        await expect(dialog).toBeVisible();
        assert.equal((await nativeStyle(dialog)).width, '10px');
        await expect.poll(() => dialog.evaluate((e) => e.scrollHeight > e.clientHeight)).toBe(true);
        await dialog.hover();
        await page.mouse.wheel(0, 240);
        await expect.poll(() => dialog.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
        await page.screenshot({
          path: path.join(output, `dialog-${language}-${width}.png`),
          fullPage: true,
        });
        await page.goto(origin + '/dev/multiline');
        const textarea = page.getByTestId('multiline').locator('textarea');
        await textarea.fill(Array.from({ length: 20 }, () => 'Row').join('\n'));
        assert.equal((await nativeStyle(textarea)).width, '10px');
        await textarea.evaluate((e) => (e.scrollTop = 0));
        await textarea.hover();
        await page.mouse.wheel(0, 180);
        await expect.poll(() => textarea.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
        assert.deepEqual(errors, []);
        results.push({
          language,
          width,
          grid: true,
          horizontal: true,
          keyboardPaging: true,
          dialog: true,
          sharedTextarea: true,
          passed: true,
        });
        await context.close();
        console.log(`Global scroll focused passed ${language}/${width}`);
      }
  if (!focused)
    for (const language of ['en', 'ar']) {
      const { page, context, errors } = await setup({ language });
      await page.emulateMedia({ forcedColors: 'active' });
      await expect
        .poll(() =>
          page
            .locator('.workspace-scroll p-scrollarea-handle')
            .evaluate((e) => getComputedStyle(e).backgroundColor),
        )
        .not.toBe('rgba(0, 0, 0, 0)');
      assert.deepEqual(errors, []);
      results.push({ language, forcedColors: true, passed: true });
      await context.close();
    }
  fs.writeFileSync(
    path.join(output, focused ? 'focused-results.json' : 'results.json'),
    JSON.stringify({ date: new Date().toISOString(), results }, null, 2),
  );
  console.log(`Global scrollbar ${results.length} browser cases passed.`);
} finally {
  await browser.close();
}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { getTheme, parseHex, themePaletteOrder } from '@app/tokens';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(app, '../.codex-tmp/angular-theme');
fs.mkdirSync(output, { recursive: true });
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4210';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const rgb = color => `rgb(${parseHex(color).join(', ')})`;
const results = [];
try {
  for (const palette of themePaletteOrder) for (const mode of ['light', 'dark']) for (const language of ['en', 'ar']) for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, ignoreHTTPSErrors: true });
    await context.addCookies(Object.entries({ themePalette: palette, currentMode: mode, i18next: language }).map(([name, value]) => ({ name, value, url: origin })));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/dev/theme');
    await page.getByTestId('primary').getByRole('button').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => document.fonts.load('700 16px "IBM Plex Sans Arabic"'));
    const expected = getTheme(palette, mode).colors;
    await page.waitForFunction(background => getComputedStyle(document.body).backgroundColor === background, rgb(expected.background));
    const actual = await page.evaluate(() => {
      const style = id => getComputedStyle(document.querySelector(`[data-testid="${id}"] button`));
      const primary = document.querySelector('[data-testid="primary"] button');
      return {
        background: getComputedStyle(document.body).backgroundColor,
        foreground: getComputedStyle(document.body).color,
        primaryImage: style('primary').backgroundImage, primaryText: style('primary').color,
        success: style('success').backgroundColor, warning: style('warning').backgroundColor,
        danger: style('danger').backgroundColor, info: style('info').backgroundColor,
        font: getComputedStyle(primary).fontFamily,
        labelWeight: getComputedStyle(primary.querySelector('span[pbuttonlabel]')).fontWeight,
        height: primary.getBoundingClientRect().height,
        direction: document.documentElement.dir, language: document.documentElement.lang,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
        fontLoaded: document.fonts.check('16px "IBM Plex Sans Arabic"'),
      };
    });
    const label = `${palette}/${mode}/${language}/${width}`;
    assert.equal(actual.foreground, rgb(expected.foreground), label + ' foreground');
    assert.ok(actual.primaryImage.includes(rgb(expected.primary)), label + ' primary mapping');
    assert.equal(actual.primaryText, rgb(expected.primaryForeground), label + ' primary contrast text');
    for (const status of ['success', 'warning', 'info']) assert.equal(actual[status], rgb(expected[status]), label + ' ' + status);
    assert.equal(actual.danger, rgb(expected.destructive), label + ' destructive');
    assert.equal(actual.direction, language === 'ar' ? 'rtl' : 'ltr', label + ' direction');
    assert.equal(actual.language, language, label + ' language');
    assert.ok(actual.height >= 44, label + ' minimum target');
    assert.ok(actual.font.includes('IBM Plex Sans Arabic') && actual.fontLoaded, label + ' self-hosted font');
    assert.equal(actual.labelWeight, '700', label + ' reference action label weight');
    assert.equal(actual.overflow, false, label + ' overflow');
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => {
      const element = document.activeElement;
      const css = getComputedStyle(element);
      return { tag: element.tagName, outline: css.outlineStyle, width: css.outlineWidth };
    });
    assert.equal(focus.tag, 'BUTTON', label + ' native tab stop');
    assert.equal(focus.outline, 'solid', label + ' keyboard focus');
    assert.equal(focus.width, '2px', label + ' keyboard ring');
    const notice = await page.getByText(/invalid primeui license|license (key|notice)|unlicensed/i).count();
    assert.deepEqual(errors, [], label + ' browser exceptions');
    results.push({ palette, mode, language, width, ...actual, licenseNoticeElements: notice });
    if (palette === 'green' && ((language === 'en' && mode === 'light' && width === 1440) || (language === 'ar' && mode === 'dark' && width === 390))) {
      await page.screenshot({ path: path.join(output, `${language}-${mode}-${width}.png`), fullPage: true });
    }
    await context.close();
  }
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage(); await page.goto(origin + '/dev/theme');
  await page.locator('erp-button[data-palette="blue"] button').click();
  assert.equal(await page.locator('[data-testid="preferences"] button[aria-pressed="true"]').count(), 1);
  await page.getByTestId('mode').getByRole('button').focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  await page.keyboard.press('Space');
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  await page.getByTestId('mode').getByRole('button').click();
  await page.getByTestId('language').getByRole('button').click();
  await page.reload(); await page.getByTestId('primary').getByRole('button').waitFor();
  assert.deepEqual(await page.evaluate(() => [document.documentElement.dataset.palette, document.documentElement.dataset.theme, document.documentElement.dir]), ['blue', 'dark', 'rtl']);
  await context.close();
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ date: new Date().toISOString(), matrixPassed: results.length,
    preferenceReloadPassed: true, licenseKeyConfigured: Boolean(process.env.PRIMEUI_LICENSE_KEY?.trim()), results }, null, 2));
  process.stdout.write(`Browser theme/action matrix passed: ${results.length} combinations, native focus, font, geometry and preference reload.\n`);
} finally { await browser.close(); }

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import { getTheme, parseHex, themePaletteOrder } from '@app/tokens';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(app, '../.codex-tmp/angular-forms'); fs.mkdirSync(output, { recursive: true });
const core = JSON.parse(fs.readFileSync(path.join(app, 'src/locales/generated/core.json'), 'utf8'));
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4210';
const rgb = value => `rgb(${parseHex(value).join(', ')})`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const palette of themePaletteOrder) for (const mode of ['light', 'dark']) for (const language of ['en', 'ar']) for (const width of [390, 1440]) {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width, height: 1000 } });
    await context.addCookies(Object.entries({ themePalette: palette, currentMode: mode, i18next: language }).map(([name, value]) => ({ name, value, url: origin })));
    const page = await context.newPage(); const errors = []; let dialogs = 0;
    page.on('pageerror', error => errors.push(error.message)); page.on('dialog', async dialog => { dialogs++; await dialog.dismiss(); });
    await page.goto(origin + '/dev/forms');
    const access = page.getByTestId('access'); const email = page.getByTestId('email').locator('input');
    const password = page.getByTestId('password').locator('input');
    await email.waitFor(); await page.evaluate(() => document.fonts.ready);
    const submit = access.locator('button[type=submit]');
    assert.equal(await submit.isDisabled(), false);
    assert.equal(await access.locator('form').evaluate(form => form.noValidate), true);
    await submit.click(); await page.waitForFunction(() => document.activeElement?.getAttribute('type') === 'email');
    await expect(access.locator('.error')).toHaveCount(2);
    await expect(access.locator('.error-summary a')).toHaveCount(2);
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(access.locator('.error').first()).toHaveText(core[language]['validation.required']);
    await access.locator('.error-summary a').nth(1).click();
    assert.equal(await password.evaluate(input => input === document.activeElement), true);
    await email.fill('invalid'); await password.fill('abcdefgh'); await email.focus(); await submit.click();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('email').locator('.error')).toHaveText(core[language]['validation.invalidEmail']);
    const reveal = page.getByTestId('password').getByRole('button', { name: core[language]['showPassword'], exact: true });
    await reveal.click(); await expect(password).toHaveAttribute('type', 'text');
    assert.equal(await password.inputValue(), 'abcdefgh');
    const geometry = await page.getByTestId('password').evaluate(host => {
      const input = host.querySelector('input').getBoundingClientRect();
      const buttons = [...host.querySelectorAll('button')].map(element => element.getBoundingClientRect());
      return { height: input.height, width: input.width, overlap: buttons.some(button => input.left < button.right - 1 && input.right > button.left + 1),
        errorBelow: [...document.querySelectorAll('erp-text-field')].every(field => {
          const error = field.querySelector('.error'); return !error || error.getBoundingClientRect().top >= field.querySelector('.input-row').getBoundingClientRect().bottom;
        }) };
    });
    assert.ok(geometry.height >= 44 && geometry.width > 80 && !geometry.overlap && geometry.errorBelow);
    const clearEmail = page.getByTestId('email').getByRole('button', { name: core[language]['general.clear'], exact: true });
    await clearEmail.click(); await expect(email).toHaveValue('');
    await email.fill('fixture@example.test');
    await submit.click(); await expect(page.getByTestId('saved')).toHaveText('1');
    await expect(submit).toBeDisabled();
    await access.locator('form').evaluate(form => { form.dispatchEvent(new Event('submit', { cancelable: true })); });
    assert.equal(await page.getByTestId('saved').textContent(), '1');
    await page.getByTestId('reset').getByRole('button').click();
    await expect(email).toHaveValue(''); await expect(password).toHaveValue('');
    await expect(submit).toBeEnabled(); await expect(access.locator('.error')).toHaveCount(0);
    await page.getByTestId('server-error').getByRole('button').click();
    await expect(page.getByTestId('name').locator('.error')).toHaveText(core[language]['validation.required']);
    await page.getByTestId('async-patch').getByRole('button').click();
    await page.waitForFunction(() => document.querySelector('[data-testid="name"] input').value === 'Asynchronous fixture');
    await expect(page.getByTestId('name').locator('.error')).toHaveCount(0);
    // Verify translated, focusable controls remain usable after an in-place language switch.
    await page.getByTestId('language').getByRole('button').click();
    await page.waitForFunction(expected => document.documentElement.dir === expected, language === 'ar' ? 'ltr' : 'rtl');
    const actual = await page.evaluate(() => ({ background: getComputedStyle(document.body).backgroundColor,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      errorColor: getComputedStyle(document.querySelector('[data-testid="access"] input')).color }));
    assert.equal(actual.background, rgb(getTheme(palette, mode).colors.background));
    assert.equal(actual.overflow, false); assert.equal(dialogs, 0); assert.deepEqual(errors, []);
    results.push({ palette, mode, language, width, geometry, noNativeDialogs: true, asyncPatch: true, serverFieldError: true, duplicateSaveBlocked: true });
    if (palette === 'green' && ((mode === 'light' && language === 'en' && width === 1440) || (mode === 'dark' && language === 'ar' && width === 390))) {
      await page.getByTestId('language').getByRole('button').click();
      await submit.click(); await access.locator('.error').first().waitFor();
      await page.screenshot({ path: path.join(output, `${language}-${mode}-${width}.png`), fullPage: true });
    }
    await context.close();
  }
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ date: new Date().toISOString(), matrixPassed: results.length, results }, null, 2));
  process.stdout.write(`Shared form browser matrix passed: ${results.length} combinations; validation/focus/clear/reveal/reset/async/server errors/duplicate submit and RTL.\n`);
} finally { await browser.close(); }

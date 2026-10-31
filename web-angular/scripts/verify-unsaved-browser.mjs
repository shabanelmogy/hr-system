import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import { themePaletteOrder } from '@app/tokens';
const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(app, '../.codex-tmp/angular-unsaved'); fs.mkdirSync(output, { recursive: true });
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const resources = JSON.parse(fs.readFileSync(path.join(app, 'src/locales/generated/core.json'), 'utf8'));
const browser = await chromium.launch({ channel: 'chrome', headless: true }); const results = [];
try {
  for (const palette of (process.argv.includes('--focused') ? ['green'] : themePaletteOrder)) for (const mode of ['light', 'dark']) for (const language of ['en', 'ar']) for (const width of [390, 1440]) {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    await context.addCookies(Object.entries({ themePalette: palette, currentMode: mode, i18next: language }).map(([name, value]) => ({ name, value, url: origin })));
    const page = await context.newPage(), errors = [], requests = []; let native = 0;
    page.on('pageerror', error => errors.push(error.message)); page.on('request', request => { if (request.url().includes('/api/')) requests.push(request.url()); });
    page.on('dialog', async dialog => { native++; await dialog.dismiss(); });
    const core = resources[language], name = page.getByTestId('name').locator('input'), state = page.getByTestId('unsaved-state');
    const dialog = page.getByRole('dialog', { name: core['messages.unsavedChangesTitle'], exact: true });
    const keep = dialog.locator('.dialog-actions').getByRole('button', { name: core['actions.cancel'], exact: true });
    const discard = dialog.getByRole('button', { name: core['messages.discardChanges'], exact: true });
    await page.goto(origin + '/dev/unsaved/1'); await expect(name).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    await name.fill('Draft fixture'); await page.getByTestId('query').click();
    await expect(page).toHaveURL(/\/dev\/unsaved\/1\?q=next#section$/); await expect(dialog).toHaveCount(0); await expect(name).toHaveValue('Draft fixture');
    await page.getByTestId('leave').click(); await expect(dialog).toBeVisible(); await expect(keep).toBeFocused();
    const box = await dialog.boundingBox(); assert.ok(box.x >= -1 && box.x + box.width <= width + 1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await keep.click(); await expect(dialog).toHaveCount(0); await expect(name).toHaveValue('Draft fixture');
    await expect(state).toHaveAttribute('data-alive', '1'); await expect(state).toHaveAttribute('data-stopped', '0'); await expect(page.getByTestId('leave')).toBeFocused();
    if (palette === 'green') {
      await page.getByTestId('busy').getByRole('button').click(); await page.getByTestId('record').click();
      await expect(page).toHaveURL(/\/dev\/unsaved\/1\?q=next#section$/); await expect(dialog).toHaveCount(0);
      await page.getByTestId('busy').getByRole('button').click();
      await page.getByTestId('denied').click(); await expect(dialog).toBeVisible(); await discard.click();
      await expect(dialog).toHaveCount(0); await expect(name).toHaveValue('Draft fixture'); await expect(state).toHaveAttribute('data-stopped', '0');
      await page.getByTestId('arm-change').getByRole('button').click(); await page.getByTestId('record').click(); await expect(dialog).toBeVisible();
      await expect(name).toHaveValue('Revised fixture'); await expect(dialog).toHaveCount(0); await expect(state).toHaveAttribute('data-record', '1');
      await page.getByTestId('record').click(); await expect(dialog).toBeVisible();
      await page.screenshot({ path: path.join(output, `${mode}-${language}-${width}-prompt.png`), fullPage: true, animations: 'disabled' });
      await keep.press('Escape'); await expect(dialog).toHaveCount(0); await expect(name).toHaveValue('Revised fixture');
      await page.getByTestId('matrix').click(); await expect(dialog).toBeVisible(); await discard.click();
      await expect(page).toHaveURL(/\/dev\/unsaved\/1;mode=edit$/); await expect(name).toHaveValue('');
      // Browser history: canceled traversal restores committed URL and retains the editor.
      await name.fill('History fixture'); await page.goBack(); await expect(dialog).toBeVisible(); await keep.click();
      await expect(page).toHaveURL(/\/dev\/unsaved\/1;mode=edit$/); await expect(name).toHaveValue('History fixture');
      await page.goBack(); await expect(dialog).toBeVisible(); await discard.click();
      await expect(page).toHaveURL(/\/dev\/unsaved\/1\?q=next#section$/); await expect(name).toHaveValue('');
      await name.fill('Forward fixture'); await page.goForward(); await expect(dialog).toBeVisible(); await keep.click();
      await expect(page).toHaveURL(/\/dev\/unsaved\/1\?q=next#section$/); await expect(name).toHaveValue('Forward fixture');
      await page.goForward(); await expect(dialog).toBeVisible(); await discard.click();
      await expect(page).toHaveURL(/\/dev\/unsaved\/1;mode=edit$/); await expect(name).toHaveValue('');
      await name.fill('Final fixture'); await page.getByTestId('leave').click(); await expect(dialog).toBeVisible(); await discard.click();
      await expect(page.getByTestId('destination')).toHaveAttribute('data-alive', '0');
      await expect(page.getByTestId('destination')).toHaveAttribute('data-stopped', '1');
    }
    assert.deepEqual(errors, []); assert.deepEqual(requests, []); assert.equal(native, 0);
    results.push({ palette, mode, language, width, passed: true }); fs.writeFileSync(path.join(output, 'progress.json'), JSON.stringify(results, null, 2));
    console.log(`Passed ${palette}/${mode}/${language}/${width}`); await context.close();
  }
  fs.writeFileSync(path.join(output, process.argv.includes('--focused') ? 'focused-results.json' : 'results.json'), JSON.stringify(results, null, 2));
  console.log(`Unsaved transitions: ${results.length} cases;8 complete route/history/dirty/busy/stale/denied-target/lifetime flows passed.`);
} finally { await browser.close(); }

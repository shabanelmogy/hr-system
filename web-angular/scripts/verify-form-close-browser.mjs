import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import { themePaletteOrder } from '@app/tokens';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(app, '../.codex-tmp/angular-form-close'); fs.mkdirSync(output, { recursive: true });
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const resources = JSON.parse(fs.readFileSync(path.join(app, 'src/locales/generated/core.json'), 'utf8'));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const palette of (process.argv.includes('--focused') ? ['green'] : themePaletteOrder))
    for (const mode of ['light', 'dark']) for (const language of ['en', 'ar']) for (const width of [390, 1440]) {
      const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width, height: 950 }, reducedMotion: 'reduce' });
      await context.addCookies(Object.entries({ themePalette: palette, currentMode: mode, i18next: language }).map(([name, value]) => ({ name, value, url: origin })));
      const page = await context.newPage(), errors = [], api = []; let nativeDialogs = 0;
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => { if (request.url().includes('/api/')) api.push(request.url()); });
      page.on('dialog', async dialog => { nativeDialogs++; await dialog.dismiss(); });
      const core = resources[language], state = page.getByTestId('state');
      const tool = key => page.getByTestId(key).getByRole('button');
      const form = page.getByTestId('editor'), name = page.getByTestId('name').locator('input');
      const close = () => tool('close').click();
      const prompt = () => page.getByRole('dialog', { name: core['messages.unsavedChangesTitle'], exact: true });
      const keep = () => prompt().locator('.dialog-actions').getByRole('button', { name: core['actions.cancel'], exact: true });
      const discard = () => prompt().getByRole('button', { name: core['messages.discardChanges'], exact: true });
      const reopen = async () => { await tool('reopen').click(); await expect(state).toHaveAttribute('data-active', 'true'); await expect(state).toHaveAttribute('data-dirty', 'false'); };
      await page.goto(origin + '/dev/form-close'); await expect(name).toBeVisible(); await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
      await close(); await expect(state).toHaveAttribute('data-active', 'false'); await expect(state).toHaveAttribute('data-closed', '1');
      await reopen(); await name.fill('Technical draft'); await expect(state).toHaveAttribute('data-dirty', 'true');
      await close(); await expect(prompt()).toBeVisible(); await expect(keep()).toBeFocused();
      const geometry = await prompt().evaluate(dialog => {
        const box = dialog.getBoundingClientRect(), footer = dialog.querySelector('.p-dialog-footer')?.getBoundingClientRect();
        const label = dialog.getAttribute('aria-labelledby');
        return { x: box.x, y: box.y, width: box.width, height: box.height, footerBottom: footer?.bottom,
          labelled: !!label && !!document.getElementById(label), pageWidth: document.documentElement.scrollWidth, viewportHeight: innerHeight };
      });
      assert.ok(geometry.labelled); assert.ok(geometry.x >= -1 && geometry.x + geometry.width <= width + 1);
      assert.ok(geometry.y >= -1 && geometry.footerBottom <= geometry.viewportHeight + 1); assert.ok(geometry.pageWidth <= width + 1);
      await keep().click(); await expect(prompt()).toHaveCount(0); await expect(name).toHaveValue('Technical draft'); await expect(tool('close')).toBeFocused();
      if (palette === 'green') {
        // Invalid Save remains available; validation uses the existing form shell.
        await reopen(); await form.locator('button[type=submit]').click(); await expect(form.locator('.error-summary a')).toHaveCount(2);
        await expect(name).toBeFocused(); await expect(form.locator('button[type=submit]')).toBeEnabled();
        await name.fill('Technical draft'); await page.getByTestId('reference').getByRole('combobox').click();
        await page.getByRole('option', { name: '0 · A', exact: true }).click();
        await close(); await expect(keep()).toBeFocused();
        await page.screenshot({ path: path.join(output, `${mode}-${language}-${width}-discard.png`), fullPage: true, animations: 'disabled' });
        await keep().press('Escape'); await expect(prompt()).toHaveCount(0); await expect(tool('close')).toBeFocused();
        await close();
        for (let i = 0; i < 5; i++) { await page.keyboard.press('Tab'); assert.equal(await prompt().evaluate(dialog => dialog.contains(document.activeElement)), true); }
        await discard().click(); await expect(state).toHaveAttribute('data-active', 'false');

        await reopen(); await name.fill('Revision draft'); const revision = Number(await state.getAttribute('data-revision'));
        await tool('arm-revision').click(); await close(); await expect(prompt()).toBeVisible();
        await expect(state).toHaveAttribute('data-revision', String(revision + 1)); await expect(prompt()).toHaveCount(0);
        await expect(state).toHaveAttribute('data-active', 'true'); await expect(name).toHaveValue('Revised fixture');
        await tool('arm-owner').click(); await close(); await expect(prompt()).toBeVisible();
        const owner = await state.getAttribute('data-owner'); await expect(state).not.toHaveAttribute('data-owner', owner);
        await expect(prompt()).toHaveCount(0); await expect(name).toHaveValue('');
        await name.fill('Pending draft'); await tool('arm-pending').click(); await close(); await expect(prompt()).toBeVisible();
        await expect(state).toHaveAttribute('data-pending', 'true'); await expect(prompt()).toHaveCount(0); await expect(tool('close')).toBeDisabled();
        await tool('pending').click();

        // Failed save retains the draft; accepted save resets the caller-owned baseline.
        await page.getByTestId('reference').getByRole('combobox').click(); await page.getByRole('option', { name: '0 · A', exact: true }).click();
        await tool('fail').click(); await form.locator('button[type=submit]').click();
        await expect(state).toHaveAttribute('data-pending', 'true'); await expect(tool('close')).toBeDisabled();
        await expect(form.locator('.form-feedback')).toHaveText(core['common.error']); await expect(state).toHaveAttribute('data-dirty', 'true');
        await name.fill('Accepted draft'); await tool('fail').click(); await form.locator('button[type=submit]').click();
        await expect(state).toHaveAttribute('data-saved', '1'); await expect(state).toHaveAttribute('data-dirty', 'false');
        await close(); await expect(state).toHaveAttribute('data-active', 'false');

        // Nested modal and long content: the confirmation stays above the editor.
        await reopen(); await name.fill('Nested draft'); await tool('long').click(); await tool('nested').click();
        const editorDialog = page.getByRole('dialog', { name: core['general.profile'], exact: true }); await expect(editorDialog).toBeVisible();
        await tool('close').scrollIntoViewIfNeeded(); await close(); await expect(prompt()).toBeVisible(); await expect(keep()).toBeFocused();
        const nested = await page.getByRole('dialog').evaluateAll(dialogs => dialogs.map(dialog => ({ z: Number(getComputedStyle(dialog).zIndex), height: dialog.getBoundingClientRect().height, scroll: dialog.querySelector('.p-dialog-content')?.scrollHeight })));
        assert.equal(nested.length, 2); assert.ok(nested[1].z > nested[0].z); assert.ok(nested.every(item => item.height <= 950));
        await keep().press('Escape'); await expect(prompt()).toHaveCount(0); await expect(tool('close')).toBeFocused();
        await expect(editorDialog).toBeVisible(); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await page.screenshot({ path: path.join(output, `${mode}-${language}-${width}-nested.png`), fullPage: true, animations: 'disabled' });
        await close(); await discard().click(); await expect(page.getByRole('dialog')).toHaveCount(0);
      }
      assert.deepEqual(errors, []); assert.deepEqual(api, []); assert.equal(nativeDialogs, 0);
      results.push({ palette, mode, language, width, geometry, passed: true });
      fs.writeFileSync(path.join(output, 'progress.json'), JSON.stringify(results, null, 2));
      console.log(`Passed ${palette}/${mode}/${language}/${width}`); await context.close();
    }
  fs.writeFileSync(path.join(output, process.argv.includes('--focused') ? 'focused-results.json' : 'results.json'), JSON.stringify(results, null, 2));
  console.log(`Form close: ${results.length} palette/mode/language/viewport cases;8 complete validation/consent/race/save/nested flows passed.`);
} finally { await browser.close(); }

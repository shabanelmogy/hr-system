import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { serveAngularFixtureBuild } from './angular-build-browser-fixture.mjs';

const root = path.resolve(import.meta.dirname, '..');
const origin = 'https://localhost:4210';
const output = path.resolve(
  process.env.FIELD_FOCUS_ARTIFACTS ?? path.join(root, '../.codex-tmp/field-focus-2026-11-09'),
);
const resources = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/platform-tenants.json'), 'utf8'),
);
const version = (
  await fs.readFile(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
).match(/[a-f0-9]{64}/)[0];
const smoke = process.argv.includes('--smoke');
const controlsOnly = process.argv.includes('--controls');
const cases = ['en', 'ar'].flatMap((language) =>
  ['light', 'dark'].flatMap((mode) => [390, 1440].map((width) => ({ language, mode, width }))),
);
const results = [];
await fs.mkdir(output, { recursive: true });

// Check the actual painted outline bounds against every clipping ancestor. A
// focus ring outside the control can disappear even when the input itself fits.
async function inspectFocus(input) {
  await input.scrollIntoViewIfNeeded();
  await input.focus();
  await expect(input).toBeFocused();
  await input.evaluate((element) =>
    element.closest('.input-row, .reference-control, .boolean-control').scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: 'instant',
    }),
  );
  return input.evaluate((element) => {
    const control = element.closest('.input-row, .reference-control, .boolean-control');
    const style = getComputedStyle(control);
    const box = control.getBoundingClientRect();
    const outside = Math.max(0, parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset));
    const clippedBy = [];
    for (let parent = control.parentElement; parent; parent = parent.parentElement) {
      const css = getComputedStyle(parent);
      const bounds = parent.getBoundingClientRect();
      const clips = (value) => ['hidden', 'clip', 'auto', 'scroll'].includes(value);
      const left = bounds.left + parent.clientLeft;
      const top = bounds.top + parent.clientTop;
      if (
        (clips(css.overflowX) &&
          (box.left - outside < left - 0.5 ||
            box.right + outside > left + parent.clientWidth + 0.5)) ||
        (clips(css.overflowY) &&
          box.height <= parent.clientHeight &&
          (box.top - outside < top - 0.5 || box.bottom + outside > top + parent.clientHeight + 0.5))
      ) {
        clippedBy.push({
          parent: parent.tagName + '.' + parent.className,
          box: box.toJSON(),
          bounds: bounds.toJSON(),
          outside,
        });
      }
    }
    return {
      outlineWidth: parseFloat(style.outlineWidth),
      outlineColor: style.outlineColor,
      outlineStyle: style.outlineStyle,
      borderColor: style.borderColor,
      outside,
      clippedBy,
      width: box.width,
      height: box.height,
    };
  });
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const scenario of smoke ? cases.slice(0, 1) : cases) {
    const { language, mode, width } = scenario;
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width, height: 844 },
      reducedMotion: 'reduce',
    });
    const errors = [];
    try {
      await serveAngularFixtureBuild(
        context,
        root,
        origin,
        process.env.ANGULAR_FIXTURE_BUILD
          ? path.resolve(process.env.ANGULAR_FIXTURE_BUILD)
          : undefined,
      );
      await context.addCookies(
        Object.entries({ i18next: language, currentMode: mode, themePalette: 'green' }).map(
          ([name, value]) => ({ name, value, url: origin }),
        ),
      );
      await context.route('**/api/**', async (route) => {
        const endpoint = new URL(route.request().url()).pathname;
        let body;
        let status = 200;
        if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh')) {
          body = { isAuthenticated: true, user: { ...sessionFixture, roles: ['super_admin'] } };
        } else if (endpoint.endsWith('/runtime')) {
          body = { catalogVersion: version, revision: 0, overrides: [] };
        } else if (endpoint.endsWith('/csrf')) {
          body = { requestToken: 'focus-fixture-csrf' };
        } else if (
          endpoint.endsWith('/modules/accessible') ||
          endpoint.endsWith('/modules/tenant-entitlements')
        ) {
          body = [];
        } else if (endpoint.endsWith('/realtime-token')) {
          status = 403;
          body = {};
        } else {
          errors.push('Unexpected API request: ' + endpoint);
          return route.abort();
        }
        return route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
      });
      const page = await context.newPage();
      page.on('pageerror', (error) => errors.push(error.message));
      if (controlsOnly) {
        const controls = [];
        for (const [route, selector] of [
          ['/dev/references', '[data-testid=finite] [role=combobox]'],
          ['/dev/numbers', '[data-testid=decimal] input'],
          ['/dev/dates', '[data-testid=start] input'],
          ['/dev/multiline', '[data-testid=floating] textarea'],
          ['/dev/booleans', '[data-testid=checkbox] input'],
          ['/dev/booleans', '[data-testid=switch] input'],
        ]) {
          await page.goto(origin + route);
          const control = page.locator(selector);
          await expect(control).toBeAttached();
          const focus = await inspectFocus(control);
          assert.ok(focus.outlineWidth >= 2 && focus.outlineStyle === 'solid', selector);
          assert.deepEqual(focus.clippedBy, [], selector + ': complete focus perimeter');
          controls.push({ route, selector, focus });
        }
        assert.deepEqual(errors, []);
        results.push({ ...scenario, controls, passed: true });
        console.log(`Shared control focus perimeter passed ${language}/${mode}/${width}`);
        continue;
      }
      await page.goto(origin + '/super-admin/tenants/new');
      const editor = page.locator('erp-tenant-editor-page');
      const captions = resources[language];
      const text = (key) => captions['tenantManagement.' + key];
      const contact = editor.getByRole('textbox', { name: text('contactName'), exact: true });
      const notes = editor.getByRole('textbox', { name: text('notes'), exact: true });
      await expect(contact).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await contact.fill('Example');
      const contactFocus = await inspectFocus(contact);
      await page.screenshot({
        path: path.join(output, `${language}-${mode}-${width}-contact.png`),
      });
      const notesFocus = await inspectFocus(notes);
      await notes.fill('Line one\nLine two');
      await page.screenshot({ path: path.join(output, `${language}-${mode}-${width}-notes.png`) });
      const enabledFocus = await inspectFocus(editor.locator('erp-boolean-field input'));
      for (const [name, focus] of Object.entries({
        contact: contactFocus,
        notes: notesFocus,
        enabled: enabledFocus,
      })) {
        assert.ok(
          focus.outlineWidth >= 2 && focus.outlineStyle === 'solid',
          name + ': visible focus',
        );
        assert.deepEqual(focus.clippedBy, [], name + ': focus perimeter must not be clipped');
      }
      // Re-enter through the keyboard and retain focus when the shared clear
      // action removes the value. Neither operation may alter control geometry.
      await contact.focus();
      await contact.press('Tab');
      const clear = contact.locator('..').locator('.field-action');
      await expect(clear).toBeFocused();
      await clear.press('Enter');
      await expect(contact).toBeFocused();
      await expect(contact).toHaveValue('');
      const clearedFocus = await inspectFocus(contact);
      assert.deepEqual(clearedFocus.clippedBy, []);
      assert.equal(clearedFocus.height, contactFocus.height);
      assert.equal(clearedFocus.width, contactFocus.width);
      const identifier = editor.locator('erp-tenant-identity-fields erp-text-field input').first();
      await editor.locator('erp-form form button[type=submit]').click();
      await expect(identifier).toHaveAttribute('aria-invalid', 'true');
      const invalidFocus = await inspectFocus(identifier);
      const errorColor = await identifier
        .locator('..')
        .locator('..')
        .locator('.error')
        .evaluate((element) => getComputedStyle(element).color);
      assert.equal(invalidFocus.outlineColor, errorColor, 'Invalid focus keeps error color');
      assert.equal(invalidFocus.borderColor, errorColor);
      assert.deepEqual(invalidFocus.clippedBy, []);
      assert.deepEqual(errors, []);
      results.push({
        ...scenario,
        contactFocus,
        notesFocus,
        enabledFocus,
        clearedFocus,
        invalidFocus,
        passed: true,
      });
      console.log(`Field focus perimeter and keyboard clear passed ${language}/${mode}/${width}`);
    } catch (error) {
      results.push({ ...scenario, passed: false, error: String(error), errors });
      throw error;
    } finally {
      await context.close();
      await fs.writeFile(
        path.join(output, 'results.json'),
        JSON.stringify(results, null, 2) + '\n',
      );
    }
  }
} finally {
  await browser.close();
}
console.log(
  JSON.stringify({ cases: results.length, failures: results.filter((result) => !result.passed) }),
);

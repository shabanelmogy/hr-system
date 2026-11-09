import assert from 'node:assert/strict';
import { expect } from '@playwright/test';

/** Activate the same authorized command in either shared Grid presentation. */
export async function gridRowCommand(page, row, label, menuLabel) {
  const inline = row.getByRole('button', { name: label, exact: true });
  const menu = row.getByRole('button', { name: menuLabel, exact: true });
  await expect(inline.or(menu).first()).toBeVisible();
  if (await inline.isVisible()) return inline;
  await menu.click();
  return page.getByRole('menuitem', { name: label, exact: true });
}

export async function activateGridRowAction(page, row, label, menuLabel) {
  await (await gridRowCommand(page, row, label, menuLabel)).click();
}

/** Exercise native width observation and actual command dispatch, without ng/debug APIs. */
export async function verifyResponsiveGridActions(page, workspace, text) {
  const grid = workspace.locator('erp-data-table');
  const row = workspace.locator('tbody [data-collection-row]').first();
  const measurements = [];
  for (const width of [390, 590, 690, 900, 1012, 1440]) {
    await page.setViewportSize({ width, height: 823 });
    const navigation = page.locator('.drawer-toggle button');
    for (const open of width >= 900 ? [false, true] : [false]) {
      if (width >= 900 && (await navigation.getAttribute('aria-expanded')) !== String(open))
        await navigation.click();
      await page.evaluate(async () => {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        await Promise.all(
          document
            .getAnimations()
            .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
            .map((animation) => animation.finished.catch(() => {})),
        );
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      let measured;
      await expect
        .poll(async () => {
          measured = await grid.locator('.table-body').evaluate((element) => {
            const styles = getComputedStyle(element);
            const contentWidth =
              element.clientWidth -
              parseFloat(styles.paddingInlineStart) -
              parseFloat(styles.paddingInlineEnd);
            const cell = element.querySelector('tbody [data-collection-row] .action-cell');
            const inline = !!cell?.querySelector('erp-row-actions');
            const buttons = cell?.querySelectorAll('button').length ?? 0;
            return { contentWidth, inline, buttons };
          });
          return measured.contentWidth < 600
            ? !measured.inline && measured.buttons === 1
            : measured.inline && measured.buttons > 0;
        })
        .toBe(true);
      const { contentWidth } = measured;
      const compact = contentWidth < 600;
      if (width === 390 || (width === 1440 && !open)) {
        await activateGridRowAction(
          page,
          row,
          text['actions.view'],
          text['collections.rowActions'],
        );
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog.press('Escape');
        await expect(dialog).toHaveCount(0);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      measurements.push({
        width,
        navigationOpen: open,
        contentWidth,
        mode: compact ? 'menu' : 'inline',
      });
    }
  }
  assert.ok(measurements.some((entry) => entry.mode === 'menu'));
  assert.ok(measurements.some((entry) => entry.mode === 'inline'));
  return measurements;
}

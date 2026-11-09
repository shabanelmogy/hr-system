import assert from 'node:assert/strict';
import path from 'node:path';
import { expect } from '@playwright/test';

export async function verifyCountryGridLayout({
  page,
  region,
  width,
  mode,
  language,
  output,
  text,
  reads,
  results,
}) {
  const grid = region.locator('erp-data-table');
  const navigation = page.locator('.drawer-toggle button');
  for (const opened of width >= 900 ? [false, true] : [false]) {
    if ((await navigation.getAttribute('aria-expanded')) !== String(opened))
      await navigation.click();
    await expect(navigation).toHaveAttribute('aria-expanded', String(opened));
    if (width >= 900)
      await expect
        .poll(() =>
          page
            .locator('.workspace-sidebar')
            .evaluate((e) => Math.round(e.getBoundingClientRect().width)),
        )
        .toBe(opened ? 280 : 64);
    await page.screenshot({
      path: path.join(
        output,
        `grid-${mode}-${language}-${width}-${opened ? 'open' : 'closed'}.png`,
      ),
      animations: 'disabled',
    });
    const first = grid.locator('tbody [data-collection-row]').first();
    const selection = first.locator('label.grid-selection');
    await expect(selection).toBeVisible();
    const geometry = await first.evaluate((element) => {
      const selection = element.querySelector('label').getBoundingClientRect();
      const actions = [...element.querySelectorAll('.action-cell button')].map((button) =>
        button.getBoundingClientRect(),
      );
      const row = element.getBoundingClientRect();
      return {
        selection: { width: selection.width, height: selection.height },
        actions: actions.map((box) => ({ width: box.width, height: box.height })),
        rowHeight: row.height,
        touch: matchMedia('(pointer: coarse)').matches,
      };
    });
    const target = geometry.touch ? 44 : 32;
    assert.ok(
      geometry.selection.width >= target && geometry.selection.height >= target,
      JSON.stringify(geometry),
    );
    assert.ok(
      geometry.actions.every((box) => box.width >= target && box.height >= target),
      JSON.stringify(geometry),
    );
    const name = first.locator('[data-cell-column="nameEn"] .cell-text');
    await expect(name).toHaveAttribute(
      'title',
      'United Republic of Countries With a Long Official Administrative Name',
    );
    assert.ok(
      await name.evaluate(
        (element) =>
          getComputedStyle(element).textOverflow === 'ellipsis' &&
          element.clientWidth < element.scrollWidth,
      ),
    );
    const check = first.getByRole('checkbox');
    await selection.click({ position: { x: 3, y: 3 } });
    await expect(check).toBeChecked();
    await grid
      .locator('erp-collection-footer')
      .getByRole('button', { name: text['common.unselectAll'], exact: true })
      .click();
    await expect(check).not.toBeChecked();
    const all = grid.locator('thead').getByRole('checkbox');
    await all.check();
    await expect(grid.locator('tbody input[type="checkbox"]:checked')).toHaveCount(10);
    await grid
      .locator('erp-collection-footer')
      .getByRole('button', { name: text['common.unselectAll'], exact: true })
      .click();
    const scroller = grid.locator('.p-datatable-table-container');
    const actionBefore = await first.locator('.action-cell').boundingBox();
    await scroller.evaluate((element) => {
      element.scrollLeft =
        getComputedStyle(element).direction === 'rtl' ? -element.scrollWidth : element.scrollWidth;
      element.scrollTop = 150;
    });
    await expect
      .poll(async () => Math.round((await first.locator('.action-cell').boundingBox()).x))
      .toBe(Math.round(actionBefore.x));
    const sticky = await grid.locator('thead').boundingBox();
    const viewport = await scroller.boundingBox();
    assert.ok(Math.abs(sticky.y - viewport.y) <= 2, JSON.stringify({ sticky, viewport }));
    await scroller.evaluate((element) => {
      element.scrollLeft = 0;
      element.scrollTop = 0;
    });
    assert.ok(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth + 1 &&
          document.documentElement.scrollHeight <= innerHeight + 1,
      ),
    );
    await page.screenshot({
      path: path.join(
        output,
        `grid-${mode}-${language}-${width}-${opened ? 'open' : 'closed'}.png`,
      ),
      animations: 'disabled',
    });
    results.push({ mode, language, width, opened, geometry, passed: true });
    console.log(`Grid layout passed ${language}/${mode}/${width}/${opened ? 'open' : 'closed'}`);
  }
  await verifyRowMenu({ page, grid, text });
  if (width === 690 || width === 1440)
    await verifyInteractions({ page, grid, region, text, reads });
}

async function verifyRowMenu({ page, grid, text }) {
  const first = grid.locator('tbody [data-collection-row]').first();
  if (!(await first.locator('erp-row-actions').count())) {
    await first.locator('.action-cell button').click();
    const menu = page.locator('.p-contextmenu');
    await expect(
      menu.getByRole('menuitem', { name: text['actions.view'], exact: true }),
    ).toBeVisible();
    await expect(
      menu.getByRole('menuitem', { name: text['actions.archive'], exact: true }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
    console.log('Responsive row menu preserved View and Archive actions');
  }
}

async function verifyInteractions({ page, grid, region, text, reads }) {
  const first = grid.locator('tbody [data-collection-row]').first();
  await grid.getByRole('button', { name: text['actions.gridOptions'], exact: true }).click();
  const options = page.getByRole('dialog', { name: text['actions.gridOptions'], exact: true });
  await options.getByText(text['collections.compact'], { exact: true }).click();
  await expect(options.locator('.density-preview')).toHaveAttribute('data-density', 'compact');
  await options
    .locator('erp-button')
    .getByRole('button', { name: text['actions.close'], exact: true })
    .click();
  const compact = await first.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    target: element.querySelector('label').getBoundingClientRect().height,
    touch: matchMedia('(pointer: coarse)').matches,
  }));
  assert.ok(
    compact.height >= (compact.touch ? 52 : 36) && compact.target >= (compact.touch ? 44 : 32),
    JSON.stringify(compact),
  );
  const nameHeader = grid.locator('th[data-column-key="nameEn"]');
  await nameHeader.press('Enter');
  await expect.poll(() => reads.at(-1)?.sortBy).toBe('nameEn');
  await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
  await expect(region).toHaveAttribute('data-kind', 'ready');
  await expect(first.locator('[data-cell-column="nameEn"]')).toHaveText('Egypt');
  await nameHeader.locator('p-column-filter button').click();
  const filter = page.locator('.p-datatable-filter-overlay');
  await expect(filter).toBeVisible();
  const before = reads.length;
  await filter.locator('erp-grid-filter-input input').fill('Egypt');
  assert.equal(reads.length, before, 'A filter draft must not query until Apply');
  await filter.getByRole('button', { name: text['collections.apply'], exact: true }).click();
  // The service maps a single compatible string filter to the existing GET criteria.
  await expect.poll(() => reads.at(-1)?.search).toBe('Egypt');
  assert.equal(reads.at(-1)?.searchField, 'nameEn');
  await expect(region).toHaveAttribute('data-kind', 'ready');
  await expect(grid.locator('tbody [data-collection-row]')).toHaveCount(1);
  console.log('Grid menu, compact density, keyboard sorting and server filter passed');
}

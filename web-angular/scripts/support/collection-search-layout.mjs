import assert from 'node:assert/strict';
import path from 'node:path';
import { expect } from '@playwright/test';

/** Shared geometry acceptance: exercise real projected criteria, not a one-filter mock. */
export async function verifyCollectionSearchLayout(
  page,
  workspace,
  header,
  text,
  output,
  language,
  mode,
  { chart = true, structured = true, compactSearchCompanion = null } = {},
) {
  const results = [];
  const filter = header.locator('.filter button');
  if (structured) {
    await expect(filter).toHaveAttribute('aria-expanded', 'false');
    await expect(workspace.locator('.search-controls')).toHaveCount(0);
  }
  for (const kind of ['grid', 'cards']) {
    await header.locator(`[data-view=${kind}] button`).click();
    if ((await filter.getAttribute('aria-expanded')) !== 'true') await filter.click();
    for (const [width, height] of [
      [320, 720],
      [390, 844],
      [555, 823],
      [571, 823],
      [676, 823],
      [690, 823],
      [800, 823],
      [900, 640],
      [1012, 823],
      [1332, 823],
      [1440, 900],
      [844, 390],
    ]) {
      await page.setViewportSize({ width, height });
      const navigation = page.locator('.drawer-toggle button');
      for (const open of width >= 900 ? [false, true] : [false]) {
        if (width >= 900 && (await navigation.getAttribute('aria-expanded')) !== String(open))
          await navigation.click();
        await page.evaluate(async () => {
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
          await Promise.all(
            document
              .getAnimations()
              .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
              .map((animation) => animation.finished.catch(() => {})),
          );
          await document.fonts.ready;
        });
        const toolbar = workspace.locator(
          structured ? '.collection-toolbar.structured-search' : '.collection-toolbar',
        );
        await expect(toolbar).toBeVisible();
        let resetIcon;
        if (structured) {
          const reset = toolbar.getByTestId('reset').locator('button');
          await expect(reset).toHaveClass(/\bcompact-on-small\b/);
          await expect(reset.locator('erp-icon[name="reset"] svg')).toBeVisible();
          resetIcon = await reset.locator('erp-icon[name="reset"]').evaluate((icon) => {
            const box = icon.getBoundingClientRect();
            return { width: box.width, height: box.height };
          });
          assert.deepEqual(resetIcon, { width: 18, height: 18 });
        }
        const headerHeights = await header.evaluate((element) => {
          const view = element.querySelector('.view-toggles button');
          if (!view) return null;
          return {
            view: view.getBoundingClientRect().height,
            commands: [
              ...element.querySelectorAll(
                '.primary-action button, erp-collection-export-menu button',
              ),
            ]
              .filter((button) => button.getBoundingClientRect().height)
              .map((button) => ({
                label: button.getAttribute('aria-label') || button.textContent.trim(),
                height: button.getBoundingClientRect().height,
              })),
          };
        });
        if (headerHeights)
          assert.ok(
            headerHeights.commands.every(
              (command) => Math.abs(command.height - headerHeights.view) < 1,
            ),
            JSON.stringify({ width, kind, headerHeights }),
          );
        const geometry = await toolbar.evaluate((element, companionSelector) => {
          const frame = element.getBoundingClientRect();
          const nodes = [
            ...element.querySelectorAll(
              'erp-option-select .p-select, .search-controls erp-text-field .input-row, erp-button button',
            ),
          ].filter((node) => node.getBoundingClientRect().height);
          // The clear button is intentionally inside the text input; it is owned by TextField.
          const boxes = nodes.map((node) => {
            const box = node.getBoundingClientRect();
            const selectedLabel = node.querySelector('.p-select-label');
            return {
              label: node.getAttribute('aria-label') || node.textContent.trim(),
              x: box.x,
              y: box.y,
              right: box.right,
              bottom: box.bottom,
              width: box.width,
              height: box.height,
              projectedSelect: node.matches('.p-select') && !!node.closest('[toolbarFilters]'),
              searchField: !!node.closest('.search-controls'),
              searchOperator: !!node.closest('.search-operator'),
              searchCompanion: !!companionSelector && !!node.closest(companionSelector),
              selectedLabelClipped:
                !!selectedLabel && selectedLabel.scrollWidth > selectedLabel.clientWidth + 1,
            };
          });
          const overlaps = [];
          for (let i = 0; i < boxes.length; i++)
            for (let j = i + 1; j < boxes.length; j++) {
              const a = boxes[i],
                b = boxes[j];
              if (
                Math.min(a.right, b.right) - Math.max(a.x, b.x) > 1 &&
                Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > 1
              )
                overlaps.push([a.label, b.label]);
            }
          return {
            display: getComputedStyle(element).display,
            wrap: getComputedStyle(element).flexWrap,
            contentWidth: frame.width,
            boxes,
            overlaps,
            outside: boxes.filter((box) => box.x < frame.left - 1 || box.right > frame.right + 1),
            outerOverflow: document.documentElement.scrollWidth > innerWidth + 1,
            filterRows: boxes
              .filter((box) => box.projectedSelect)
              .map((box) => boxes.filter((item) => Math.abs(item.y - box.y) < 1))
              .filter((row) => row.some((box) => box.projectedSelect))
              .map((row) => ({
                left: Math.min(...row.map((box) => box.x)),
                right: Math.max(...row.map((box) => box.right)),
              })),
            innerLeft: frame.left + parseFloat(getComputedStyle(element).paddingLeft),
            innerRight: frame.right - parseFloat(getComputedStyle(element).paddingRight),
            placeholderSize: element.querySelector('.search-controls input')
              ? getComputedStyle(element.querySelector('.search-controls input'), '::placeholder')
                  .fontSize
              : null,
            compactCompanion: !!companionSelector && frame.width <= 544,
          };
        }, compactSearchCompanion);
        await page.screenshot({
          path: path.join(
            output,
            `search-${language}-${mode}-${kind}-${width}x${height}-${open ? 'open' : 'closed'}.png`,
          ),
        });
        assert.deepEqual(geometry.overlaps, [], JSON.stringify({ kind, width, open, geometry }));
        assert.deepEqual(geometry.outside, [], JSON.stringify({ kind, width, open, geometry }));
        assert.equal(
          geometry.outerOverflow,
          false,
          JSON.stringify({ kind, width, open, geometry }),
        );
        if (structured)
          assert.ok(
            geometry.boxes.every((box) => Math.abs(box.height - 44) < 1),
            JSON.stringify({ kind, width, open, geometry }),
          );
        if (structured) {
          if (geometry.compactCompanion) {
            const companion = geometry.boxes.find((box) => box.searchCompanion);
            const operator = geometry.boxes.find((box) => box.searchOperator);
            assert.ok(companion, 'The compact search companion must remain visible');
            assert.ok(operator, 'The compact search operator must remain visible');
            assert.ok(
              Math.abs(companion.y - operator.y) < 1,
              JSON.stringify({ kind, width, open, geometry }),
            );
            assert.equal(operator.selectedLabelClipped, false, 'Keep the operator readable');
            assert.equal(companion.selectedLabelClipped, false, 'Keep the companion readable');
          }
          const searchBottom = Math.max(
            ...geometry.boxes.filter((box) => box.searchField).map((box) => box.bottom),
          );
          assert.ok(
            geometry.boxes
              .filter(
                (box) => box.projectedSelect && !(geometry.compactCompanion && box.searchCompanion),
              )
              .every((box) => box.y >= searchBottom + 7),
            JSON.stringify({ kind, width, open, geometry }),
          );
        }
        if (structured)
          assert.ok(
            geometry.filterRows.every(
              (row) =>
                Math.abs(row.left - geometry.innerLeft) < 1 &&
                Math.abs(row.right - geometry.innerRight) < 1,
            ),
            JSON.stringify({ kind, width, open, geometry }),
          );
        if (geometry.placeholderSize && geometry.contentWidth <= 544)
          assert.equal(geometry.placeholderSize, '12px');
        let collapsedGridCommands;
        if (structured && kind === 'grid') {
          const gridToolbar = workspace.locator('.collection-toolbar');
          const search = gridToolbar.locator('.search-controls');
          const filters = gridToolbar.locator('[toolbarFilters] erp-option-select');
          const criteria = await filters.allTextContents();
          await filter.click();
          await expect(filter).toHaveAttribute('aria-expanded', 'false');
          await expect(search).toHaveCount(0);
          await expect(filters).toHaveCount(0);
          await expect(gridToolbar.getByTestId('reset').locator('button')).toBeVisible();
          await expect(gridToolbar.locator('.grid-options button')).toBeVisible();
          await filter.click();
          await expect(filter).toHaveAttribute('aria-expanded', 'true');
          await expect(search).toBeVisible();
          assert.deepEqual(await filters.allTextContents(), criteria);
          collapsedGridCommands = true;
        }
        results.push({
          kind,
          width,
          height,
          navigationOpen: open,
          geometry,
          resetIcon,
          collapsedGridCommands,
        });
      }
    }
  }
  if (chart) {
    await header.locator('[data-view=chart] button').click();
    await expect(workspace.locator('erp-collection-chart-view')).toBeVisible();
    await expect(workspace.locator('.collection-toolbar')).toHaveCount(0);
    await expect(header.locator('.filter button')).toHaveCount(0);
  }
  // Switching back retains the collection search/filter workflow.
  await header.locator('[data-view=grid] button').click();
  await expect(
    workspace.locator(structured ? '.collection-toolbar.structured-search' : '.collection-toolbar'),
  ).toBeVisible();
  return results;
}

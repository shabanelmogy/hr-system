import assert from 'node:assert/strict';
import { expect } from '@playwright/test';

export async function verifyCollectionSortCycle(workspace, header, queries, maxId, text) {
  const id = workspace.locator('th[data-column-key="id"]');
  const rows = workspace.locator('tbody [data-collection-row]');
  const baseline = queries.at(-1);
  assert.ok(baseline);
  const verifyQuery = async (field, direction, previousCount) => {
    await expect.poll(() => queries.length).toBe(previousCount + 1);
    await expect(workspace).toHaveAttribute('data-kind', 'ready');
    assert.deepEqual(queries.at(-1), {
      ...baseline,
      pageNumber: '1',
      sortBy: field,
      sortDirection: direction,
    });
  };
  for (const [field, direction, aria, firstId] of [
    ['id', 'asc', 'ascending', 1],
    ['id', 'desc', 'descending', maxId],
    ['createdOn', 'desc', 'none', maxId],
    ['id', 'asc', 'ascending', 1],
  ]) {
    const previousCount = queries.length;
    await id.click();
    await verifyQuery(field, direction, previousCount);
    await expect(id).toHaveAttribute('aria-sort', aria);
    await expect(rows.first()).toHaveAttribute(
      'data-collection-row',
      JSON.stringify(['number', firstId]),
    );
    if (direction === 'asc')
      await expect(rows.nth(9)).toHaveAttribute('data-collection-row', '["number",10]');
  }

  await header.locator('[data-view=cards] button').click();
  await header.locator('.filter button').click();
  const button = workspace.locator('erp-sort-direction-button button');
  for (const [field, direction, label] of [
    ['id', 'desc', 'collections.sortDescending'],
    ['createdOn', 'desc', 'collections.unsorted'],
    ['id', 'asc', 'collections.sortAscending'],
  ]) {
    const previousCount = queries.length;
    await button.click();
    await verifyQuery(field, direction, previousCount);
    await expect(button).toHaveAttribute('aria-label', text[label]);
  }
}

import { collectionRecordDecision } from './collection-record-decision';
import type { CollectionRecordRequest } from './collection-record-feedback';
import type { CollectionView } from './collection.types';

describe('record feedback snapshot policy', () => {
  const query = { scopeKey: 'company-a', criteriaKey: 'all', pageIndex: 0, pageSize: 10 };
  const view: CollectionView<{ id: number }> = {
    query,
    kind: 'ready',
    rows: [{ id: 7 }],
    total: 1,
    hasNextPage: false,
  };
  const request: CollectionRecordRequest = {
    query,
    sequence: 1,
    issuedAt: 1000,
    target: { id: 7 },
    flash: 'edited',
  };
  it('does not apply an expired or foreign-context edit hint', () => {
    expect(collectionRecordDecision(request, view, (row) => row.id, 11001)).toEqual({
      kind: 'consume',
      clearFlash: true,
    });
    expect(
      collectionRecordDecision(
        request,
        { ...view, query: { ...query, scopeKey: 'company-b' } },
        (row: { id: number }) => row.id,
        1001,
      ),
    ).toEqual({ kind: 'consume', clearFlash: true });
  });
  it('waits for the finite response then selects only a record in the current page', () => {
    expect(
      collectionRecordDecision(
        request,
        { ...view, kind: 'loading', rows: [] },
        (row: { id: number }) => row.id,
        1001,
      ),
    ).toEqual({ kind: 'wait' });
    expect(collectionRecordDecision(request, view, (row) => row.id, 1001)).toEqual({
      kind: 'select',
      id: 7,
      flash: true,
    });
    expect(
      collectionRecordDecision({ ...request, target: { id: 8 } }, view, (row) => row.id, 1001),
    ).toEqual({ kind: 'consume', clearFlash: false });
  });
});

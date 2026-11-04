import { sameCollectionScope } from './collection-logic';
import type { CollectionId, CollectionView } from './collection.types';
import type { CollectionRecordRequest } from './collection-record-feedback';

export type RecordDecision =
  | { readonly kind: 'wait' }
  | { readonly kind: 'consume'; readonly clearFlash: boolean }
  | { readonly kind: 'navigate'; readonly index: number; readonly consume: boolean }
  | { readonly kind: 'select'; readonly id: CollectionId; readonly flash: boolean };

/** Resolve presentation intent against the current finite snapshot before changing UI state. */
export function collectionRecordDecision<T>(
  request: CollectionRecordRequest,
  view: CollectionView<T>,
  rowId: (row: T) => CollectionId,
  now: number,
): RecordDecision {
  const age = now - request.issuedAt;
  const targetPage =
    'index' in request.target
      ? Math.floor(request.target.index / request.query.pageSize)
      : request.query.pageIndex;
  if (
    !sameCollectionScope(request.query, view.query) ||
    request.query.pageSize !== view.query.pageSize ||
    ![request.query.pageIndex, targetPage].includes(view.query.pageIndex) ||
    age < 0 ||
    age > 10000 ||
    view.kind === 'forbidden' ||
    view.kind === 'error'
  )
    return { kind: 'consume', clearFlash: true };
  if (view.kind !== 'ready') return { kind: 'wait' };
  if (!view.rows.length) return { kind: 'consume', clearFlash: true };
  if ('index' in request.target) {
    const bound = view.total ?? view.query.pageIndex * view.query.pageSize + view.rows.length;
    const index = Math.min(request.target.index, Math.max(0, bound - 1));
    return {
      kind: 'navigate',
      index,
      consume: Math.floor(index / view.query.pageSize) === view.query.pageIndex,
    };
  }
  const id = request.target.id;
  return view.rows.some((row) => rowId(row) === id)
    ? { kind: 'select', id, flash: request.flash === 'edited' }
    : { kind: 'consume', clearFlash: false };
}

import { collectionRecordDecision } from './collection-record-decision';
import {
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  untracked,
  type Signal,
} from '@angular/core';
import { inspectCollection, recordTarget, sameCollectionScope } from './collection-logic';
import {
  collectionIdKey,
  collectionQueryKey,
  type CollectionId,
  type CollectionPageRequest,
  type CollectionQuery,
  type CollectionSource,
  type RecordAction,
} from './collection.types';
import type { GridSelectionMode } from './grid-options.types';
import {
  consumeRecordRequest,
  recordRequestHandled,
  recordFlashDuration,
  type CollectionRecordRequest,
} from './collection-record-feedback';
export function createCollectionController<T>(
  source: Signal<CollectionSource<T>>,
  rowId: Signal<(row: T) => CollectionId>,
  selectable: Signal<(row: T) => boolean>,
  callbacks: {
    page: (request: CollectionPageRequest) => void;
    active: (id: CollectionId | null) => void;
    selected: (ids: readonly CollectionId[]) => void;
  },
  selectionMode?: Signal<GridSelectionMode>,
  recordRequest?: Signal<CollectionRecordRequest | null>,
) {
  const view = computed(() => inspectCollection(source(), rowId()));
  const active = signal<CollectionId | null>(null),
    selection = signal<readonly CollectionId[]>([]),
    context = signal('');
  const focus = signal<{ id: CollectionId; sequence: number } | null>(null);
  let sequence = 0;
  let pending: { query: CollectionQuery; index: number } | null = null;
  let rangeAnchor: CollectionId | null = null;
  const flashed = signal<{ id: CollectionId; query: CollectionQuery } | null>(null);
  let flashTimer: ReturnType<typeof setTimeout> | null = null;
  const clearFlash = () => {
    if (flashTimer !== null) clearTimeout(flashTimer);
    flashTimer = null;
    flashed.set(null);
  };
  inject(DestroyRef).onDestroy(clearFlash);
  const currentKey = computed(() => collectionQueryKey(source().query));
  effect(() => {
    selectionMode?.();
    untracked(() => {
      rangeAnchor = null;
      if (selection().length) {
        selection.set([]);
        callbacks.selected([]);
      }
    });
  });
  const eligible = computed(() => view().rows.filter(selectable()).map(rowId()));
  const activeId = computed(() =>
    context() === currentKey() && view().rows.some((row) => rowId()(row) === active())
      ? active()
      : null,
  );
  const selectedIds = computed(() =>
    context() === currentKey() ? selection().filter((id) => eligible().includes(id)) : [],
  );
  const setActive = (id: CollectionId | null, requestFocus = false) => {
    if (flashed()?.id !== id) clearFlash();
    active.set(id);
    callbacks.active(id);
    if (requestFocus && id !== null) focus.set({ id, sequence: ++sequence });
  };
  effect(() => {
    const snapshot = view(),
      key = currentKey(),
      eligibleIds = eligible();
    untracked(() => {
      if (
        pending &&
        (!sameCollectionScope(pending.query, snapshot.query) ||
          pending.query.pageSize !== snapshot.query.pageSize ||
          pending.query.pageIndex !== snapshot.query.pageIndex ||
          snapshot.kind === 'error' ||
          snapshot.kind === 'forbidden')
      )
        pending = null;
      if (context() !== key || snapshot.kind !== 'ready') {
        context.set(key);
        rangeAnchor = null;
        if (active() !== null) {
          active.set(null);
          callbacks.active(null);
        }
        if (selection().length) {
          selection.set([]);
          callbacks.selected([]);
        }
        focus.set(null);
      }
      if (snapshot.kind !== 'ready') return;
      const safeSelection = selection().filter((id) => eligibleIds.includes(id));
      if (safeSelection.length !== selection().length) {
        selection.set(safeSelection);
        callbacks.selected(safeSelection);
      }
      if (pending) {
        const index = Math.min(pending.index % snapshot.query.pageSize, snapshot.rows.length - 1);
        pending = null;
        const row = snapshot.rows[index];
        if (row !== undefined) setActive(rowId()(row), true);
      } else if (!snapshot.rows.some((row) => rowId()(row) === active())) {
        const first = snapshot.rows[0];
        setActive(first === undefined ? null : rowId()(first));
      }
    });
  });
  const page = (request: CollectionPageRequest) => {
    const snapshot = view();
    if (
      snapshot.kind === 'loading' ||
      snapshot.kind === 'forbidden' ||
      !Number.isInteger(request.pageIndex) ||
      request.pageIndex < 0 ||
      !Number.isInteger(request.pageSize) ||
      request.pageSize < 1
    )
      return;
    if (
      snapshot.total !== null &&
      request.pageIndex > Math.max(0, Math.ceil(snapshot.total / request.pageSize) - 1)
    )
      return;
    if (
      request.pageIndex === snapshot.query.pageIndex &&
      request.pageSize === snapshot.query.pageSize
    )
      return;
    if (
      snapshot.query.pageAccess === 'sequential' &&
      request.pageIndex !== 0 &&
      Math.abs(request.pageIndex - snapshot.query.pageIndex) > 1
    )
      return;
    pending = null;
    callbacks.page(request);
  };
  const navigateIndex = (target: number) => {
    const snapshot = view(),
      start = snapshot.query.pageIndex * snapshot.query.pageSize,
      bound =
        snapshot.total ??
        (snapshot.hasNextPage ? start + snapshot.query.pageSize + 1 : start + snapshot.rows.length);
    if (snapshot.kind !== 'ready' || !Number.isSafeInteger(target) || target < 0 || target >= bound)
      return;
    const targetPage = Math.floor(target / snapshot.query.pageSize);
    if (
      snapshot.query.pageAccess === 'sequential' &&
      targetPage !== 0 &&
      Math.abs(targetPage - snapshot.query.pageIndex) > 1
    )
      return;
    if (targetPage === snapshot.query.pageIndex) {
      const row = snapshot.rows[target % snapshot.query.pageSize];
      if (row !== undefined) setActive(rowId()(row), true);
      return;
    }
    pending = { query: { ...snapshot.query, pageIndex: targetPage }, index: target };
    callbacks.page({ pageIndex: targetPage, pageSize: snapshot.query.pageSize });
  };
  const navigate = (action: RecordAction) => {
    const target = recordTarget(view(), rowId(), activeId(), action);
    if (target !== null) navigateIndex(target);
  };
  const activate = (id: CollectionId, requestFocus = false) => {
    if (view().kind === 'ready' && view().rows.some((row) => rowId()(row) === id))
      setActive(id, requestFocus);
  };
  effect(() => {
    const request = recordRequest?.(),
      snapshot = view(),
      currentFlash = flashed();
    untracked(() => {
      if (
        currentFlash &&
        (snapshot.kind !== 'ready' ||
          collectionQueryKey(currentFlash.query) !== collectionQueryKey(snapshot.query))
      )
        clearFlash();
      if (!request || recordRequestHandled(request)) return;
      const decision = collectionRecordDecision(request, snapshot, rowId(), Date.now());
      if (decision.kind === 'wait') return;
      if (decision.kind === 'consume') {
        consumeRecordRequest(request);
        if (decision.clearFlash) clearFlash();
        return;
      }
      if (decision.kind === 'navigate') {
        navigateIndex(decision.index);
        if (decision.consume) consumeRecordRequest(request);
        return;
      }
      consumeRecordRequest(request);
      const id = decision.id;
      setActive(id, true);
      clearFlash();
      if (decision.flash) {
        flashed.set({ id, query: snapshot.query });
        flashTimer = setTimeout(clearFlash, recordFlashDuration);
      }
    });
  });
  const toggle = (id: CollectionId, checked: boolean) => {
    if (view().kind !== 'ready' || !eligible().includes(id)) return;
    const mode = selectionMode?.() ?? 'multiple';
    rangeAnchor = id;
    if ((mode === 'single' || mode === 'radio') && checked) {
      selection.set([id]);
      callbacks.selected([id]);
      return;
    }
    const values = new Set(selectedIds());
    if (checked) values.add(id);
    else values.delete(id);
    selection.set([...values]);
    callbacks.selected([...values]);
  };
  const selectPage = (checked: boolean) => {
    if (view().kind !== 'ready') return;
    const mode = selectionMode?.() ?? 'multiple';
    if (checked && (mode === 'single' || mode === 'radio')) return;
    const ids = checked ? [...eligible()] : [];
    selection.set(ids);
    callbacks.selected(ids);
  };
  const selectRange = (id: CollectionId) => {
    if (selectionMode?.() !== 'range' || view().kind !== 'ready' || !eligible().includes(id))
      return;
    const ids = view().rows.map(rowId()),
      end = ids.indexOf(id),
      start = rangeAnchor === null ? end : ids.indexOf(rangeAnchor);
    if (start < 0) return;
    const selected = ids
      .slice(Math.min(start, end), Math.max(start, end) + 1)
      .filter((item) => eligible().includes(item));
    selection.set(selected);
    callbacks.selected(selected);
    if (rangeAnchor === null) rangeAnchor = id;
  };
  return {
    view,
    activeId,
    selectedIds,
    focusRequest: focus.asReadonly(),
    eligibleIds: eligible,
    flashedId: computed(() => {
      const value = flashed(),
        snapshot = view();
      return value &&
        snapshot.kind === 'ready' &&
        collectionQueryKey(value.query) === collectionQueryKey(snapshot.query)
        ? value.id
        : null;
    }),
    activeIndex: computed(() => {
      const index = view().rows.findIndex((row) => rowId()(row) === activeId());
      return index < 0 ? -1 : view().query.pageIndex * view().query.pageSize + index;
    }),
    allSelected: computed(
      () => eligible().length > 0 && eligible().every((id) => selectedIds().includes(id)),
    ),
    partlySelected: computed(
      () => selectedIds().length > 0 && selectedIds().length < eligible().length,
    ),
    page,
    navigate,
    navigateIndex,
    activate,
    toggle,
    selectPage,
    selectRange,
    clearSelection: () => selectPage(false),
    rowKey: (row: T) => collectionIdKey(rowId()(row)),
    canNavigate: (action: RecordAction) => {
      const target = recordTarget(view(), rowId(), activeId(), action);
      return (
        target !== null &&
        target !==
          (activeId() === null
            ? -1
            : view().query.pageIndex * view().query.pageSize +
              view().rows.findIndex((row) => rowId()(row) === activeId()))
      );
    },
  };
}
export type CollectionController<T> = ReturnType<typeof createCollectionController<T>>;

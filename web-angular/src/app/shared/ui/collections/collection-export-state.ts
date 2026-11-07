import { computed, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import {
  downloadBlob,
  TABULAR_FILE_WRITER,
  TabularExportError,
  type TabularExportSource,
  type TabularFormat,
} from '../../data/public-api';
import { FeedbackNotifications } from '../feedback/feedback-notifications';

export function createCollectionExport(readSource: () => TabularExportSource | null) {
  const writer = inject(TABULAR_FILE_WRITER, { optional: true });
  const notices = inject(FeedbackNotifications);
  const destroy = inject(DestroyRef);
  interface Operation {
    readonly source: TabularExportSource;
    readonly abort: AbortController;
  }
  const active = signal<Operation | null>(null);
  const permitted = () => {
    const source = readSource();
    return source && writer?.allowed() && writer.actor() === source.actor ? source : null;
  };
  const sameContext = (operation: Operation) => {
    const source = readSource(),
      captured = operation.source;
    return (
      !destroy.destroyed &&
      active() === operation &&
      !operation.abort.signal.aborted &&
      source?.actor === captured.actor &&
      writer?.actor() === captured.actor &&
      source.criteriaKey === captured.criteriaKey &&
      source.culture === captured.culture &&
      source.fileName === captured.fileName
    );
  };
  const current = (operation: Operation) => sameContext(operation) && !!writer?.allowed();
  const cancel = () => {
    active()?.abort.abort();
    active.set(null);
  };
  destroy.onDestroy(cancel);
  effect(() => {
    const operation = active();
    if (operation && !current(operation)) {
      if (sameContext(operation) && !writer?.allowed())
        untracked(() => notices.failure('collectionExport.forbidden'));
      untracked(cancel);
    }
  });
  const run = async (format: TabularFormat): Promise<void> => {
    if (format !== 'xlsx' && format !== 'csv') return;
    const previous = active();
    if (previous && current(previous)) return;
    if (previous) cancel();
    const source = permitted();
    if (!source || !writer || destroy.destroyed) return;
    const operation = { source, abort: new AbortController() };
    active.set(operation);
    try {
      const rows = await source.load(operation.abort.signal);
      if (!current(operation)) return;
      if (!rows.length) {
        notices.failure('collectionExport.empty');
        return;
      }
      const file = await writer.write(
        { rows, format, fileName: source.fileName, culture: source.culture, actor: source.actor },
        operation.abort.signal,
      );
      if (!current(operation)) return;
      downloadBlob(file.blob, file.fileName);
      notices.success('collectionExport.completed');
    } catch (error: unknown) {
      if (sameContext(operation) && !writer.allowed()) {
        notices.failure('collectionExport.forbidden');
        return;
      }
      if (!current(operation)) return;
      notices.failure(
        error instanceof TabularExportError
          ? 'collectionExport.' + error.reason
          : 'collectionExport.failed',
      );
    } finally {
      if (active() === operation) active.set(null);
    }
  };
  return {
    available: computed(() => permitted() !== null),
    pending: computed(() => {
      const operation = active();
      return !!operation && current(operation);
    }),
    run,
    cancel,
  };
}

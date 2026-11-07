import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  TABULAR_FILE_WRITER,
  type TabularExportSource,
  type TabularFile,
  type TabularFileRequest,
} from '../../data/public-api';
import { FeedbackNotifications } from '../feedback/feedback-notifications';
import { createCollectionExport } from './collection-export-state';

describe('Shared collection export lifetime', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });
  function setup() {
    const actor = {},
      allowed = signal(true);
    const source = signal<TabularExportSource | null>({
      actor,
      criteriaKey: 'filter-A',
      fileName: 'records',
      culture: 'en',
      load: async () => [{ Name: 'All filtered rows' }],
    });
    let finish = (_value: TabularFile) => {};
    const response = new Promise<TabularFile>((resolve) => {
      finish = resolve;
    });
    const writer = {
      actor: signal<object | null>(actor),
      allowed,
      write: vi.fn((_request: TabularFileRequest, _signal: AbortSignal) => response),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: TABULAR_FILE_WRITER, useValue: writer }],
    });
    const state = TestBed.runInInjectionContext(() => createCollectionExport(source));
    const notices = TestBed.inject(FeedbackNotifications);
    const href = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fixture');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    TestBed.tick();
    return { state, source, actor, writer, finish, notices, href };
  }
  it('uses the captured full source once and suppresses late download after filters change', async () => {
    const { state, source, writer, finish, href } = setup();
    expect(state.available()).toBe(true);
    const run = state.run('csv');
    await Promise.resolve();
    expect(state.pending()).toBe(true);
    await state.run('xlsx');
    expect(writer.write).toHaveBeenCalledOnce();
    source.update((current) => (current ? { ...current, criteriaKey: 'filter-B' } : null));
    finish({ blob: new Blob(['data']), fileName: 'records.csv' });
    await run;
    expect(href).not.toHaveBeenCalled();
  });
  it('downloads only a live authorized result and reports shared completion', async () => {
    const { state, finish, href, notices } = setup();
    const run = state.run('xlsx');
    await Promise.resolve();
    finish({ blob: new Blob(['data']), fileName: 'records.xlsx' });
    await run;
    expect(href).toHaveBeenCalledOnce();
    expect(state.pending()).toBe(false);
    expect(notices.toasts()).toContainEqual(
      expect.objectContaining({ key: 'collectionExport.completed' }),
    );
  });
  it('aborts both stages on explicit cancel or formatter permission loss', async () => {
    const { state, writer, finish, href } = setup();
    const run = state.run('csv');
    await Promise.resolve();
    state.cancel();
    expect(writer.write.mock.calls[0]?.[1]?.aborted).toBe(true);
    writer.allowed.set(false);
    TestBed.tick();
    finish({ blob: new Blob(['data']), fileName: 'records.csv' });
    await run;
    expect(href).not.toHaveBeenCalled();
    expect(state.available()).toBe(false);
  });
  it('explains formatter denial only for the unchanged active context', async () => {
    const { state, writer, finish, notices, href } = setup();
    const run = state.run('csv');
    await Promise.resolve();
    writer.allowed.set(false);
    TestBed.tick();
    finish({ blob: new Blob(['data']), fileName: 'records.csv' });
    await run;
    expect(href).not.toHaveBeenCalled();
    expect(notices.error()?.key).toBe('collectionExport.forbidden');
    expect(state.available()).toBe(false);
  });
});

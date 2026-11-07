import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../../platform/auth/auth.fixture';
import { CommandFailure } from '../../../../../shared/data/public-api';
import {
  CollectionRecordFeedback,
  FeedbackNotifications,
  type CollectionSource,
} from '../../../../../shared/ui/public-api';
import { StateService } from '../services/state-service';
import type { StateListItem } from '../types/state';
import { StateEditorState } from './state-editor-state';
import { StateLifecycleState } from './state-lifecycle-state';
import { StateReadState } from './state-read-state';

describe('States lifecycle authority and confirmation', () => {
  const actor: Session = {
    ...sessionFixture,
    roles: ['super_admin'],
    permissions: ['States:View', 'States:Archive', 'States:Restore'],
  };
  const row: StateListItem = {
    id: 1,
    nameAr: 'القاهرة',
    nameEn: 'Cairo',
    code: 'CAI',
    countryId: 7,
    country: { id: 7, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false },
    districtsCount: 0,
    createdOn: '2026-01-01T00:00:00.000Z',
    updatedOn: null,
    isDeleted: false,
  };
  function setup(initial = actor) {
    const identity = signal<Session | null>(initial),
      query = { scopeKey: 'states', criteriaKey: 'active', pageIndex: 0, pageSize: 200 };
    const source = signal<CollectionSource<StateListItem>>({
      kind: 'ready',
      query,
      result: {
        query,
        rows: [row, { ...row, id: 2 }, { ...row, id: 3, isDeleted: true }],
        total: 3,
        hasNextPage: false,
      },
    });
    const write = new Subject<number>(),
      service = {
        archive: vi.fn(() => write.asObservable()),
        restore: vi.fn(() => write.asObservable()),
        bulkArchive: vi.fn(() => write.asObservable()),
      },
      refresh = vi.fn(),
      editor = signal(false);
    const notices = { failure: vi.fn(), success: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        StateLifecycleState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: StateService, useValue: service },
        { provide: StateReadState, useValue: { source, refresh } },
        { provide: StateEditorState, useValue: { active: editor } },
        { provide: CollectionRecordFeedback, useValue: { removed: vi.fn() } },
        { provide: FeedbackNotifications, useValue: notices },
      ],
    });
    const state = TestBed.inject(StateLifecycleState);
    TestBed.tick();
    return { state, identity, source, write, service, refresh, editor, notices };
  }
  afterEach(() => TestBed.resetTestingModule());
  it('guards direct actions for read-only actors and independent restore grant', () => {
    const { state, service } = setup({ ...actor, tenantReadOnly: true });
    state.select([1]);
    state.request(row, 'archive');
    state.requestBulk();
    expect(state.allowed()).toBe(false);
    expect(service.archive).not.toHaveBeenCalled();
    expect(state.can({ ...row, id: 3, isDeleted: true }, 'restore')).toBe(false);
  });
  it('keeps only active current-page IDs, clears on source replacement, and rejects over-100 bulk requests', () => {
    const { state, source, notices } = setup();
    state.select([1, 2, 3, 99, 1, 'x']);
    expect(state.selected()).toEqual([1, 2]);
    state.requestBulk();
    expect(state.open()).toBe(true);
    state.cancel();
    source.set({ ...source(), query: { ...source().query, criteriaKey: 'changed' } });
    TestBed.tick();
    expect(state.selected()).toEqual([]);
    const ids = Array.from({ length: 101 }, (_, index) => index + 10);
    const rows = ids.map((id) => ({ ...row, id }));
    source.set({
      kind: 'ready',
      query: source().query,
      result: { query: source().query, rows, total: 101, hasNextPage: false },
    });
    state.select(ids);
    state.requestBulk();
    expect(notices.failure).toHaveBeenCalledWith(
      'states.bulkArchiveLimitExceeded',
      'reference-states',
      { max: 100 },
    );
  });
  it('barriers double confirm/cancel and accepts authoritative idempotent zero-count', () => {
    const { state, write, service, refresh } = setup();
    state.select([1, 2]);
    state.requestBulk();
    state.confirm();
    state.confirm();
    state.cancel();
    expect(service.bulkArchive).toHaveBeenCalledExactlyOnceWith([1, 2]);
    expect(state.open()).toBe(true);
    write.next(0);
    expect(state.open()).toBe(false);
    expect(state.selected()).toEqual([]);
    expect(refresh).toHaveBeenCalledOnce();
  });
  it('never retries rejected commands', () => {
    const { state, write, service, refresh } = setup();
    state.request(row, 'archive');
    state.confirm();
    write.error(new CommandFailure('rejected', 400, {}, ['State.StateInUseByDistrict']));
    state.confirm();
    expect(service.archive).toHaveBeenCalledOnce();
    expect(refresh).not.toHaveBeenCalled();
  });
  it('reconciles uncertain outcomes without replay', () => {
    const { state, write, service, refresh } = setup();
    state.select([1, 2]);
    state.requestBulk();
    state.confirm();
    write.error(new CommandFailure('uncertain', 0));
    state.confirm();
    expect(service.bulkArchive).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledOnce();
    expect(state.selected()).toEqual([]);
  });
  it('cancels pending writes and masks late effects on actor replacement', () => {
    const { state, write, identity, service, refresh } = setup();
    state.request(row, 'archive');
    state.confirm();
    expect(service.archive).toHaveBeenCalledOnce();
    identity.set(null);
    TestBed.tick();
    write.next(1);
    expect(state.open()).toBe(false);
    expect(refresh).not.toHaveBeenCalled();
  });
});

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../../platform/auth/auth.fixture';
import { LocalizationRuntime } from '../../../../../platform/localization/public-api';
import { CommandFailure } from '../../../../../shared/data/public-api';
import { StateService } from '../services/state-service';
import { stateDetailSchema } from '../types/state';
import { StateCountriesState } from './state-countries-state';
import { StateEditorState } from './state-editor-state';
import { StateReadState } from './state-read-state';
describe('State editor command lifetime', () => {
  const actor: Session = {
    ...sessionFixture,
    roles: ['super_admin'],
    permissions: ['States:View', 'States:Create', 'States:Edit'],
  };
  const detail = stateDetailSchema.parse({
    id: 1,
    nameAr: 'القاهرة',
    nameEn: 'Cairo',
    code: 'CAI',
    countryId: 7,
    country: { id: 7, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false },
    createdOn: '2026-01-01T00:00:00.000Z',
    updatedOn: null,
    isDeleted: false,
  });
  function setup(initial = actor) {
    const identity = signal<Session | null>(initial),
      write = new Subject<typeof detail>(),
      read = new Subject<typeof detail>(),
      source = { kind: 'ready' as const },
      view = signal({ kind: 'ready' as const, data: { items: [{ id: 1, isDeleted: false }] } }),
      refresh = vi.fn();
    const service = {
      create: vi.fn(() => write.asObservable()),
      update: vi.fn(() => write.asObservable()),
      detail: vi.fn(() => read.asObservable()),
    };
    TestBed.configureTestingModule({
      providers: [
        StateEditorState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: LocalizationRuntime, useValue: { translate: (key: string) => key } },
        { provide: StateService, useValue: service },
        { provide: StateReadState, useValue: { source: () => source, view, refresh } },
        {
          provide: StateCountriesState,
          useValue: {
            canSelect: () => true,
            view: () => ({ kind: 'ready', data: [detail.country] }),
          },
        },
      ],
    });
    const state = TestBed.inject(StateEditorState);
    TestBed.tick();
    return { state, service, write, read, identity, refresh };
  }
  afterEach(() => TestBed.resetTestingModule());
  const fill = (state: StateEditorState) =>
    state.form().value.set({ nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7 });
  it('rejects denied/read-only direct actions', () => {
    const { state, service } = setup({
      ...actor,
      permissions: ['States:View'],
      tenantReadOnly: true,
    });
    state.create();
    state.edit(1);
    expect(state.active()).toBe(false);
    expect(service.detail).not.toHaveBeenCalled();
  });
  it('blocks invalid and double submit then emits exactly once', async () => {
    const { state, service, write } = setup();
    state.create();
    void state.save();
    expect(service.create).not.toHaveBeenCalled();
    fill(state);
    const saved = vi.fn();
    state.saved.subscribe(saved);
    const saving = state.save();
    void state.save();
    expect(service.create).toHaveBeenCalledOnce();
    write.next(detail);
    await saving;
    expect(saved).toHaveBeenCalledOnce();
  });
  it('waits for fresh edit detail and rejects archived records', () => {
    const { state, service, read } = setup();
    state.edit(1);
    void state.save();
    expect(service.update).not.toHaveBeenCalled();
    read.next({ ...detail, isDeleted: true });
    expect(state.phase()).toBe('error');
  });
  it('maps server fields and duplicate rejection without closing', async () => {
    const { state, write } = setup();
    state.create();
    fill(state);
    const saving = state.save();
    write.error(new CommandFailure('rejected', 400, { nameEn: 'Unique' }, ['State.Duplicated']));
    await saving;
    expect(state.form.nameEn().getError('server')?.message).toBe('Unique');
    expect(state.form.nameAr().getError('server')?.message).toBe('states.duplicate');
    expect(state.form.code().getError('server')?.message).toBe('states.duplicate');
    expect(state.active()).toBe(true);
  });
  it('maps known parent codes to country without exposing server details', async () => {
    const { state, write } = setup();
    state.create();
    fill(state);
    const saving = state.save();
    write.error(new CommandFailure('rejected', 400, {}, ['State.CountryNotFound']));
    await saving;
    expect(state.form.countryId().getError('server')?.message).toBe('states.countryUnavailable');
  });
  it('locks uncertain replay until explicit close reconciliation', async () => {
    const { state, write, service, refresh } = setup();
    state.create();
    fill(state);
    const saving = state.save();
    write.error(new CommandFailure('uncertain', 0));
    await saving;
    void state.save();
    expect(service.create).toHaveBeenCalledOnce();
    state.close({ identity: state.identity(), revision: state.revision(), token: 1 });
    expect(refresh).toHaveBeenCalledOnce();
  });
  it('uses an active parent dev sample without saving', () => {
    const { state, service } = setup();
    state.create();
    state.generate();
    expect(state.form.countryId().value()).toBe(7);
    expect(state.form.nameEn().value()).not.toBe('');
    expect(service.create).not.toHaveBeenCalled();
  });
  it('cancels fresh-detail and dispatched-write effects when the actor changes', async () => {
    const detailLoad = setup();
    detailLoad.state.edit(1);
    detailLoad.identity.set(null);
    TestBed.tick();
    detailLoad.read.next(detail);
    expect(detailLoad.state.active()).toBe(false);
    detailLoad.identity.set({ ...actor });
    TestBed.tick();
    detailLoad.state.create();
    fill(detailLoad.state);
    const saved = vi.fn();
    detailLoad.state.saved.subscribe(saved);
    const saving = detailLoad.state.save();
    detailLoad.identity.set(null);
    TestBed.tick();
    detailLoad.write.next(detail);
    await saving;
    expect(saved).not.toHaveBeenCalled();
  });
});

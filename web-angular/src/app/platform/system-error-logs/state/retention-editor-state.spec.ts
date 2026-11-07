import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { CommandFailure, UnsavedChanges, type ReadState } from '../../../shared/data/public-api';
import { SystemErrorLogService } from '../services/system-error-log-service';
import { systemErrorLogSettingsFixture as settings } from '../error-log.fixture';
import type { ErrorLogSettings } from '../types/error-log';
import { ErrorLogSettingsState } from './error-log-settings-state';
import { RetentionEditorState } from './retention-editor-state';

describe('Retention editor lifetime and revision recovery', () => {
  const actor: Session = {
    ...sessionFixture,
    roles: ['super_admin'],
    permissions: ['ErrorLogSettings:View', 'ErrorLogSettings:Edit'],
  };
  function setup(initial = actor) {
    const identity = signal<Session | null>(initial);
    const view = signal<ReadState<ErrorLogSettings>>({ kind: 'ready', data: settings });
    const command = new Subject<ErrorLogSettings>();
    const reload = new Subject<ErrorLogSettings>();
    const service = {
      saveSettings: vi.fn(() => command.asObservable()),
      settings: vi.fn(() => reload.asObservable()),
    };
    const reads = {
      canRead: () => true,
      view,
      pending: () => false,
      refresh: vi.fn(),
      deny: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        RetentionEditorState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: ErrorLogSettingsState, useValue: reads },
        { provide: SystemErrorLogService, useValue: service },
      ],
    });
    const state = TestBed.inject(RetentionEditorState);
    const drafts = TestBed.inject(UnsavedChanges);
    TestBed.tick();
    return { state, identity, command, reload, service, reads, drafts };
  }
  afterEach(() => TestBed.resetTestingModule());
  it('requires independent settings read/edit authority and validates before a command', async () => {
    const { state, service, identity } = setup({ ...actor, tenantReadOnly: true });
    state.open();
    expect(state.active()).toBe(false);
    identity.set(actor);
    state.open();
    state.form.retentionDays().value.set('');
    await state.save();
    expect(service.saveSettings).not.toHaveBeenCalled();
    expect(state.form.retentionDays().invalid()).toBe(true);
  });
  it('sends the loaded expected revision once and blocks close while saving', async () => {
    const { state, service, command, reads } = setup();
    state.open();
    state.form.retentionDays().value.set('120');
    const save = state.save();
    void state.save();
    expect(service.saveSettings).toHaveBeenCalledExactlyOnceWith(120, 4);
    state.close({ identity: state.identity(), revision: state.revision(), token: 0 });
    expect(state.active()).toBe(true);
    command.next({ ...settings, retentionDays: 120, revision: 5 });
    await save;
    expect(state.active()).toBe(false);
    expect(reads.refresh).toHaveBeenCalledOnce();
  });
  it('maps backend field aliases onto the submitted native field and leaves the draft', async () => {
    const { state, command } = setup();
    state.open();
    state.form.retentionDays().value.set('120');
    const save = state.save();
    command.error(
      new CommandFailure('rejected', 400, { 'Request.RetentionDays': 'Use a shorter period.' }),
    );
    await save;
    expect(state.active()).toBe(true);
    expect(state.form.retentionDays().errors()).toContainEqual(
      expect.objectContaining({ kind: 'server', message: 'Use a shorter period.' }),
    );
    expect(state.form.retentionDays().value()).toBe('120');
  });
  it('reloads revision after409 without resetting the draft, then requires an explicit save', async () => {
    const { state, command, reload, service } = setup();
    state.open();
    state.form.retentionDays().value.set('120');
    const save = state.save();
    command.error(new CommandFailure('rejected', 409));
    await save;
    expect(state.conflict()).toBe(true);
    expect(state.save()).toBe(false);
    const revision = state.reloadRevision();
    expect(state.pending()).toBe(true);
    reload.next({ ...settings, retentionDays: 60, revision: 7 });
    await revision;
    expect(state.form.retentionDays().value()).toBe('120');
    expect(state.expectedRevision()).toBe(7);
    expect(state.conflict()).toBe(false);
    expect(service.saveSettings).toHaveBeenCalledOnce();
    const next = new Subject<ErrorLogSettings>();
    service.saveSettings.mockReturnValueOnce(next.asObservable());
    const retried = state.save();
    expect(service.saveSettings).toHaveBeenLastCalledWith(120, 7);
    next.next({ ...settings, retentionDays: 120, revision: 8 });
    await retried;
  });
  it('requires valid discard consent before Load Current and resets value/revision together', async () => {
    const { state, reload, service, drafts } = setup();
    state.open();
    state.form.retentionDays().value.set('120');
    const loading = state.loadCurrent();
    expect(service.settings).not.toHaveBeenCalled();
    const consent = drafts.prompt();
    expect(consent).not.toBeNull();
    if (!consent) throw Error('Expected live discard confirmation');
    drafts.answer(consent, true);
    await Promise.resolve();
    expect(service.settings).toHaveBeenCalledOnce();
    reload.next({ ...settings, retentionDays: 60, revision: 7 });
    await loading;
    expect(state.form.retentionDays().value()).toBe('60');
    expect(state.expectedRevision()).toBe(7);
    expect(state.unsaved()).toBe(false);
  });
  it('does not replay uncertain writes and cancels draft/command acceptance on actor replacement', async () => {
    const { state, command, identity, service, reads } = setup();
    state.open();
    state.form.retentionDays().value.set('120');
    const save = state.save();
    command.error(new CommandFailure('uncertain', 500));
    await save;
    expect(state.uncertain()).toBe(true);
    expect(state.save()).toBe(false);
    expect(service.saveSettings).toHaveBeenCalledOnce();
    identity.set({ ...actor, userId: 'another-actor' });
    expect(state.active()).toBe(false);
    TestBed.tick();
    expect(state.form.retentionDays().value()).toBe('');
    expect(reads.refresh).not.toHaveBeenCalled();
  });
  it('latches edit403 without destroying the authorized settings read', async () => {
    const { state, command, reads } = setup();
    state.open();
    const save = state.save();
    command.error(new CommandFailure('rejected', 403));
    await save;
    expect(state.canEdit()).toBe(false);
    expect(state.feedback()).toBe('forbidden');
    expect(reads.deny).not.toHaveBeenCalled();
    expect(reads.view().kind).toBe('ready');
    expect(state.save()).toBe(false);
  });
  it('rejects stale close and discard consent after the draft changes', async () => {
    const { state, drafts, service } = setup();
    state.open();
    const staleClose = { identity: state.identity(), revision: state.revision(), token: 0 };
    state.form.retentionDays().value.set('120');
    state.close(staleClose);
    expect(state.active()).toBe(true);
    const loading = state.loadCurrent();
    const consent = drafts.prompt();
    if (!consent) throw Error('Expected live discard confirmation');
    state.form.retentionDays().value.set('180');
    drafts.answer(consent, true);
    await loading;
    expect(service.settings).not.toHaveBeenCalled();
    expect(state.form.retentionDays().value()).toBe('180');
  });
  it('cancels an in-flight save when its actor changes without accepting a late result', async () => {
    const { state, command, identity, reads } = setup();
    state.open();
    state.form.retentionDays().value.set('120');
    const save = state.save();
    expect(command.observed).toBe(true);
    identity.set({ ...actor, userId: 'replacement' });
    expect(state.active()).toBe(false);
    TestBed.tick();
    expect(command.observed).toBe(false);
    command.next({ ...settings, revision: 5 });
    await save;
    expect(reads.refresh).not.toHaveBeenCalled();
    expect(state.form.retentionDays().value()).toBe('');
  });
  it('refreshes the displayed settings after loading the authoritative value', async () => {
    const latest = { ...settings, retentionDays: 60, revision: 7 };
    let serverSettings = settings;
    TestBed.configureTestingModule({
      providers: [
        ErrorLogSettingsState,
        RetentionEditorState,
        { provide: AuthSession, useValue: { readIdentity: () => actor } },
        { provide: SystemErrorLogService, useValue: { settings: () => of(serverSettings) } },
      ],
    });
    const reads = TestBed.inject(ErrorLogSettingsState);
    const editor = TestBed.inject(RetentionEditorState);
    TestBed.tick();
    expect(reads.view()).toEqual({ kind: 'ready', data: settings });
    editor.open();
    serverSettings = latest;
    await editor.loadCurrent();
    expect(editor.form.retentionDays().value()).toBe('60');
    expect(reads.view()).toEqual({ kind: 'ready', data: latest });
  });
});

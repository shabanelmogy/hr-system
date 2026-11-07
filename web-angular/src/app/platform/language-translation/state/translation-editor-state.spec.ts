import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { CommandFailure, UnsavedChanges, type ReadState } from '../../../shared/data/public-api';
import { LanguageTranslationService } from '../services/language-translation-service';
import { LanguageTranslationState } from './language-translation-state';
import { TranslationEditorState } from './translation-editor-state';
import type { TranslationPage } from '../types/language-translation';
describe('System text editor lifecycle', () => {
  const actor: Session = {
    ...sessionFixture,
    roles: ['super_admin'],
    permissions: ['SystemUiTexts:View', 'SystemUiTexts:Edit', 'SystemUiTexts:Reset'],
  };
  const row = {
    key: 'countries.code',
    baseValue: 'Code {{code}}',
    targetValue: 'رمز {{code}}',
    shippedValue: 'الرمز {{code}}',
    isCustomized: true,
  };
  function setup() {
    const identity = signal<Session | null>(actor);
    const view = signal<ReadState<TranslationPage>>({
      kind: 'ready',
      data: {
        revision: 3,
        catalogVersion: 'v1',
        totalCount: 1,
        page: 1,
        pageSize: 25,
        items: [row],
      },
    });
    const command = new Subject<void>();
    const service = {
      update: vi.fn(() => command.asObservable()),
      reset: vi.fn(() => command.asObservable()),
    };
    const reads = {
      canRead: () => !!identity()?.permissions.includes('SystemUiTexts:View'),
      textsView: view,
      pending: () => false,
      sourceId: () => 'reference-countries',
      query: () => ({ targetLanguage: 'ar' as const }),
      refresh: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        TranslationEditorState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: LanguageTranslationState, useValue: reads },
        { provide: LanguageTranslationService, useValue: service },
      ],
    });
    const editor = TestBed.inject(TranslationEditorState);
    TestBed.tick();
    return { editor, identity, command, service, reads };
  }
  afterEach(() => TestBed.resetTestingModule());
  it('validates required text and placeholders before dispatch while keeping the draft', async () => {
    const { editor, service } = setup();
    editor.open(row);
    editor.form.value().value.set('بدون متغير');
    await editor.save();
    expect(editor.form.value().invalid()).toBe(true);
    expect(service.update).not.toHaveBeenCalled();
  });
  it('captures source/language/revision, blocks duplicate saves and closes only on success', async () => {
    const { editor, command, service, reads } = setup();
    editor.open(row);
    editor.form.value().value.set('الجديد {{code}}');
    const save = editor.save();
    void editor.save();
    expect(service.update).toHaveBeenCalledExactlyOnceWith({
      source: 'reference-countries',
      language: 'ar',
      key: row.key,
      value: 'الجديد {{code}}',
      expectedRevision: 3,
    });
    command.next();
    await save;
    expect(editor.active()).toBe(false);
    expect(reads.refresh).toHaveBeenCalledOnce();
  });
  it('maps API field errors and preserves the unsaved value', async () => {
    const { editor, command } = setup();
    editor.open(row);
    editor.form.value().value.set('الجديد {{code}}');
    const save = editor.save();
    command.error(
      new CommandFailure('rejected', 400, { 'Request.Value': 'Server validation fixture' }),
    );
    await save;
    expect(editor.form.value().getError('server')?.message).toBe('Server validation fixture');
    expect(editor.active()).toBe(true);
  });
  it('locks conflicting and uncertain submissions without automatic resend', async () => {
    const { editor, command, service } = setup();
    editor.open(row);
    const save = editor.save();
    command.error(new CommandFailure('rejected', 409));
    await save;
    expect(editor.feedback()).toBe('conflict');
    expect(editor.save()).toBe(false);
    expect(service.update).toHaveBeenCalledOnce();
  });
  it('cancels in-flight acceptance when the actor changes', async () => {
    const { editor, identity, command, reads } = setup();
    editor.open(row);
    const save = editor.save();
    expect(command.observed).toBe(true);
    identity.set({ ...actor, userId: 'replacement' });
    TestBed.tick();
    expect(command.observed).toBe(false);
    command.next();
    await save;
    expect(editor.active()).toBe(false);
    expect(reads.refresh).not.toHaveBeenCalled();
  });
  it('resets customized text with independent reset permission and the loaded revision', async () => {
    const { editor, command, service } = setup();
    editor.open(row, true);
    const reset = editor.confirmReset();
    expect(service.reset).toHaveBeenCalledExactlyOnceWith({
      source: 'reference-countries',
      language: 'ar',
      key: row.key,
      expectedRevision: 3,
    });
    command.next();
    await reset;
    expect(editor.active()).toBe(false);
  });
  it('requires current discard consent before loading the latest values', async () => {
    const { editor, reads } = setup();
    editor.open(row);
    editor.form.value().value.set('الجديد {{code}}');
    const reload = editor.reload();
    const drafts = TestBed.inject(UnsavedChanges),
      consent = drafts.prompt();
    if (!consent) throw Error('Expected discard confirmation');
    editor.form.value().value.set('تعديل آخر {{code}}');
    drafts.answer(consent, true);
    await reload;
    expect(editor.active()).toBe(true);
    expect(reads.refresh).not.toHaveBeenCalled();
  });
});

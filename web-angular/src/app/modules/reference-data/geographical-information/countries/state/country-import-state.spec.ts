import { fixtureItem } from '../../../../../../testing/fixture-item';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../../platform/auth/auth.fixture';
import { CommandFailure, UnsavedChanges } from '../../../../../shared/data/public-api';
import { SpreadsheetFiles } from '../../../../../shared/data/spreadsheet-public-api';
import { CountryService } from '../services/country-service';
import { CountryReadState } from './country-read-state';
import { CountryImportState } from './country-import-state';
describe('Country import actor and submission lifetime', () => {
  const actor: Session = {
    ...sessionFixture,
    roles: ['super_admin'],
    permissions: ['Countries:View', 'Countries:Create'],
    tenantReadOnly: false,
  };
  const input = [
    { rowNumber: 2, values: ['مصر', 'Egypt', 'EG', 'EGY', '20', 'EGP'] },
    { rowNumber: 3, values: ['السعودية', 'Egypt', 'SA', 'SAU', '', ''] },
  ];
  function setup(initial: Session = actor) {
    const identity = signal<Session | null>(initial),
      command = new Subject<number>(),
      refresh = vi.fn(),
      service = { bulkCreate: vi.fn((_rows: readonly unknown[]) => command) },
      files = {
        parse: vi.fn(async () => input),
        template: vi.fn(async () => new Blob(['template'])),
      };
    TestBed.configureTestingModule({
      providers: [
        CountryImportState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: CountryService, useValue: service },
        { provide: SpreadsheetFiles, useValue: files },
        { provide: CountryReadState, useValue: { refresh } },
      ],
    });
    const state = TestBed.inject(CountryImportState);
    TestBed.tick();
    return { state, identity, command, service, files, refresh };
  }
  const file = new File(['fixture'], 'countries.xlsx');
  afterEach(() => TestBed.resetTestingModule());
  it('guards direct select/template/submit for read-only or unauthorized actors', async () => {
    const { state, files, service } = setup({ ...actor, tenantReadOnly: true });
    await state.select(file);
    await state.download();
    state.submit();
    expect(files.parse).not.toHaveBeenCalled();
    expect(files.template).not.toHaveBeenCalled();
    expect(service.bulkCreate).not.toHaveBeenCalled();
  });
  it('validates every row, sends one valid batch and retains invalid feedback', async () => {
    const { state, service, command, refresh } = setup();
    await state.select(file);
    state.submit();
    state.submit();
    expect(service.bulkCreate).toHaveBeenCalledOnce();
    expect(fixtureItem(fixtureItem(service.bulkCreate.mock.calls, 0), 0)).toHaveLength(1);
    expect(state.rows().map((row) => row.status)).toEqual(['submitted', 'invalid']);
    expect(TestBed.inject(UnsavedChanges).busy()).toBe(true);
    command.next(1);
    expect(state.phase()).toBe('succeeded');
    expect(state.rows().map((row) => row.status)).toEqual(['uploaded', 'invalid']);
    state.submit();
    expect(service.bulkCreate).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledOnce();
  });
  it('locks ambiguous results against replay/reselection until explicit clear', async () => {
    const { state, service, command, files } = setup();
    await state.select(file);
    state.submit();
    command.error(new CommandFailure('uncertain', 503));
    expect(state.uncertain()).toBe(true);
    state.submit();
    await state.select(file);
    expect(files.parse).toHaveBeenCalledOnce();
    expect(service.bulkCreate).toHaveBeenCalledOnce();
    await state.clear();
    expect(state.phase()).toBe('idle');
  });
  it('labels rejected duplicate results and does not resubmit failed rows', async () => {
    const { state, command, service } = setup();
    await state.select(file);
    state.submit();
    command.error(new CommandFailure('rejected', 409, {}, ['Country.CountryExists']));
    expect(state.phase()).toBe('failed');
    expect(fixtureItem(state.rows(), 0).status).toBe('failed');
    expect(state.message()).toBe('validation.duplicateValues');
    state.submit();
    expect(service.bulkCreate).toHaveBeenCalledOnce();
  });
  it('latches permission rejection until immutable actor replacement', async () => {
    const { state, command, identity } = setup();
    await state.select(file);
    state.submit();
    command.error(new CommandFailure('rejected', 403));
    expect(state.allowed()).toBe(false);
    expect(state.rows()).toEqual([]);
    identity.set({ ...actor });
    TestBed.tick();
    expect(state.allowed()).toBe(true);
  });
  it('masks a late parse and late command synchronously after actor replacement', async () => {
    const { state, files, identity, command, refresh } = setup();
    let resolve!: (rows: typeof input) => void;
    files.parse.mockImplementation(() => new Promise((r) => (resolve = r)));
    const selecting = state.select(file);
    await Promise.resolve();
    identity.set({ ...actor });
    expect(state.rows()).toEqual([]);
    resolve(input);
    await selecting;
    expect(state.rows()).toEqual([]);
    TestBed.tick();
    files.parse.mockResolvedValue(input);
    await state.select(file);
    state.submit();
    identity.set({ ...actor, tenantReadOnly: true });
    expect(state.rows()).toEqual([]);
    command.next(1);
    expect(refresh).not.toHaveBeenCalled();
    TestBed.tick();
    expect(command.observed).toBe(false);
  });
  it('protects a pending preview on clear with shared discard consent', async () => {
    const { state } = setup();
    await state.select(file);
    const drafts = TestBed.inject(UnsavedChanges),
      clearing = state.clear();
    expect(drafts.prompt()).not.toBeNull();
    drafts.answer(drafts.prompt()!, false);
    await clearing;
    expect(state.rows()).toHaveLength(2);
  });
  it('does not clear or replace during an in-flight submission', async () => {
    const { state, files } = setup();
    await state.select(file);
    state.submit();
    await state.clear();
    await state.select(file);
    expect(state.busy()).toBe(true);
    expect(files.parse).toHaveBeenCalledOnce();
  });
});

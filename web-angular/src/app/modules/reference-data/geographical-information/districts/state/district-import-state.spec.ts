import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../../platform/auth/auth.fixture';
import {
  CommandFailure,
  UnsavedChanges,
  type ReadState,
} from '../../../../../shared/data/public-api';
import { SpreadsheetFiles } from '../../../../../shared/data/spreadsheet-public-api';
import type { StateLookup } from '../../states/lookup.public-api';
import { DistrictService } from '../services/district-service';
import { DistrictReadState } from './district-read-state';
import { DistrictStatesState } from './district-states-state';
import { DistrictImportState } from './district-import-state';

describe('Districts spreadsheet actor, parent and submission lifetime', () => {
  const actor: Session = {
    ...sessionFixture,
    roles: ['super_admin'],
    permissions: ['Districts:View', 'Districts:Create', 'States:View'],
    tenantReadOnly: false,
  };
  const states: readonly StateLookup[] = [
    { id: 1, nameAr: 'مصر', nameEn: 'Egypt', code: 'CAI', countryId: 1 },
  ];
  const input = [
    { rowNumber: 2, values: ['القاهرة', 'Cairo', 'CAI', 'Egypt'] },
    { rowNumber: 3, values: ['القاهرة', 'Cairo', 'CAI', 'Egypt'] },
  ];
  function setup(initial = actor) {
    const identity = signal<Session | null>(initial);
    const command = new Subject<number>();
    const parent = signal<ReadState<readonly StateLookup[]>>({ kind: 'ready', data: states });
    const refresh = vi.fn();
    const service = { bulkCreate: vi.fn((_rows: readonly unknown[]) => command.asObservable()) };
    const files = {
      parse: vi.fn(async () => input),
      template: vi.fn(async () => new Blob(['template'])),
    };
    TestBed.configureTestingModule({
      providers: [
        DistrictImportState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: DistrictService, useValue: service },
        { provide: SpreadsheetFiles, useValue: files },
        { provide: DistrictReadState, useValue: { refresh, source: () => ({ kind: 'ready' }) } },
        { provide: DistrictStatesState, useValue: { view: parent } },
      ],
    });
    const state = TestBed.inject(DistrictImportState);
    TestBed.tick();
    return { state, identity, command, parent, refresh, service, files };
  }
  const file = new File(['fixture'], 'districts.xlsx');
  afterEach(() => TestBed.resetTestingModule());

  it('rechecks exact create/read-only authority for direct file/template/submit callbacks', async () => {
    const { state, files, service } = setup({ ...actor, tenantReadOnly: true });
    await state.select(file);
    await state.download();
    state.submit();
    expect(files.parse).not.toHaveBeenCalled();
    expect(files.template).not.toHaveBeenCalled();
    expect(service.bulkCreate).not.toHaveBeenCalled();
  });
  it('keeps pending rows unvalidated while parent lookup is unavailable, then submits one valid atomic batch', async () => {
    const { state, parent, service, command, refresh } = setup();
    await state.select(file);
    for (const kind of ['loading', 'error', 'forbidden'] as const) {
      parent.set({ kind });
      state.submit();
      expect(state.rows().every((row) => row.status === 'pending')).toBe(true);
      expect(service.bulkCreate).not.toHaveBeenCalled();
    }
    parent.set({ kind: 'ready', data: [] });
    state.submit();
    expect(state.lookupStatus()).toBe('empty');
    expect(service.bulkCreate).not.toHaveBeenCalled();
    parent.set({ kind: 'ready', data: states });
    state.submit();
    state.submit();
    expect(service.bulkCreate).toHaveBeenCalledExactlyOnceWith([
      { nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', stateId: 1 },
    ]);
    expect(state.rows().map((row) => row.status)).toEqual(['submitted', 'invalid']);
    expect(TestBed.inject(UnsavedChanges).busy()).toBe(true);
    command.next(1);
    expect(state.rows().map((row) => row.status)).toEqual(['uploaded', 'invalid']);
    expect(refresh).toHaveBeenCalledOnce();
  });
  it('maps only submitted batch indexes to the original spreadsheet rows', async () => {
    const { state, files, command } = setup();
    files.parse.mockResolvedValue([
      { rowNumber: 2, values: ['', 'Invalid', 'INV', 'Egypt'] },
      { rowNumber: 7, values: ['القاهرة', 'Cairo', 'CAI', 'Egypt'] },
    ]);
    await state.select(file);
    state.submit();
    command.error(
      new CommandFailure('rejected', 400, { 'districts[0].code': 'Code already used' }),
    );
    expect(state.rows()[0]?.status).toBe('invalid');
    expect(state.rows()[1]).toMatchObject({
      rowNumber: 7,
      status: 'failed',
      issues: [{ field: 'code', kind: 'server', message: 'Code already used' }],
    });
  });
  it('locks uncertain dispatched results against replay/replacement until explicit clear', async () => {
    const { state, command, service, files, refresh } = setup();
    await state.select(file);
    state.submit();
    command.error(new CommandFailure('uncertain', 503));
    state.submit();
    await state.select(file);
    expect(state.uncertain()).toBe(true);
    expect(service.bulkCreate).toHaveBeenCalledOnce();
    expect(files.parse).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledOnce();
    await state.clear();
    expect(state.phase()).toBe('idle');
  });
  it('cancels a dispatched subscription and masks file/rows on actor replacement', async () => {
    const { state, identity, command, refresh } = setup();
    await state.select(file);
    state.submit();
    identity.set({ ...actor, userId: 'replacement' });
    expect(state.rows()).toEqual([]);
    expect(state.fileName()).toBe('');
    TestBed.tick();
    expect(command.observed).toBe(false);
    command.next(1);
    expect(refresh).not.toHaveBeenCalled();
  });
});

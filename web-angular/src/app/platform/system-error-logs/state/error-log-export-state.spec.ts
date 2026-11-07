import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { SystemErrorLogService } from '../services/system-error-log-service';
import type { ErrorLogExport } from '../types/error-log';
import { ErrorLogReadState } from './error-log-read-state';
import { ErrorLogExportState } from './error-log-export-state';
import { FeedbackNotifications } from '../../../shared/ui/public-api';

const actor: Session = {
  ...sessionFixture,
  roles: ['super_admin'],
  permissions: ['SystemErrorLogs:View', 'SystemErrorLogs:Export'],
};
describe('error log export state', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('exports full applied criteria once and cancels with its owner', () => {
    const identity = signal<Session | null>(actor),
      response = new Subject<ErrorLogExport>();
    const exportXlsx = vi.fn(() => response.asObservable());
    const criteria = { page: 2, pageSize: 25, source: 'api' as const };
    TestBed.configureTestingModule({
      providers: [
        ErrorLogExportState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        {
          provide: ErrorLogReadState,
          useValue: { canRead: () => true, criteria: () => criteria, deny: vi.fn() },
        },
        { provide: SystemErrorLogService, useValue: { exportXlsx } },
      ],
    });
    const state = TestBed.inject(ErrorLogExportState);
    expect(state.failure()).toBeNull();
    state.request();
    state.request();
    expect(exportXlsx).toHaveBeenCalledTimes(1);
    expect(exportXlsx).toHaveBeenCalledWith(criteria);
    TestBed.resetTestingModule();
    expect(response.observed).toBe(false);
  });
  it('masks obsolete callbacks and a completed old-scope failure', () => {
    const identity = signal<Session | null>(actor),
      criteria = signal({ page: 1, pageSize: 25, source: 'api' as const });
    const first = new Subject<ErrorLogExport>(),
      second = new Subject<ErrorLogExport>();
    const exportXlsx = vi
      .fn()
      .mockReturnValueOnce(first.asObservable())
      .mockReturnValueOnce(second.asObservable());
    TestBed.configureTestingModule({
      providers: [
        ErrorLogExportState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: ErrorLogReadState, useValue: { canRead: () => true, criteria, deny: vi.fn() } },
        { provide: SystemErrorLogService, useValue: { exportXlsx } },
      ],
    });
    const state = TestBed.inject(ErrorLogExportState);
    expect(state.failure()).toBeNull();
    state.request();
    criteria.set({ page: 2, pageSize: 25, source: 'api' });
    state.request();
    first.next({ blob: new Blob(['xlsx']), fileName: 'error-logs.xlsx' });
    first.error(new Error('old failure'));
    expect(state.pending()).toBe(true);
    expect(state.failure()).toBeNull();
    second.error(new Error('current failure'));
    expect(state.failure()).toBeInstanceOf(Error);
    identity.set({ ...actor, userId: 'replacement' });
    expect(state.failure()).toBeNull();
  });
  it('reports a completed authorized export through shared feedback', () => {
    const response = new Subject<ErrorLogExport>();
    const criteria = { page: 1, pageSize: 25 };
    TestBed.configureTestingModule({
      providers: [
        ErrorLogExportState,
        { provide: AuthSession, useValue: { readIdentity: () => actor } },
        { provide: ErrorLogReadState, useValue: { canRead: () => true, criteria: () => criteria } },
        { provide: SystemErrorLogService, useValue: { exportXlsx: () => response.asObservable() } },
      ],
    });
    const state = TestBed.inject(ErrorLogExportState);
    const notices = TestBed.inject(FeedbackNotifications);
    const href = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:synthetic-export');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    try {
      state.request();
      response.next({ blob: new Blob(['xlsx']), fileName: 'error-logs.xlsx' });
      expect(state.pending()).toBe(false);
      expect(notices.toasts()).toContainEqual(
        expect.objectContaining({
          key: 'errorLogs.exported',
          namespace: 'platform-advanced-tools',
        }),
      );
    } finally {
      href.mockRestore();
      revoke.mockRestore();
      click.mockRestore();
    }
  });
});

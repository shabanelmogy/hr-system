import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { SystemErrorLogService } from '../services/system-error-log-service';
import type { ErrorLogDetail } from '../types/error-log';
import { ErrorLogReadState } from './error-log-read-state';
import { ErrorLogDetailState } from './error-log-detail-state';

const actor: Session = {
  ...sessionFixture,
  roles: ['super_admin'],
  permissions: ['SystemErrorLogs:View', 'SystemErrorLogs:ViewDetails'],
};
const row = {
  id: '2b92450e-c383-feee-339f-77cae87a7ad6',
  occurredOnUtc: '2026-10-17T12:00:00Z',
  source: 'api' as const,
  severity: 'error' as const,
  userName: null,
  service: null,
  action: null,
  statusCode: 500,
  durationMs: null,
  correlationId: null,
  summary: 'x',
  client: null,
  browser: null,
  ipAddress: null,
};
describe('error log detail grant boundary', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('keeps list authority after a detail 403 while latching detail only', () => {
    const identity = signal<Session | null>(actor),
      response = new Subject<ErrorLogDetail>(),
      detail = vi.fn(() => response.asObservable());
    const deny = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        ErrorLogDetailState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        {
          provide: ErrorLogReadState,
          useValue: {
            canRead: () => true,
            source: () => ({ kind: 'ready', result: { rows: [row] } }),
            deny,
          },
        },
        { provide: SystemErrorLogService, useValue: { detail } },
      ],
    });
    const state = TestBed.inject(ErrorLogDetailState);
    state.open(row);
    TestBed.tick();
    response.error(new HttpErrorResponse({ status: 403 }));
    TestBed.tick();
    expect(state.view().kind).toBe('forbidden');
    expect(deny).not.toHaveBeenCalled();
    state.close();
    state.open(row);
    TestBed.tick();
    expect(detail).toHaveBeenCalledTimes(1);
  });
});

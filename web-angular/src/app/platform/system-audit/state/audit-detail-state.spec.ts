import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { SystemAuditService } from '../services/system-audit-service';
import type { AuditDetails, AuditItem } from '../types/audit-trail';
import { AuditReadState } from './audit-read-state';
import { AuditDetailState } from './audit-detail-state';

const item: AuditItem = {
  moduleCode: 'hr',
  id: 1,
  entityName: 'Department',
  entityKey: '42',
  entityDisplay: null,
  action: 'Created',
  userId: null,
  userName: null,
  occurredOn: '2026-11-06T07:00:00Z',
  correlationId: null,
  changeCount: 0,
};
describe('Audit detail selection scope', () => {
  afterEach(() => TestBed.resetTestingModule());
  function setup() {
    const identity = signal<Session | null>({
      ...sessionFixture,
      roles: ['super_admin'],
      permissions: ['SystemAuditTrail:View'],
    });
    const rows = signal<readonly AuditItem[]>([item]);
    const denied = signal(false);
    const response = new Subject<AuditDetails>();
    const detail = vi.fn(() => response.asObservable());
    TestBed.configureTestingModule({
      providers: [
        AuditDetailState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        {
          provide: AuditReadState,
          useValue: {
            source: () => ({ kind: 'ready', result: { rows: rows() } }),
            canRead: () => !denied(),
            deny: () => denied.set(true),
          },
        },
        { provide: SystemAuditService, useValue: { detail } },
      ],
    });
    const state = TestBed.inject(AuditDetailState);
    return { state, identity, rows, response, detail };
  }
  it('opens only current composite identities and cancels when the visible page changes', () => {
    const { state, rows, detail, response } = setup();
    state.open({ ...item, moduleCode: 'other' });
    TestBed.tick();
    expect(detail).not.toHaveBeenCalled();
    state.open(item);
    TestBed.tick();
    expect(state.active()).toBe(true);
    expect(detail).toHaveBeenCalledWith({ moduleCode: 'hr', id: 1 });
    rows.set([]);
    expect(state.active()).toBe(false);
    TestBed.tick();
    expect(response.observed).toBe(false);
  });
  it('shows actual details and clears them synchronously on actor replacement', () => {
    const { state, response, identity } = setup();
    state.open(item);
    TestBed.tick();
    response.next({ entry: item, changes: [] });
    TestBed.tick();
    expect(state.view().kind).toBe('ready');
    identity.set(null);
    expect(state.active()).toBe(false);
    expect(state.view().kind).toBe('loading');
  });
  it('prevents denied-actor retry/reopen', () => {
    const { state, response, detail } = setup();
    state.open(item);
    TestBed.tick();
    response.error(new HttpErrorResponse({ status: 403 }));
    TestBed.tick();
    expect(state.active()).toBe(true);
    expect(state.item()).toBeNull();
    expect(state.view().kind).toBe('forbidden');
    state.retry();
    TestBed.tick();
    expect(detail).toHaveBeenCalledTimes(1);
    state.close();
    state.open(item);
    TestBed.tick();
    expect(detail).toHaveBeenCalledTimes(1);
  });
  it('retries a transient detail failure explicitly and cancels a read when closed', () => {
    const { state, response, detail } = setup();
    const retried = new Subject<AuditDetails>();
    detail.mockImplementationOnce(() => response.asObservable());
    detail.mockImplementationOnce(() => retried.asObservable());
    state.open(item);
    TestBed.tick();
    response.error(new HttpErrorResponse({ status: 503 }));
    TestBed.tick();
    expect(state.view().kind).toBe('error');
    state.retry();
    TestBed.tick();
    expect(detail).toHaveBeenCalledTimes(2);
    state.close();
    expect(state.active()).toBe(false);
    TestBed.tick();
    expect(retried.observed).toBe(false);
  });
});

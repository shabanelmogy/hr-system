import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { fixtureItem } from '../../../../testing/fixture-item';
import { sessionFixture } from '../../auth/auth.fixture';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { AdvancedToolService } from '../services/advanced-tool-service';
import type { HealthReport } from '../types/operational-report';
import { operationalAllowed, OperationalReadState } from './operational-read-state';

describe('Operational pages read ownership', () => {
  const actor = signal<Session | null>(null);
  const healthRequests: Subject<HealthReport>[] = [];
  const dashboardRequests: Subject<void>[] = [];
  const health = vi.fn(() => {
    const response = new Subject<HealthReport>();
    healthRequests.push(response);
    return response;
  });
  const hangfire = vi.fn(() => {
    const response = new Subject<void>();
    dashboardRequests.push(response);
    return response;
  });
  let state: OperationalReadState;
  beforeEach(() => {
    actor.set({
      ...sessionFixture,
      roles: ['super_admin'],
      permissions: ['SystemHealth:View', 'Hangfire:View'],
    });
    healthRequests.length = 0;
    dashboardRequests.length = 0;
    health.mockClear();
    hangfire.mockClear();
    TestBed.configureTestingModule({
      providers: [
        OperationalReadState,
        { provide: AuthSession, useValue: { readIdentity: actor } },
        { provide: AdvancedToolService, useValue: { health, hangfire } },
      ],
    });
    state = TestBed.inject(OperationalReadState);
  });
  afterEach(() => TestBed.resetTestingModule());

  it('does not request health or Hangfire for the Swagger page', () => {
    TestBed.tick();
    expect(health).not.toHaveBeenCalled();
    expect(hangfire).not.toHaveBeenCalled();
  });
  it('loads the actual dashboard document and reloads it on refresh', () => {
    state.kind.set('hangfire');
    TestBed.tick();
    expect(state.view()).toEqual({ kind: 'loading' });
    fixtureItem(dashboardRequests, 0).next();
    expect(state.view()).toEqual({ kind: 'ready', data: { type: 'hangfire' } });
    expect(health).not.toHaveBeenCalled();
    state.refresh();
    expect(state.view()).toEqual({ kind: 'loading' });
    expect(hangfire).toHaveBeenCalledTimes(2);
  });
  it('clears the embedded dashboard immediately on permission loss', () => {
    state.kind.set('hangfire');
    TestBed.tick();
    fixtureItem(dashboardRequests, 0).next();
    actor.set({ ...sessionFixture, permissions: [] });
    expect(state.view()).toEqual({ kind: 'forbidden' });
    TestBed.tick();
    expect(fixtureItem(dashboardRequests, 0).observed).toBe(false);
    expect(hangfire).toHaveBeenCalledTimes(1);
  });
  it('denies unauthorized actors without sending any diagnostic request', () => {
    actor.set({ ...sessionFixture, roles: [], permissions: [] });
    state.kind.set('hangfire');
    TestBed.tick();
    expect(state.view()).toEqual({ kind: 'forbidden' });
    expect(hangfire).not.toHaveBeenCalled();
    expect(operationalAllowed(actor(), 'health')).toBe(false);
    expect(
      operationalAllowed({ ...sessionFixture, roles: ['admin'], permissions: [] }, 'health'),
    ).toBe(true);
  });
  it('shows failures and retries instead of embedding a failed response', () => {
    state.kind.set('hangfire');
    TestBed.tick();
    fixtureItem(dashboardRequests, 0).error(new HttpErrorResponse({ status: 503 }));
    expect(state.view()).toEqual({ kind: 'error' });
    state.retry();
    fixtureItem(dashboardRequests, 1).next();
    expect(state.view()).toEqual({ kind: 'ready', data: { type: 'hangfire' } });
  });
  it.each([401, 403])(
    'removes the dashboard on server denial %i and does not retry it',
    (status) => {
      state.kind.set('hangfire');
      TestBed.tick();
      fixtureItem(dashboardRequests, 0).error(new HttpErrorResponse({ status }));
      expect(state.view()).toEqual({ kind: 'forbidden' });
      state.retry();
      TestBed.tick();
      expect(hangfire).toHaveBeenCalledTimes(1);
    },
  );
  it('cancels an obsolete health request when navigating to Hangfire', () => {
    state.kind.set('health');
    TestBed.tick();
    state.kind.set('hangfire');
    expect(state.view()).toEqual({ kind: 'loading' });
    TestBed.tick();
    expect(fixtureItem(healthRequests, 0).observed).toBe(false);
    fixtureItem(healthRequests, 0).next({
      status: 'Healthy',
      entries: [],
      totalDuration: '00:00:01',
    });
    expect(state.view()).toEqual({ kind: 'loading' });
    fixtureItem(dashboardRequests, 0).next();
    expect(state.view()).toEqual({ kind: 'ready', data: { type: 'hangfire' } });
  });
});

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { SystemErrorLogService } from '../services/system-error-log-service';
import type { ErrorLogSettings } from '../types/error-log';
import { systemErrorLogSettingsFixture } from '../error-log.fixture';
import { ErrorLogSettingsState } from './error-log-settings-state';

describe('Independent error-log settings reads', () => {
  afterEach(() => TestBed.resetTestingModule());
  function setup() {
    const actor = {
      ...sessionFixture,
      roles: ['super_admin'],
      permissions: ['ErrorLogSettings:View'],
    };
    const identity = signal<Session | null>(actor);
    const response = new Subject<ErrorLogSettings>();
    const service = { settings: vi.fn(() => response.asObservable()) };
    TestBed.configureTestingModule({
      providers: [
        ErrorLogSettingsState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: SystemErrorLogService, useValue: service },
      ],
    });
    const state = TestBed.inject(ErrorLogSettingsState);
    TestBed.tick();
    return { state, actor, identity, service, response };
  }
  it('reads with settings View alone and immediately masks/cancels an old actor snapshot', () => {
    const { state, response, actor, identity } = setup();
    expect(response.observed).toBe(true);
    response.next(systemErrorLogSettingsFixture);
    expect(state.view().kind).toBe('ready');
    identity.set({ ...actor, permissions: [] });
    expect(state.view().kind).toBe('forbidden');
    TestBed.tick();
    expect(response.observed).toBe(false);
  });
  it('does not retry around an authoritative403 latch', () => {
    const { state, response, service } = setup();
    response.error(new HttpErrorResponse({ status: 403 }));
    TestBed.tick();
    state.retry();
    state.refresh();
    expect(state.view().kind).toBe('forbidden');
    expect(service.settings).toHaveBeenCalledOnce();
  });
});

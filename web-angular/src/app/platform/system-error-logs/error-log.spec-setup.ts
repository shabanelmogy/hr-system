import { signal } from '@angular/core';
import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { provideAppTheme } from '../../../theme/public-api';
import { CollectionRecordFeedback } from '../../shared/ui/public-api';
import { AuthSession, type Session } from '../auth/session.public-api';
import { LocalizationRuntime } from '../localization/public-api';
import { SystemErrorLogService } from './services/system-error-log-service';
import { ErrorLogReadState } from './state/error-log-read-state';
import { ErrorLogDetailState } from './state/error-log-detail-state';
import { ErrorLogExportState } from './state/error-log-export-state';
import { ErrorLogPresentation } from './presentation/error-log-presentation';
import type { ErrorLogCriteria } from './types/error-log';
import { systemErrorLogDetailFixture, systemErrorLogSettingsFixture } from './error-log.fixture';

export async function errorLogUiSetup(actor: Session) {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    media: '',
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }));
  const identity = signal<Session | null>({
    ...actor,
    roles: ['super_admin'],
    permissions: [
      'SystemErrorLogs:View',
      'SystemErrorLogs:ViewDetails',
      'SystemErrorLogs:Export',
      'ErrorLogSettings:View',
    ],
  });
  const row = {
    ...systemErrorLogDetailFixture.entry,
    correlationId: 'fixture-correlation',
    client: 'fixture-client',
    browser: 'fixture-browser',
    summary: 'Raw <script>not HTML</script>',
  };
  const detail = { entry: row, diagnostics: ['Frame <raw> & detail'] };
  const service = {
    list: vi.fn((criteria: ErrorLogCriteria) =>
      of({ items: [row], page: criteria.page, pageSize: criteria.pageSize, totalCount: 1 }),
    ),
    detail: vi.fn(() => of(detail)),
    settings: vi.fn(() => of(systemErrorLogSettingsFixture)),
    exportXlsx: vi.fn(),
  };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideAppTheme(),
      CollectionRecordFeedback,
      ErrorLogReadState,
      ErrorLogDetailState,
      ErrorLogExportState,
      ErrorLogPresentation,
      { provide: AuthSession, useValue: { readIdentity: identity } },
      { provide: SystemErrorLogService, useValue: service },
    ],
  });
  const locale = TestBed.inject(LocalizationRuntime);
  locale.setLanguage('en');
  await locale.loadNamespace('core');
  await locale.loadNamespace('platform-advanced-tools');
  return { identity, service, row, detail, locale };
}
export function resetErrorLogUiTest() {
  TestBed.resetTestingModule();
  vi.unstubAllGlobals();
}

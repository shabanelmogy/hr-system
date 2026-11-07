import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideAppTheme } from '../../../theme/public-api';
import { LocalizationRuntime } from '../localization/public-api';
import { AuditReadState } from './state/audit-read-state';
import { AuditFilterState } from './state/audit-filter-state';
import { AuditDetailState } from './state/audit-detail-state';
import { AuditPresentation } from './presentation/audit-presentation';
import { auditFixture, auditDetailFixture } from './audit.fixture';
import type { AuditFilters } from './types/audit-criteria';
import { emptyAuditFilters } from './types/audit-criteria';
import type { ReadState } from '../../shared/data/public-api';
import type { AuditDetails, AuditModuleFilter } from './types/audit-trail';

export async function auditTestSetup(beforeInject?: () => void) {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const filters = signal<AuditFilters>(emptyAuditFilters);
  const query = { scopeKey: 'audit-test', criteriaKey: 'all', pageIndex: 0, pageSize: 50 };
  const optionView = signal<ReadState<readonly AuditModuleFilter[]>>({
    kind: 'ready',
    data: [
      { moduleCode: 'hr', entityNames: ['Department', 'JobTitle'] },
      { moduleCode: 'reference-data', entityNames: ['Country'] },
    ],
  });
  const detailView = signal<ReadState<AuditDetails>>({ kind: 'ready', data: auditDetailFixture });
  const invalid = signal<'range' | null>(null),
    active = signal(true);
  const reads = {
    source: () =>
      ({
        kind: 'ready',
        query,
        result: { query, rows: [auditFixture], total: null, hasNextPage: false },
      }) as const,
    filters,
    invalid,
    pending: () => false,
    pageError: () => false,
    canRead: () => true,
    exportSource: () => null,
    columnFilters: () => [],
    changeColumnFilters: vi.fn(),
    searchDraft: () => '',
    patchFilters: vi.fn(),
    changePage: vi.fn(),
    changeSearch: vi.fn(),
    retry: vi.fn(),
    refresh: vi.fn(),
  };
  const options = {
    view: optionView,
    modules: () => {
      const view = optionView();
      return view.kind === 'ready' ? view.data : [];
    },
    refresh: vi.fn(),
  };
  const detail = {
    view: detailView,
    active,
    item: () => (detailView().kind === 'forbidden' ? null : auditFixture),
    open: vi.fn(),
    close: vi.fn(),
    retry: vi.fn(),
  };
  const providers = [
    provideAppTheme(),
    AuditPresentation,
    { provide: AuditReadState, useValue: reads },
    { provide: AuditFilterState, useValue: options },
    { provide: AuditDetailState, useValue: detail },
  ];
  TestBed.configureTestingModule({ providers });
  beforeInject?.();
  const locale = TestBed.inject(LocalizationRuntime);
  locale.setLanguage('en');
  await locale.loadNamespace('core');
  await locale.loadNamespace('platform-advanced-tools');
  return { filters, invalid, reads, options, detail, optionView, detailView, active, providers };
}

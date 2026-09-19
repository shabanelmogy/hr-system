import type { FiscalYearPageQuery } from '../../domain/models/fiscal-year';

export const fiscalYearKeys = {
  all: ['fiscal-years'] as const,
  list: (query: FiscalYearPageQuery) => [...fiscalYearKeys.all, 'list', query] as const,
  detail: (id: number) => [...fiscalYearKeys.all, 'detail', id] as const,
  lookup: () => [...fiscalYearKeys.all, 'lookup'] as const,
};

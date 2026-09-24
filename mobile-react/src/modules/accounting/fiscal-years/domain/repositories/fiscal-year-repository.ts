import type {
  FiscalYearDetail,
  FiscalYearLifecycleAction,
  FiscalYearLookup,
  FiscalYearPage,
  FiscalYearPageQuery,
  FiscalYearRequest,
} from '../models/fiscal-year';

export interface FiscalYearRepository {
  getPage(query: FiscalYearPageQuery): Promise<FiscalYearPage>;
  getById(id: number): Promise<FiscalYearDetail>;
  getLookup(): Promise<FiscalYearLookup[]>;
  create(request: FiscalYearRequest): Promise<FiscalYearDetail>;
  update(id: number, request: FiscalYearRequest, rowVersion: string): Promise<FiscalYearDetail>;
  archive(id: number, rowVersion: string): Promise<void>;
  restore(id: number, rowVersion: string): Promise<FiscalYearDetail>;
  lifecycle(id: number, rowVersion: string, action: FiscalYearLifecycleAction): Promise<FiscalYearDetail>;
}

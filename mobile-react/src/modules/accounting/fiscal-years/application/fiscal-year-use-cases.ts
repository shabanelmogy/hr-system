import type {
  FiscalYearDetail,
  FiscalYearLifecycleAction,
  FiscalYearLookup,
  FiscalYearPage,
  FiscalYearPageQuery,
  FiscalYearRequest,
} from '../domain/models/fiscal-year';
import { normalizeFiscalYearRequest } from '../domain/policies/fiscal-year-request-policy';
import type { FiscalYearRepository } from '../domain/repositories/fiscal-year-repository';

export interface SaveFiscalYearInput {
  id: number | null;
  request: FiscalYearRequest;
  rowVersion?: string;
}

export interface FiscalYearUseCases {
  getPage(query: FiscalYearPageQuery): Promise<FiscalYearPage>;
  getById(id: number): Promise<FiscalYearDetail>;
  getLookup(): Promise<FiscalYearLookup[]>;
  create(request: FiscalYearRequest): Promise<FiscalYearDetail>;
  update(id: number, request: FiscalYearRequest, rowVersion: string): Promise<FiscalYearDetail>;
  save(input: SaveFiscalYearInput): Promise<FiscalYearDetail>;
  archive(id: number, rowVersion: string): Promise<void>;
  restore(id: number, rowVersion: string): Promise<FiscalYearDetail>;
  lifecycle(id: number, rowVersion: string, action: FiscalYearLifecycleAction): Promise<FiscalYearDetail>;
}

export function createFiscalYearUseCases(repository: FiscalYearRepository): FiscalYearUseCases {
  const create = (request: FiscalYearRequest) => repository.create(normalizeFiscalYearRequest(request));
  const update = (id: number, request: FiscalYearRequest, rowVersion: string) =>
    repository.update(id, normalizeFiscalYearRequest(request), rowVersion);

  return {
    getPage: (query) => repository.getPage(query),
    getById: (id) => repository.getById(id),
    getLookup: () => repository.getLookup(),
    create,
    update,
    save: ({ id, request, rowVersion }) => {
      if (id === null) return create(request);
      if (!rowVersion) throw new Error('Fiscal year rowVersion is required for update.');
      return update(id, request, rowVersion);
    },
    archive: (id, rowVersion) => repository.archive(id, rowVersion),
    restore: (id, rowVersion) => repository.restore(id, rowVersion),
    lifecycle: (id, rowVersion, action) => repository.lifecycle(id, rowVersion, action),
  };
}

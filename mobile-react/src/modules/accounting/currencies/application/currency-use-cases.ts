import type { Currency, CurrencyLookup, CurrencyPage, CurrencyPageQuery, CurrencyRequest } from '../domain/models/currency';
import { normalizeCurrencyRequest } from '../domain/policies/currency-request-policy';
import type { CurrencyRepository } from '../domain/repositories/currency-repository';

export interface SaveCurrencyInput { id: number | null; request: CurrencyRequest; rowVersion?: string }

export interface CurrencyUseCases {
  getPage(query: CurrencyPageQuery): Promise<CurrencyPage>;
  getById(id: number): Promise<Currency>;
  getLookup(): Promise<CurrencyLookup[]>;
  save(input: SaveCurrencyInput): Promise<Currency>;
  archive(id: number, rowVersion: string): Promise<void>;
  restore(id: number, rowVersion: string): Promise<Currency>;
}

export function createCurrencyUseCases(repository: CurrencyRepository): CurrencyUseCases {
  return {
    getPage: (query) => repository.getPage(query),
    getById: (id) => repository.getById(id),
    getLookup: () => repository.getLookup(),
    save: ({ id, request, rowVersion }) => {
      const normalized = normalizeCurrencyRequest(request);
      if (id === null) return repository.create(normalized);
      if (!rowVersion) throw new Error('Currency rowVersion is required for update.');
      return repository.update(id, normalized, rowVersion);
    },
    archive: (id, rowVersion) => repository.archive(id, rowVersion),
    restore: (id, rowVersion) => repository.restore(id, rowVersion),
  };
}

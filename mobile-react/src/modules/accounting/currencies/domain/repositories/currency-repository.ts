import type { Currency, CurrencyLookup, CurrencyPage, CurrencyPageQuery, CurrencyRequest } from '../models/currency';

export interface CurrencyRepository {
  getPage(query: CurrencyPageQuery): Promise<CurrencyPage>;
  getById(id: number): Promise<Currency>;
  getLookup(): Promise<CurrencyLookup[]>;
  create(request: CurrencyRequest): Promise<Currency>;
  update(id: number, request: CurrencyRequest, rowVersion: string): Promise<Currency>;
  archive(id: number, rowVersion: string): Promise<void>;
  restore(id: number, rowVersion: string): Promise<Currency>;
}

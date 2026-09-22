import type { CurrencyPageQuery } from '../../domain/models/currency';

export const currencyKeys = {
  all: ['currencies'] as const,
  list: (query: CurrencyPageQuery) => [...currencyKeys.all, 'list', query] as const,
  detail: (id: number) => [...currencyKeys.all, 'detail', id] as const,
  lookup: () => [...currencyKeys.all, 'lookup'] as const,
};

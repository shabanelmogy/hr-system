import type { CurrencyRequest } from '../models/currency';

export function normalizeCurrencyRequest(request: CurrencyRequest): CurrencyRequest {
  return {
    currencyCode: request.currencyCode.trim().toUpperCase(),
    nameEn: request.nameEn.trim(),
    nameAr: request.nameAr.trim(),
    symbol: request.symbol.trim(),
  };
}

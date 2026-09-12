import type { FiscalYearRequest } from '../models/fiscal-year';

export function normalizeFiscalYearRequest(request: FiscalYearRequest): FiscalYearRequest {
  return {
    ...request,
    code: request.code.trim().toUpperCase(),
    nameAr: request.nameAr.trim(),
    nameEn: request.nameEn.trim(),
  };
}

import type { FiscalYearRequest } from '../models/fiscal-year';

export function createFiscalYearMockData(year = new Date().getFullYear() + 1): FiscalYearRequest {
  return {
    code: `FY-${year}`,
    nameAr: `السنة المالية ${year}`,
    nameEn: `Fiscal Year ${year}`,
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
    periodFrequency: 1,
  };
}

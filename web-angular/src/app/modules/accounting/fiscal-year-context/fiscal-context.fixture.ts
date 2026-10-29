import type { FiscalContext } from './types/fiscal-context';
const first={id:1,code:'FY-2026',nameAr:'السنة 2026',nameEn:'Year 2026',startDate:'2026-01-01',endDate:'2026-12-31',status:2,isCurrent:true};
const second={...first,id:2,code:'FY-2027',nameAr:'السنة 2027',nameEn:'Year 2027',startDate:'2027-01-01',endDate:'2027-12-31',status:1,isCurrent:false};
export const fiscalContextFixture:FiscalContext={companyCurrentFiscalYear:first,selectedFiscalYear:first,hasUserOverride:false,availableFiscalYears:[first,second]};

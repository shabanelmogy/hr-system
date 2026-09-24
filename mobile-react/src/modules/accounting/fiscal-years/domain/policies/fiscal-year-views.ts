export const fiscalYearViewValues = ['table', 'cards', 'report'] as const;
export type FiscalYearView = (typeof fiscalYearViewValues)[number];

export function getFiscalYearViews(canViewReports: boolean): FiscalYearView[] {
  return canViewReports ? [...fiscalYearViewValues] : ['table', 'cards'];
}

export function isFiscalYearView(value: string, canViewReports: boolean): value is FiscalYearView {
  return getFiscalYearViews(canViewReports).includes(value as FiscalYearView);
}

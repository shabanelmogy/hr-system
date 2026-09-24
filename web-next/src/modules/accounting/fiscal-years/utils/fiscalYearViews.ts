export const fiscalYearViewValues = ["grid", "cards", "report"] as const;

export type FiscalYearView = (typeof fiscalYearViewValues)[number];

export function getFiscalYearViews(canViewReports: boolean): FiscalYearView[] {
  return canViewReports ? [...fiscalYearViewValues] : ["grid", "cards"];
}

export function isFiscalYearView(value: string, canViewReports: boolean): value is FiscalYearView {
  return (getFiscalYearViews(canViewReports) as readonly string[]).includes(value);
}

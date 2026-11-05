import { reportFilterText, reportFilterLimit } from '../types/global-report';
export const reportFilterErrors = (value: string) => reportFilterText.safeParse(value).success ? undefined : { kind: 'maxlength', requiredLength: reportFilterLimit };

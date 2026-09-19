import type { FiscalYearLifecycleAction, FiscalYearStatus } from '../models/fiscal-year';

const actionsByStatus: Readonly<Record<FiscalYearStatus, readonly FiscalYearLifecycleAction[]>> = {
  1: ['open'],
  2: ['beginClosing'],
  3: ['close'],
  4: ['reopen', 'lock'],
  5: ['reopen'],
};

export function getAvailableFiscalYearLifecycleActions(status: FiscalYearStatus): readonly FiscalYearLifecycleAction[] {
  return actionsByStatus[status];
}

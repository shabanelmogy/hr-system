import type { FiscalPeriodFrequency } from '../types/fiscal-year';

export interface FiscalPeriodPreview {
  sequence: number;
  code: string;
  startDate: string;
  endDate: string;
}

const iso = (date: Date) => date.toISOString().slice(0, 10);

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function addMonthsClamped(date: Date, months: number) {
  const targetMonth = date.getUTCMonth() + months;
  const targetYear = date.getUTCFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(targetYear, normalizedMonth, Math.min(date.getUTCDate(), lastDay)));
}

export function endOfFiscalYear(startDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`);
  if (!startDate || Number.isNaN(start.valueOf())) return '';
  return iso(addDays(addMonthsClamped(start, 12), -1));
}

export function buildFiscalPeriodPreview(
  code: string,
  startDate: string,
  frequency: FiscalPeriodFrequency,
): FiscalPeriodPreview[] {
  const firstStart = new Date(`${startDate}T00:00:00Z`);
  const fiscalEnd = endOfFiscalYear(startDate);
  if (!startDate || !fiscalEnd || Number.isNaN(firstStart.valueOf())) return [];

  const monthsPerPeriod = frequency === 1 ? 1 : 3;
  const count = 12 / monthsPerPeriod;
  const normalizedCode = code.trim().toUpperCase() || 'FY';
  const periods: FiscalPeriodPreview[] = [];
  let periodStart = firstStart;

  for (let index = 0; index < count; index += 1) {
    const sequence = index + 1;
    const periodEnd = sequence === count
      ? new Date(`${fiscalEnd}T00:00:00Z`)
      : addDays(addMonthsClamped(periodStart, monthsPerPeriod), -1);
    periods.push({
      sequence,
      code: `${normalizedCode}-P${String(sequence).padStart(2, '0')}`,
      startDate: iso(periodStart),
      endDate: iso(periodEnd),
    });
    periodStart = addDays(periodEnd, 1);
  }

  return periods;
}

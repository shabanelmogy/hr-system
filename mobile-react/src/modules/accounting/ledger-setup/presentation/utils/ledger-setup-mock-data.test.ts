import type { LedgerSetupField } from '../../domain/models/ledger-setup';
import { canCreateLedgerSetupMockDraft, createLedgerSetupMockDraft } from './ledger-setup-mock-data';

const exchangeRateFields: readonly LedgerSetupField[] = [
  { name: 'exchangeRateTypeId', labelKey: 'type', type: 'select', optionSource: 'exchangeRateTypes', required: true },
  { name: 'fromCurrencyId', labelKey: 'from', type: 'select', optionSource: 'currencies', required: true },
  { name: 'toCurrencyId', labelKey: 'to', type: 'select', optionSource: 'currencies', required: true },
  { name: 'effectiveFrom', labelKey: 'from date', type: 'date', required: true },
  { name: 'effectiveTo', labelKey: 'to date', type: 'date' },
  { name: 'version', labelKey: 'version', type: 'number', required: true },
  { name: 'rate', labelKey: 'rate', type: 'number', required: true },
];

describe('generic ledger setup mock drafts', () => {
  it('uses only real lookup IDs and distinct currencies', () => {
    expect(createLedgerSetupMockDraft({
      fields: exchangeRateFields,
      lookups: { exchangeRateTypes: [{ id: 8 }], currencies: [{ id: 10 }, { id: 11 }] },
      sequence: 4,
      today: '2026-09-23',
    })).toEqual({ exchangeRateTypeId: 8, fromCurrencyId: 10, toCurrencyId: 11, effectiveFrom: '2026-09-23', effectiveTo: undefined, version: 1, rate: 1 });
  });

  it('disables generation without required lookups or a distinct currency pair', () => {
    expect(canCreateLedgerSetupMockDraft(exchangeRateFields, { exchangeRateTypes: [{ id: 8 }], currencies: [{ id: 10 }] })).toBe(false);
    expect(canCreateLedgerSetupMockDraft(exchangeRateFields, { exchangeRateTypes: [], currencies: [{ id: 10 }, { id: 11 }] })).toBe(false);
  });

  it('produces booleans instead of numeric option values', () => {
    const fields: readonly LedgerSetupField[] = [{ name: 'canPost', labelKey: 'posting', type: 'boolean', options: [{ value: 1, labelKey: 'yes' }], required: true }];
    expect(createLedgerSetupMockDraft({ fields, lookups: {}, sequence: 1 })).toEqual({ canPost: true });
  });
});

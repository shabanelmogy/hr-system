import { createLedgerSetupSchema } from './ledger-setup-schema';

describe('Ledger Setup account validation', () => {
  const schema = createLedgerSetupSchema([
    { name: 'currencyPolicy', labelKey: 'currencyPolicy', type: 'select', required: true },
    { name: 'specificCurrencyId', labelKey: 'specificCurrencyId', type: 'select' },
    { name: 'priority', labelKey: 'priority', type: 'number', required: true },
  ], 'Required');

  it('requires a currency only for the specific policy and accepts priority zero', () => {
    expect(schema.safeParse({ currencyPolicy: 3, specificCurrencyId: '', priority: '0' }).success).toBe(false);
    expect(schema.safeParse({ currencyPolicy: 3, specificCurrencyId: 8, priority: '0' }).success).toBe(true);
    expect(schema.safeParse({ currencyPolicy: 1, specificCurrencyId: '', priority: '0' }).success).toBe(true);
  });
});

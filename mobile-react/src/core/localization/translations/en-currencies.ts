export const enCurrencies = {
  currencies: {
    title: 'Currencies',
    empty: 'No currencies match the current search and filters.',
    fields: { currencyCode: 'Currency code', nameAr: 'Arabic name', nameEn: 'English name', symbol: 'Symbol', status: 'Status' },
    recordStatus: { active: 'Active records', archived: 'Archived records', all: 'All records' },
    search: {
      placeholder: 'Search currencies',
      fields: { all: 'All columns', currencyCode: 'Currency code', nameAr: 'Arabic name', nameEn: 'English name', symbol: 'Symbol' },
      operators: { contains: 'Contains', doesNotContain: 'Does not contain', equals: 'Equals', doesNotEqual: 'Does not equal', startsWith: 'Starts with', endsWith: 'Ends with' },
    },
    filters: { title: 'Currency filters', description: 'Filter the company currency catalog by record status and searchable fields.', recordStatus: 'Record status', searchField: 'Search column', operator: 'Condition' },
    actions: { add: 'Add currency' },
    form: { createTitle: 'Add Currency', editTitle: 'Edit Currency', viewTitle: 'Currency Details', subtitle: 'Maintain the company currency catalog used by accounting and operational currency snapshots.', identity: 'Currency identity' },
    validation: { code: 'Enter exactly three English letters.', name: 'Enter a name of up to 100 characters.', symbol: 'Enter a symbol of up to 10 characters.' },
    messages: { created: 'Currency created.', updated: 'Currency updated.', archive: 'Currency archived.', restore: 'Currency restored.', loadFailed: 'Unable to load currencies.', saveFailed: 'Unable to save the currency.', actionFailed: 'Unable to complete the currency action.' },
    confirm: { archiveTitle: 'Archive currency?', archiveDescription: 'Archive {{code}}. Accounting references may block this action.', restoreTitle: 'Restore currency?', restoreDescription: 'Restore {{code}} to the active company currency catalog.' },
  },
};

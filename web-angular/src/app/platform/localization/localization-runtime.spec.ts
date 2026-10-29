import { TestBed } from '@angular/core/testing';
import { uiCatalogVersion } from './catalog.generated';
import { LocalizationRuntime } from './localization-runtime';
import type { LocalizationIdentity } from './localization.types';

const identity: LocalizationIdentity = { userId: 'u', tenantId: 't', companyId: 1, roles: ['user'], permissions: [] };
const bundle = (overrides: unknown[] = []) => ({ tenantId: 't', companyId: 1, defaultLanguage: 'ar', revision: 1, catalogVersion: uiCatalogVersion, overrides });
const entry = (value: string, key = 'general.mainTitle', namespace = 'core') => ({ namespace, key, language: 'en', value });

describe('SQL-backed UI translation runtime adapter', () => {
  let runtime: LocalizationRuntime;
  beforeEach(() => {
    document.cookie = 'i18next=; Path=/; Max-Age=0';
    TestBed.configureTestingModule({}); runtime = TestBed.inject(LocalizationRuntime);
  });

  it('applies company data over shipped text and restores baseline synchronously on transition', () => {
    runtime.setLanguage('en');
    const generation = runtime.transition(identity);
    expect(runtime.applyCompany(bundle([entry('Stored SQL caption')]), generation)).toBe(true);
    expect(runtime.translate('general.mainTitle')).toBe('Stored SQL caption');
    runtime.transition({ ...identity, companyId: 2 });
    expect(runtime.translate('general.mainTitle')).toBe('ERP System');
    expect(runtime.applyCompany(bundle([entry('Late old company')]), generation)).toBe(false);
  });

  it('honors explicit preference over company default and updates document direction', () => {
    const generation = runtime.transition(identity);
    runtime.applyCompany(bundle(), generation);
    expect(runtime.language()).toBe('ar'); expect(document.documentElement.dir).toBe('rtl');
    runtime.setLanguage('en'); runtime.applyCompany(bundle(), generation);
    expect(runtime.language()).toBe('en'); expect(document.documentElement.lang).toBe('en');
    runtime.setLanguage(null); expect(runtime.language()).toBe('ar');
  });

  it('rejects wrong company/catalog and malformed responses', () => {
    const generation = runtime.transition(identity);
    expect(runtime.applyCompany({ ...bundle(), companyId: 2 }, generation)).toBe(false);
    expect(runtime.applyCompany({ ...bundle(), catalogVersion: 'different' }, generation)).toBe(false);
    expect(() => runtime.applyCompany({ overrides: [] }, generation)).toThrow();
  });

  it('retains compatible overrides when their lazy namespace is registered later', async () => {
    runtime.setLanguage('en'); const generation = runtime.transition(identity);
    // Fixture namespace models delayed baseline registration. Production baselines
    // are generated exclusively from the registered catalog.
    runtime.applyCompany(bundle([entry('Stored client', 'client.name', 'crm')]), generation);
    runtime.register('crm', { en: { 'client.name': 'Name' }, ar: { 'client.name': 'اسم' } });
    runtime.register('crm', { en: { 'client.name': 'Later baseline' }, ar: { 'client.name': 'لاحق' } });
    expect(runtime.translate('client.name', 'crm')).toBe('Stored client');
    await runtime.loadNamespace('platform-auth');
    expect(runtime.translate('general.mainTitle')).toBe('ERP System');
  });

  it('denies system/private keys from company overrides and preserves placeholders', () => {
    runtime.setLanguage('en'); const generation = runtime.transition(identity);
    runtime.register('crm', { en: { greeting: 'Hello {{name}}' }, ar: { greeting: 'أهلا {{name}}' } });
    runtime.applyCompany(bundle([entry('Private', 'menu.countries'), entry('No variable', 'greeting', 'crm')]), generation);
    expect(runtime.translate('menu.countries')).not.toBe('Private');
    expect(runtime.translate('greeting', 'crm', { name: 'Ali' })).toBe('Hello Ali');
  });

  it('expands the small bootstrap namespace without losing accepted database overrides', async () => {
    runtime.setLanguage('en');
    const generation = runtime.transition(identity);
    runtime.applyCompany(bundle([entry('Stored application title')]), generation);
    await runtime.loadNamespace('core');
    expect(runtime.translate('general.mainTitle')).toBe('Stored application title');
    expect(runtime.translate('menu.countries')).not.toBe('menu.countries');
    runtime.transition(null);
    expect(runtime.translate('general.mainTitle')).toBe('ERP System');
  });

  it('applies global text only for super_admin with target authority and clears on permission transition', () => {
    runtime.setLanguage('en');
    runtime.register('reference-countries', { en: { CountryName: 'Country' }, ar: { CountryName: 'دولة' } });
    const data = { revision: 1, catalogVersion: uiCatalogVersion, overrides: [entry('SQL Country', 'CountryName', 'reference-countries')] };
    const companyGeneration = runtime.transition(identity);
    expect(runtime.applySystem(data, companyGeneration)).toBe(false);
    const admin = { ...identity, roles: ['super_admin'], permissions: ['Countries:View'] };
    const generation = runtime.transition(admin);
    expect(runtime.applySystem(data, generation)).toBe(true);
    expect(runtime.translate('CountryName', 'reference-countries')).toBe('SQL Country');
    const changed = runtime.transition({ ...admin, permissions: [] });
    runtime.applySystem(data, changed);
    expect(runtime.translate('CountryName', 'reference-countries')).toBe('Country');
    expect(runtime.applySystem(data, generation)).toBe(false);
  });
});

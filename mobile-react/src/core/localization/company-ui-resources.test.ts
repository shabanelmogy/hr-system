import i18n from './i18n';
import { applySystemUiResources, clearSystemUiResources, applyCompanyUiResources, clearCompanyUiResources, companyUiGeneration,
  getResolvedCompanyUiLanguage, restoreCompanyUiResources, setExplicitCompanyUiLanguage } from './company-ui-resources';

describe('company UI resource isolation', () => {
  beforeEach(() => { setExplicitCompanyUiLanguage(null); clearCompanyUiResources(); });
  afterEach(() => { setExplicitCompanyUiLanguage(null); clearCompanyUiResources(); });

  it('applies only registered leaves, preserves interpolation, and restores originals on company transition', () => {
    const original = i18n.t('companyLocalizations.title', { lng: 'en' });
    const generation = companyUiGeneration();
    expect(applyCompanyUiResources([
      { namespace: 'translation', language: 'en', key: 'companyLocalizations.title', value: 'Company A' },
      { namespace: 'other', language: 'en', key: 'companyLocalizations.title', value: 'Wrong namespace' },
      { namespace: 'translation', language: 'en', key: 'companyLocalizations.notRegistered', value: 'Unknown' },
      { namespace: 'translation', language: 'en', key: '__proto__.polluted', value: 'Unsafe' },
    ], 'ar', generation)).toBe(true);
    expect(i18n.t('companyLocalizations.title', { lng: 'en' })).toBe('Company A');
    expect(i18n.exists('companyLocalizations.notRegistered', { lng: 'en' })).toBe(false);
    expect(getResolvedCompanyUiLanguage()).toBe('ar');
    clearCompanyUiResources();
    expect(i18n.t('companyLocalizations.title', { lng: 'en' })).toBe(original);
    expect(getResolvedCompanyUiLanguage()).toBe('en');
    expect(applyCompanyUiResources([{ namespace: 'translation', language: 'en', key: 'companyLocalizations.title', value: 'Late A' }], 'ar', generation)).toBe(false);
    expect(i18n.t('companyLocalizations.title', { lng: 'en' })).toBe(original);
  });

  it('retains an explicit preference across defaults and restores fallback after a runtime error', () => {
    const generation = companyUiGeneration();
    setExplicitCompanyUiLanguage('en');
    applyCompanyUiResources([], 'ar', generation);
    expect(getResolvedCompanyUiLanguage()).toBe('en');
    setExplicitCompanyUiLanguage(null);
    expect(getResolvedCompanyUiLanguage()).toBe('ar');
    restoreCompanyUiResources(generation);
    expect(companyUiGeneration()).toBe(generation);
    expect(getResolvedCompanyUiLanguage()).toBe('en');
  });

  it('excludes system-owned countries and super-admin strings while permitting shared and company text', () => {
    const originalCountries = i18n.t('countries.title', { lng: 'en' });
    const originalSuperAdmin = i18n.t('superAdminDashboard.title', { lng: 'en' });
    const generation = companyUiGeneration();
    applyCompanyUiResources([
      { namespace: 'translation', language: 'en', key: 'countries.title', value: 'Changed countries' },
      { namespace: 'translation', language: 'en', key: 'superAdminDashboard.title', value: 'Changed admin' },
      { namespace: 'translation', language: 'en', key: 'common.save', value: 'Company save' },
      { namespace: 'translation', language: 'en', key: 'userPermissions.title', value: 'Company permissions' },
      { namespace: 'translation', language: 'en', key: 'addressTypes.title', value: 'Company address types' },
    ], 'en', generation);
    expect(i18n.t('countries.title', { lng: 'en' })).toBe(originalCountries);
    expect(i18n.t('superAdminDashboard.title', { lng: 'en' })).toBe(originalSuperAdmin);
    expect(i18n.t('common.save', { lng: 'en' })).toBe('Company save');
    expect(i18n.t('userPermissions.title', { lng: 'en' })).toBe('Company permissions');
    expect(i18n.t('addressTypes.title', { lng: 'en' })).toBe('Company address types');
  });
});

it('global layers require the target screen, preserve company layers and clear on auth transition',()=>{
 const original=i18n.t('countries.title',{lng:'en'});const privateTitle=i18n.t('userManagement.title',{lng:'en'});const originalTitle=i18n.t('systemUiTexts.title',{lng:'en'});const generation=companyUiGeneration();
 applyCompanyUiResources([{namespace:'translation',language:'en',key:'companyLocalizations.title',value:'Company overlay'}],'en',generation);
 const entries=[{namespace:'translation',language:'en' as const,key:'systemUiTexts.title',value:'Global titles'},{namespace:'translation',language:'en' as const,key:'userManagement.title',value:'Private'}];
 applySystemUiResources(entries,[],generation);expect(i18n.t('systemUiTexts.title',{lng:'en'})).toBe(originalTitle);
 applySystemUiResources(entries,['SystemUiTexts:View'],generation);expect(i18n.t('systemUiTexts.title',{lng:'en'})).toBe('Global titles');expect(i18n.t('userManagement.title',{lng:'en'})).toBe(privateTitle);
 clearSystemUiResources();expect(i18n.t('systemUiTexts.title',{lng:'en'})).toBe(originalTitle);
 expect(i18n.t('companyLocalizations.title',{lng:'en'})).toBe('Company overlay');expect(i18n.t('countries.title',{lng:'en'})).toBe(original);clearCompanyUiResources();expect(applySystemUiResources(entries,['SystemUiTexts:View'],generation)).toBe(false);
});

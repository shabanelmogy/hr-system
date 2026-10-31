import { TestBed } from '@angular/core/testing';
import { PrimeNG } from 'primeng/config';
import { provideAppTheme } from './provide-theme';
import { CalendarLocale } from './calendar-locale';
import { LocalizationRuntime } from '../app/platform/localization/public-api';
import { uiCatalogVersion } from '../app/platform/localization/catalog.generated';

describe('SQL-backed calendar captions',()=>{
 // Angular's installed Vitest executor shares a JSDOM environment between files.
 // These English baseline/override assertions must establish their own preference.
 beforeEach(()=>{TestBed.configureTestingModule({providers:[provideAppTheme()]});TestBed.inject(LocalizationRuntime).setLanguage('en');});
 afterEach(()=>{TestBed.inject(LocalizationRuntime).setLanguage('en');document.cookie='i18next=; Path=/; Max-Age=0';});
 it('tracks language while preserving unrelated PrimeNG translations',async()=>{
  const locale=TestBed.inject(LocalizationRuntime),prime=TestBed.inject(PrimeNG);await locale.loadNamespace('core');prime.setTranslation({emptyMessage:'Retained fixture'});TestBed.inject(CalendarLocale);TestBed.tick();
  expect(prime.getTranslation('monthNames')[1]).toBe('February');expect(prime.getTranslation('emptyMessage')).toBe('Retained fixture');locale.setLanguage('ar');TestBed.tick();expect(prime.getTranslation('monthNames')[1]).toBe('فبراير');expect(prime.getTranslation('chooseDate')).toBe('اختيار التاريخ');expect(prime.getTranslation('emptyMessage')).toBe('Retained fixture');locale.setLanguage('en');
 });
 it('applies and clears scoped SQL overrides without copying another locale dictionary',async()=>{
  const locale=TestBed.inject(LocalizationRuntime),prime=TestBed.inject(PrimeNG);await locale.loadNamespace('core');TestBed.inject(CalendarLocale);const generation=locale.transition({userId:'fixture-user',tenantId:'tenant-one',companyId:1,roles:[],permissions:[]});
  expect(locale.applyCompany({catalogVersion:uiCatalogVersion,tenantId:'tenant-one',companyId:1,revision:1,defaultLanguage:'en',overrides:[{namespace:'core',key:'dateField.month2',language:'en',value:'Scoped February'}]},generation)).toBe(true);TestBed.tick();expect(prime.getTranslation('monthNames')[1]).toBe('Scoped February');locale.clearOverrides(generation);TestBed.tick();expect(prime.getTranslation('monthNames')[1]).toBe('February');
 });
});

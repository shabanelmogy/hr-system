import { TestBed } from '@angular/core/testing';
import { PrimeNG } from 'primeng/config';
import { provideAppTheme } from './public-api';
import { GridLocale } from './grid-locale';
import { LocalizationRuntime } from '../app/platform/localization/public-api';
describe('Native Table filter captions',()=>{
 afterEach(()=>{TestBed.inject(LocalizationRuntime).setLanguage('en');TestBed.resetTestingModule();document.cookie='i18next=; Path=/; Max-Age=0';});
 it('tracks the current translation revision without replacing unrelated PrimeNG captions',async()=>{
  TestBed.configureTestingModule({providers:[provideAppTheme()]});const runtime=TestBed.inject(LocalizationRuntime);await runtime.loadNamespace('core');
  const prime=TestBed.inject(PrimeNG);prime.setTranslation({today:'Existing calendar caption'});TestBed.inject(GridLocale);
  runtime.setLanguage('en');TestBed.tick();expect(prime.getTranslation('apply')).toBe('Apply');expect(prime.getTranslation('matchAny')).toBe('Match any');
  runtime.setLanguage('ar');TestBed.tick();expect(prime.getTranslation('apply')).toBe('تطبيق');expect(prime.getTranslation('matchAny')).toBe('مطابقة أي شرط');expect(prime.getTranslation('today')).toBe('Existing calendar caption');
 });
});

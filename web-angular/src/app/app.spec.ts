import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { LocalizationRuntime, UiTextPipe } from './platform/localization/public-api';
import { uiCatalogVersion } from './platform/localization/catalog.generated';

@Component({ imports: [UiTextPipe], template: '<h1>{{ "general.mainTitle" | uiText }}</h1>' })
class RoutedTitle {}

describe('App router outlet', () => {
  afterEach(() => { document.cookie = 'i18next=; Path=/; Max-Age=0'; });
  beforeEach(async () => {
    document.cookie = 'i18next=; Path=/; Max-Age=0';
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([{ path: '', component: RoutedTitle }])],
    })
      .compileComponents();
  });

  it('updates the rendered title after a language change in the zoneless app', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const runtime = TestBed.inject(LocalizationRuntime);
    runtime.setLanguage('ar');
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent)
      .toBe(runtime.translate('general.mainTitle'));
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('renders accepted database text and removes it on logout without a manual change detection call', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('ERP System');
    const runtime = TestBed.inject(LocalizationRuntime);
    const generation = runtime.transition({ userId: 'u', tenantId: 't', companyId: 1, roles: ['user'], permissions: [] });
    runtime.applyCompany({ tenantId: 't', companyId: 1, defaultLanguage: 'en', revision: 1, catalogVersion: uiCatalogVersion,
      overrides: [{ namespace: 'core', key: 'general.mainTitle', language: 'en', value: 'Company title from SQL' }] }, generation);
    await fixture.whenStable();
    expect(compiled.querySelector('h1')?.textContent).toBe('Company title from SQL');
    runtime.transition(null);
    await fixture.whenStable();
    expect(compiled.querySelector('h1')?.textContent).toBe('ERP System');
  });
});

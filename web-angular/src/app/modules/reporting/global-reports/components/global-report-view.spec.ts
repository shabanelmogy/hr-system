import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideAppTheme } from '../../../../../theme/public-api';
import { AuthSession } from '../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../platform/auth/auth.fixture';
import { LocalizationRuntime } from '../../../../platform/localization/public-api';
import { validatePdfDocument } from '../../../../shared/data/public-api';
import { globalReportFixture as report } from '../report.fixture';
import { GlobalReportService } from '../services/global-report-service';
import { GlobalReportFailure } from '../types/global-report';
import { GlobalReportView } from './global-report-view';

describe('Managed report shared-form composition', () => {
  async function setup() {
    vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}});
    const pdf = await validatePdfDocument(new Blob(['%PDF-fixture'], { type: 'application/pdf' }));
    const identity = signal({
      ...sessionFixture,
      roles: ['super_admin'],
      permissions: ['GlobalCrystalReports:View'],
    });
    const service = { catalog: vi.fn(() => of([report])), render: vi.fn(() => of(pdf)) };
    vi.stubGlobal(
      'URL',
      class extends URL {
        static override createObjectURL = vi.fn(() => 'blob:https://fixture.test/report');
        static override revokeObjectURL = vi.fn();
      },
    );
    TestBed.configureTestingModule({
      providers: [
        provideAppTheme(),
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: GlobalReportService, useValue: service },
      ],
    });
    await TestBed.inject(LocalizationRuntime).loadNamespace('core');
    const fixture = TestBed.createComponent(GlobalReportView);
    await fixture.whenStable();
    return {
      fixture,
      service,
      owner: fixture.componentInstance,
      root: fixture.nativeElement as HTMLElement,
      locale: TestBed.inject(LocalizationRuntime),
      identity,
    };
  }
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });
  it('keeps Search enabled and uses the shared error badge, field message, and first-error focus', async () => {
    const { fixture, owner, root, service } = await setup();
    expect(root.querySelector('form')?.noValidate).toBe(true);
    owner.form.controls.nameAr.setValue('ع'.repeat(201));
    await fixture.whenStable();
    const submit = root.querySelector<HTMLButtonElement>('button[type=submit]')!;
    expect(submit.disabled).toBe(false);
    submit.click();
    await fixture.whenStable();
    expect(service.render).toHaveBeenCalledOnce();
    expect(root.querySelectorAll('.error-summary a')).toHaveLength(1);
    expect(root.querySelector('[data-testid=nameAr] .error')).not.toBeNull();
    expect(document.activeElement).toBe(root.querySelector('[data-testid=nameAr] input'));
  });
  it('keeps draft criteria separate when language rerenders the applied report', async () => {
    const { fixture, owner, service, locale } = await setup();
    owner.form.controls.nameAr.setValue('مصر');
    locale.setLanguage('ar');
    await fixture.whenStable();
    expect(service.render).toHaveBeenLastCalledWith(report, { nameAr: '', nameEn: '' }, 'ar');
    owner.search();
    await fixture.whenStable();
    expect(service.render).toHaveBeenLastCalledWith(report, { nameAr: 'مصر', nameEn: '' }, 'ar');
    owner.reset();
    await fixture.whenStable();
    expect(owner.form.getRawValue()).toEqual({ nameAr: '', nameEn: '' });
    expect(service.render).toHaveBeenLastCalledWith(report, { nameAr: '', nameEn: '' }, 'ar');
  });
  it('renders owned server field errors beneath shared inputs and clears the old PDF', async () => {
    const { fixture, owner, service, root } = await setup();
    service.render.mockReturnValue(
      throwError(() => new GlobalReportFailure('validation', { nameEn: 'Server fixture' })),
    );
    owner.search();
    await fixture.whenStable();
    expect(root.querySelector('[data-testid=nameEn] .error')?.textContent).toContain(
      'Server fixture',
    );
    expect(root.querySelector('erp-pdf-viewer')).toBeNull();
  });
  it('embeds without a second header and preserves draft/selection when the controlled criteria panel is hidden',async()=>{
    const{fixture,owner,root,service}=await setup();fixture.componentRef.setInput('embedded',true);await fixture.whenStable();
    expect(root.querySelector('erp-page-header')).toBeNull();expect(root.querySelector('form.sidebar-form')).not.toBeNull();
    const order=Array.from(root.querySelectorAll('.form-content > [data-testid]')).map(element=>element.getAttribute('data-testid'));expect(order).toEqual(['nameAr','nameEn','report']);
    owner.form.controls.nameEn.setValue('Draft');const calls=service.render.mock.calls.length;
    fixture.componentRef.setInput('showFilterBar',false);await fixture.whenStable();expect(root.querySelector('aside')).toBeNull();expect(root.querySelector('erp-pdf-viewer')).not.toBeNull();
    fixture.componentRef.setInput('showFilterBar',true);await fixture.whenStable();expect(owner.form.controls.nameEn.value).toBe('Draft');expect(service.render.mock.calls.length).toBe(calls);
  });
  it('clears actor-owned draft fields on context replacement',async()=>{
    const{fixture,owner,identity}=await setup();owner.form.controls.nameEn.setValue('Private draft');identity.set({...identity(),companyId:42});await fixture.whenStable();expect(owner.form.getRawValue()).toEqual({nameAr:'',nameEn:''});
  });
});

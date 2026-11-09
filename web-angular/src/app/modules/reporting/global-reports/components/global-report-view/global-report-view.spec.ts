import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NEVER, of, throwError } from 'rxjs';
import { provideAppTheme } from '../../../../../../theme/public-api';
import { AuthSession } from '../../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../../platform/auth/auth.fixture';
import { LocalizationRuntime } from '../../../../../platform/localization/public-api';
import { validatePdfDocument } from '../../../../../shared/data/public-api';
import { globalReportFixture as report } from '../../report.fixture';
import { GlobalReportService } from '../../services/global-report-service';
import { GlobalReportFailure } from '../../types/global-report';
import { GlobalReportView } from './global-report-view';

describe('Managed report shared-form composition', () => {
  async function setup(inlineSupported = false) {
    vi.stubGlobal('navigator', {
      pdfViewerEnabled: inlineSupported,
      userAgent: navigator.userAgent,
    });
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
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
  it('resets visible criteria and names the PDF for the newly selected entity', async () => {
    const { fixture, owner, service } = await setup();
    owner.form.nameEn().value.set('Countries draft');
    fixture.componentRef.setInput('entity', 'states');
    await fixture.whenStable();
    expect(owner.form().value()).toEqual({ nameAr: '', nameEn: '', stateAr: '', stateEn: '' });
    expect(owner.state.applied()).toEqual({ nameAr: '', nameEn: '' });
    expect(service.catalog).toHaveBeenLastCalledWith('states');
    expect(owner.fileName()).toBe('states-' + report.id.slice(0, 16) + '.pdf');
  });
  it('shows State criteria only for District reports and clears them when the entity changes', async () => {
    const { fixture, owner, root, service } = await setup();
    service.catalog.mockReturnValue(of([{ ...report, entityKey: 'districts' as const }]));

    fixture.componentRef.setInput('entity', 'districts');
    await fixture.whenStable();
    expect(root.querySelector('[data-testid=stateAr]')).not.toBeNull();
    expect(root.querySelector('[data-testid=stateEn]')).not.toBeNull();
    owner.form.stateAr().value.set('القاهرة');
    owner.form.stateEn().value.set('Cairo');

    service.catalog.mockReturnValue(of([report]));
    fixture.componentRef.setInput('entity', 'countries');
    await fixture.whenStable();
    expect(root.querySelector('[data-testid=stateAr]')).toBeNull();
    expect(owner.form().value()).toEqual({ nameAr: '', nameEn: '', stateAr: '', stateEn: '' });
    expect(owner.state.applied()).toEqual({ nameAr: '', nameEn: '' });
  });
  it('shows Summary Info Subject in English and Title in Arabic in the report selector', async () => {
    const { fixture, root, locale } = await setup();
    locale.setLanguage('en');
    await fixture.whenStable();
    expect(root.querySelector('[data-testid=report]')?.textContent).toContain(
      report.summarySubject,
    );

    locale.setLanguage('ar');
    await fixture.whenStable();
    expect(root.querySelector('[data-testid=report]')?.textContent).toContain(report.summaryTitle);
  });
  it.each(['en', 'ar'] as const)(
    'uses the display name when the %s Summary Info value is missing',
    async (language) => {
      const { fixture, owner, root, service, locale } = await setup();
      service.catalog.mockReturnValue(
        of([{ ...report, summaryTitle: null, summarySubject: null }]),
      );
      locale.setLanguage(language);
      owner.state.reload();
      await fixture.whenStable();
      expect(root.querySelector('[data-testid=report]')?.textContent).toContain(report.displayName);
    },
  );
  it('shows actionable template guidance in the existing shared error state', async () => {
    const { fixture, owner, root, service } = await setup();
    const message = 'Rebind the template to the approved entity schema.';
    service.render.mockReturnValue(
      throwError(() => new GlobalReportFailure('template', {}, message)),
    );
    owner.state.reload();
    await fixture.whenStable();
    expect(owner.errorCaption()).toBe(message);
    expect(root.textContent).toContain(message);
  });
  it('shows the sidebar upload entry only for an authorized global template administrator', async () => {
    const { fixture, root, identity, owner } = await setup();
    expect(root.querySelector('[data-testid=upload-source]')).toBeNull();
    identity.set({
      ...identity(),
      permissions: ['GlobalCrystalReports:View', 'GlobalCrystalReports:Upload', 'Countries:Edit'],
    });
    await fixture.whenStable();
    owner.sidebarTab.set('options');
    await fixture.whenStable();
    expect(
      root.querySelector('aside [data-testid=upload-source] button')?.getAttribute('aria-haspopup'),
    ).toBe('dialog');
    expect(root.querySelector('erp-global-report-template-editor')).toBeNull();
    identity.set({ ...identity(), roles: ['user'] });
    await fixture.whenStable();
    expect(root.querySelector('[data-testid=upload-source]')).toBeNull();
  });
  it('keeps Search enabled and uses the shared error badge, field message, and first-error focus', async () => {
    const { fixture, owner, root, service } = await setup();
    expect(root.querySelector('form')?.noValidate).toBe(true);
    owner.form.nameAr().value.set('ع'.repeat(201));
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
    owner.form.nameAr().value.set('مصر');
    locale.setLanguage('ar');
    await fixture.whenStable();
    expect(service.render).toHaveBeenLastCalledWith(report, { nameAr: '', nameEn: '' }, 'ar');
    void owner.search();
    await fixture.whenStable();
    expect(service.render).toHaveBeenLastCalledWith(report, { nameAr: 'مصر', nameEn: '' }, 'ar');
    owner.reset();
    await fixture.whenStable();
    expect(owner.form().value()).toEqual({ nameAr: '', nameEn: '', stateAr: '', stateEn: '' });
    expect(service.render).toHaveBeenLastCalledWith(report, { nameAr: '', nameEn: '' }, 'ar');
  });
  it('renders owned server field errors beneath shared inputs and clears the old PDF', async () => {
    const { fixture, owner, service, root } = await setup();
    owner.sidebarTab.set('options');
    await fixture.whenStable();
    service.render.mockReturnValue(
      throwError(() => new GlobalReportFailure('validation', { nameEn: 'Server fixture' })),
    );
    const search = owner.search();
    await fixture.whenStable();
    await search;
    await fixture.whenStable();
    expect(root.querySelector('[data-testid=nameEn] .error')?.textContent).toContain(
      'Server fixture',
    );
    expect(root.querySelector('erp-pdf-viewer')).toBeNull();
    expect(root.querySelector('aside a[target="_blank"]')).toBeNull();
    expect(owner.sidebarTab()).toBe('criteria');
  });
  it.each([false, true])(
    'retains the shared PDF lease while toggling criteria (embedded=%s)',
    async (embedded) => {
      const { fixture, service, root } = await setup(true);
      fixture.componentRef.setInput('embedded', embedded);
      await fixture.whenStable();
      const frame = root.querySelector('iframe');
      const source = frame?.src;
      const calls = service.render.mock.calls.length;
      expect(frame).not.toBeNull();
      const actions = embedded ? 'aside nav' : 'erp-page-header nav';
      expect(root.querySelectorAll(actions + ' a')).toHaveLength(2);
      expect(root.querySelector('erp-pdf-viewer nav')).toBeNull();
      const open = root.querySelector(actions + ' a[target="_blank"]');
      expect(open?.getAttribute('href')).toBe(source);
      expect(open?.getAttribute('rel')).toBe('noopener noreferrer');
      expect(root.querySelector(actions + ' a[download]')?.getAttribute('download')).toMatch(
        /\.pdf$/,
      );
      fixture.componentRef.setInput('showFilterBar', false);
      await fixture.whenStable();
      expect(root.querySelector('aside')).toBeNull();
      expect(
        root.querySelectorAll((embedded ? 'erp-pdf-viewer nav' : 'erp-page-header nav') + ' a'),
      ).toHaveLength(2);
      expect(root.querySelector('iframe')).toBe(frame);
      fixture.componentRef.setInput('showFilterBar', true);
      await fixture.whenStable();
      expect(root.querySelectorAll(actions + ' a')).toHaveLength(2);
      expect(root.querySelector('erp-pdf-viewer nav')).toBeNull();
      expect(root.querySelector('iframe')).toBe(frame);
      expect(service.render.mock.calls.length).toBe(calls);
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    },
  );
  it('removes header document links while a replacement report is loading', async () => {
    const { fixture, owner, service, root } = await setup();
    expect(root.querySelectorAll('erp-page-header nav a')).toHaveLength(2);
    service.render.mockReturnValue(NEVER);
    void owner.search();
    await fixture.whenStable();
    expect(root.querySelector('erp-pdf-viewer')).toBeNull();
    expect(root.querySelector('erp-page-header nav')).toBeNull();
    expect(root.querySelector('aside nav')).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
  });
  it('keeps draft fields and the original document mounted while switching sidebar tabs', async () => {
    const { fixture, owner, service, root } = await setup(true);
    fixture.componentRef.setInput('embedded', true);
    await fixture.whenStable();
    const input = root.querySelector<HTMLInputElement>('[data-testid=nameEn] input');
    const frame = root.querySelector('iframe');
    const renders = service.render.mock.calls.length;
    owner.form.nameEn().value.set('Draft country');
    owner.sidebarTab.set('options');
    await fixture.whenStable();
    expect(root.querySelector('[data-testid=nameEn] input')).toBe(input);
    expect(input?.closest<HTMLElement>('[role=tabpanel]')?.hidden).toBe(true);
    expect(
      root.querySelector('aside a[download]')?.closest<HTMLElement>('[role=tabpanel]')?.hidden,
    ).toBe(false);
    owner.sidebarTab.set('criteria');
    await fixture.whenStable();
    expect(input?.value).toBe('Draft country');
    expect(input?.closest<HTMLElement>('[role=tabpanel]')?.hidden).toBe(false);
    expect(root.querySelector('iframe')).toBe(frame);
    expect(service.render.mock.calls.length).toBe(renders);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });
  it('embeds without a second header and preserves draft/selection when the controlled criteria panel is hidden', async () => {
    const { fixture, owner, root, service } = await setup();
    fixture.componentRef.setInput('embedded', true);
    await fixture.whenStable();
    expect(root.querySelector('erp-page-header')).toBeNull();
    expect(root.querySelector('form.sidebar-form')).not.toBeNull();
    const order = Array.from(root.querySelectorAll('.form-content > [data-testid]')).map(
      (element) => element.getAttribute('data-testid'),
    );
    expect(order).toEqual(['report', 'nameAr', 'nameEn']);
    const actions = root.querySelectorAll<HTMLButtonElement>('form footer button');
    expect(actions).toHaveLength(2);
    expect(actions[0]?.type).toBe('submit');
    expect(actions[1]?.closest('[data-testid=reset]')).not.toBeNull();
    expect(Array.from(actions).every((button) => button.querySelector('erp-icon svg'))).toBe(true);
    owner.form.nameEn().value.set('Draft');
    const calls = service.render.mock.calls.length;
    fixture.componentRef.setInput('showFilterBar', false);
    await fixture.whenStable();
    expect(root.querySelector('aside')).toBeNull();
    expect(root.querySelector('erp-pdf-viewer')).not.toBeNull();
    fixture.componentRef.setInput('showFilterBar', true);
    await fixture.whenStable();
    expect(owner.form.nameEn().value()).toBe('Draft');
    expect(service.render.mock.calls.length).toBe(calls);
  });
  it('clears actor-owned draft fields on context replacement', async () => {
    const { fixture, owner, identity } = await setup();
    owner.form.nameEn().value.set('Private draft');
    identity.set({ ...identity(), companyId: 42 });
    await fixture.whenStable();
    expect(owner.form().value()).toEqual({ nameAr: '', nameEn: '', stateAr: '', stateEn: '' });
  });
  it('exposes header actions only for the current document and keeps the embedded viewer free of duplicate links', async () => {
    const { fixture, owner, root, service } = await setup(true);
    fixture.componentRef.setInput('embedded', true);
    fixture.componentRef.setInput('externalActions', true);
    await fixture.whenStable();
    expect(owner.headerActions()).not.toBeNull();
    expect(owner.optionsVisible()).toBe(false);
    expect(root.querySelector('aside [role=tablist]')).toBeNull();
    expect(root.querySelector('erp-pdf-viewer nav')).toBeNull();
    expect(root.querySelector('aside nav')).toBeNull();
    const frame = root.querySelector('iframe');
    fixture.componentRef.setInput('showFilterBar', false);
    await fixture.whenStable();
    expect(root.querySelector('iframe')).toBe(frame);
    expect(owner.headerActions()).not.toBeNull();
    service.render.mockReturnValue(NEVER);
    owner.reload();
    await fixture.whenStable();
    expect(owner.headerActions()).toBeNull();
    expect(root.querySelector('iframe')).toBeNull();
  });
});

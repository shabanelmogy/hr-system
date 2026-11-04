import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { provideAppTheme } from '../../../../../../theme/public-api';
import { AuthSession } from '../../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../../platform/auth/auth.fixture';
import { LocalizationRuntime } from '../../../../../platform/localization/public-api';
import { GlobalTemplateService } from '../../services/global-template-service';
import type { GlobalTemplateDesignSource, GlobalTemplateDetail } from '../../types/global-template';
import { GlobalTemplateDesigner } from './global-template-designer';

const source: GlobalTemplateDesignSource = {
  sourceKey: 'countries',
  moduleKey: 'reference-data',
  scope: 'global',
  tableName: 'ReportData',
  maxRows: 10000,
  columns: [{ name: 'CountryId', type: 'int32', nullable: false }],
  filters: ['NameEn'],
  parameters: [
    {
      name: 'Language',
      type: 'string',
      required: true,
      allowMultipleValues: false,
      discreteOnly: true,
      allowedValues: ['ar', 'en'],
    },
  ],
  contractSchemaVersion: 1,
  contractFingerprint: 'a'.repeat(64),
};
const detail: GlobalTemplateDetail = {
  id: 'c6518e27-5e26-4790-932c-80d572099a32',
  entityKey: 'countries',
  reportKey: 'countries-directory',
  displayName: 'Directory',
  description: '',
  updatedOn: null,
  currentVersionNumber: null,
  isPublished: false,
  isArchived: false,
  rowVersion: 'AAAAAAAAAAA=',
  versions: [],
  viewName: 'dbo.vw_Countries',
  viewFingerprint: 'b'.repeat(64),
};

describe('empty template designer preparation', () => {
  async function setup() {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const identity = signal({
      ...sessionFixture,
      tenantId: null,
      roles: ['super_admin'],
      permissions: [
        'GlobalCrystalReports:View',
        'GlobalCrystalReports:Create',
        'GlobalCrystalReports:Download',
        'Countries:Edit',
      ],
    });
    const service = {
      designSources: vi.fn(() => of([source])),
      databaseViews: vi.fn(() =>
        of({
          items: [{ viewName: 'dbo.vw_Countries', isCompatible: true, rejectionCode: null }],
          totalCount: 1,
        }),
      ),
      createDraft: vi.fn(() => of(detail)),
      designerPackage: vi.fn(() => of(new Blob(['package']))),
    };
    TestBed.configureTestingModule({
      providers: [
        provideAppTheme(),
        provideHttpClient(),
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: GlobalTemplateService, useValue: service },
      ],
    });
    const locale = TestBed.inject(LocalizationRuntime);
    await locale.loadNamespace('core');
    await locale.loadNamespace('reporting');
    const fixture = TestBed.createComponent(GlobalTemplateDesigner);
    await fixture.whenStable();
    fixture.componentInstance.open();
    await fixture.whenStable();
    return { fixture, state: fixture.componentInstance.state, service, identity };
  }
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });

  it('keeps draft submission enabled and focuses missing module through the shared form', async () => {
    const { fixture, service, state } = await setup();
    const form = document.querySelector<HTMLFormElement>('form');
    expect(form?.noValidate).toBe(true);
    expect(form?.querySelector<HTMLButtonElement>('button[type=submit]')?.disabled).toBe(false);
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(service.createDraft).not.toHaveBeenCalled();
    expect(state.form.controls.moduleKey.touched).toBe(true);
    expect(document.body.textContent).toContain('This field is required.');
    expect(document.activeElement?.closest('erp-reference-field')).not.toBeNull();
  });
  it('sends the database-selected View and current source fingerprint without an RPT', async () => {
    const { fixture, state, service } = await setup();
    const created = vi.fn();
    fixture.componentInstance.created.subscribe(created);
    state.form.patchValue({
      moduleKey: 'reference-data',
      sourceKey: 'countries',
      viewName: 'dbo.vw_Countries',
      reportKey: 'countries-directory',
      displayName: 'Directory',
    });
    await fixture.whenStable();
    expect(document.body.textContent).toContain('CountryId');
    expect(document.body.textContent).toContain('Language');
    state.form.controls.viewName.setValue('dbo.vw_Countries');
    fixture.componentInstance.save();
    await fixture.whenStable();
    expect(service.createDraft).toHaveBeenCalledWith({
      moduleKey: 'reference-data',
      sourceKey: 'countries',
      viewName: 'dbo.vw_Countries',
      reportKey: 'countries-directory',
      displayName: 'Directory',
      description: '',
      contractFingerprint: source.contractFingerprint,
    });
    expect(created).toHaveBeenCalledWith(detail);
    expect(state.opened()).toBe(false);
  });
  it('clears source when the module changes and rejects SQL fragments and mismatched key prefixes', async () => {
    const { fixture, state, service } = await setup();
    state.form.patchValue({
      moduleKey: 'reference-data',
      sourceKey: 'countries',
      viewName: 'dbo.x;DROP TABLE x',
      reportKey: 'states-report',
      displayName: 'Directory',
    });
    await fixture.whenStable();
    state.save(vi.fn());
    expect(service.createDraft).not.toHaveBeenCalled();
    expect(state.form.controls.viewName.invalid).toBe(true);
    expect(state.form.controls.reportKey.hasError('sourcePrefix')).toBe(true);
    state.form.controls.moduleKey.setValue(null);
    await fixture.whenStable();
    expect(state.selectedSource()).toBeNull();
    expect(state.form.controls.sourceKey.value).toBeNull();
  });
  it('renders server View rejection beneath the selected View field', async () => {
    const { fixture, state, service } = await setup();
    service.createDraft.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: {
              errors: { 'CrystalReport.InvalidView': ['View does not match the approved source.'] },
            },
          }),
      ),
    );
    state.form.patchValue({
      moduleKey: 'reference-data',
      sourceKey: 'countries',
      viewName: 'dbo.vw_Countries',
      reportKey: 'countries-directory',
      displayName: 'Directory',
    });
    await fixture.whenStable();
    state.form.controls.viewName.setValue('dbo.vw_Countries');
    state.save(vi.fn());
    await fixture.whenStable();
    expect(state.opened()).toBe(true);
    expect(state.form.controls.viewName.hasError('server')).toBe(true);
    expect(document.body.textContent).toContain('View does not match the approved source.');
    expect(document.activeElement?.closest('erp-reference-field')?.textContent).toContain(
      'SQL View',
    );
  });
  it('cancels a pending creation and ignores the previous actor response after identity changes', async () => {
    const { fixture, state, service, identity } = await setup();
    const pending = new Subject<GlobalTemplateDetail>();
    service.createDraft.mockReturnValue(pending);
    state.form.patchValue({
      moduleKey: 'reference-data',
      sourceKey: 'countries',
      viewName: 'dbo.vw_Countries',
      reportKey: 'countries-directory',
      displayName: 'Directory',
    });
    await fixture.whenStable();
    const created = vi.fn();
    state.form.controls.viewName.setValue('dbo.vw_Countries');
    state.save(created);
    expect(state.pending()).toBe(true);
    identity.set({ ...identity(), userId: 'another-user', permissions: [] });
    await fixture.whenStable();
    pending.next(detail);
    expect(created).not.toHaveBeenCalled();
    expect(state.opened()).toBe(false);
  });
});

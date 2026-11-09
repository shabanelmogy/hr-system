import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { provideAppTheme } from '../../../../../../theme/public-api';
import { AuthSession } from '../../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../../platform/auth/auth.fixture';
import { LocalizationRuntime } from '../../../../../platform/localization/public-api';
import { GlobalTemplateService } from '../../services/global-template-service';
import type { GlobalTemplateDetail } from '../../types/global-template';
import { GlobalTemplateManager } from './global-template-manager';
import { GlobalReportTemplateEditor } from '../../components/global-report-template-editor/global-report-template-editor';
import { GlobalTemplateList } from '../../components/global-template-list/global-template-list';
import { globalReportFixture } from '../../../global-reports/report.fixture';

describe('global versioned manager', () => {
  const hash = 'a'.repeat(64);
  const row = {
    id: 'c6518e27-5e26-4790-932c-80d572099a32',
    entityKey: 'countries' as const,
    reportKey: 'countries-directory',
    displayName: 'Directory',
    description: null,
    updatedOn: '2026-11-01T00:00:00Z',
    currentVersionNumber: 1,
    isPublished: true,
    isArchived: false,
    rowVersion: 'AAAAAAAAAAA=',
  };
  const version = {
    id: '104c0411-c988-449d-9a36-e27d2d7532f5',
    versionNumber: 1,
    originalFileName: 'Countries.rpt',
    size: 10,
    sha256: hash,
    summaryTitle: 'Directory',
    summarySubject: null,
    validationStatus: 'Valid' as const,
    validationReason: null,
    validationContractSchemaVersion: 1,
    validationContractFingerprint: hash,
    isPublished: true,
    createdOn: '2026-11-01T00:00:00Z',
  };
  const detail: GlobalTemplateDetail = { ...row, versions: [version] };
  const viewerSource = {
    id: '47ac6388610696d48cf340ef20a03dad79ece085f1579cb124bf6b91be479d52',
    entityKey: 'countries' as const,
    reportKey: row.reportKey,
    rowVersion: 'bde14ba2a6ce8b232c5d3a7adb14de58780eedea1fdd769a794696345d712425',
  };
  const replacementDetail = {
    ...detail,
    currentVersionNumber: 2,
    rowVersion: 'AQEBAQEBAQE=',
    versions: [
      { ...version, isPublished: false },
      {
        ...version,
        id: '204c0411-c988-449d-9a36-e27d2d7532f5',
        versionNumber: 2,
        createdOn: '2026-11-03T12:00:00Z',
      },
    ],
  };
  const uploadTarget = (report: typeof detail | null = null, canReplace = report !== null) => ({
    report,
    canReplace,
  });
  const candidate = {
    sourceId: 'c'.repeat(64),
    entityKey: 'countries' as const,
    reportKey: 'countries-directory',
    fileName: 'Countries.Directory.rpt',
    displayName: 'Existing directory',
    subject: null,
    size: 32,
    sha256: hash,
    isImportable: true,
    isImported: false,
    validationReason: null,
  };
  it('shows saved report metadata for the current version without mixing newer draft summaries', async () => {
    const { fixture, state, service } = await setup();
    const saved = {
      ...detail,
      description: 'Shared directory description',
      versions: [
        { ...version, summarySubject: 'دليل الدول' },
        {
          ...version,
          id: 'draft',
          versionNumber: 2,
          summaryTitle: 'Draft title',
          isPublished: false,
        },
      ],
    };
    service.detail.mockReturnValue(of(saved));
    state.openDetail(row);
    await fixture.whenStable();
    expect(document.body.textContent).toContain('Shared directory description');
    expect(document.body.textContent).not.toContain('Draft title');
    expect(service.upload).not.toHaveBeenCalled();
  });
  it('resolves a duplicate before uploading and waits for explicit replacement confirmation', async () => {
    const { fixture, state, service } = await setup();
    service.uploadTarget.mockReturnValue(of(uploadTarget(detail)));
    state.openEditor(null);
    state.form.controls.file.setValue(new File(['fixture'], 'Countries.Directory.rpt'));
    state.save();
    await fixture.whenStable();
    expect(service.uploadTarget).toHaveBeenCalledWith('countries', 'Countries.Directory.rpt');
    expect(service.upload).not.toHaveBeenCalled();
    expect(service.replace).not.toHaveBeenCalled();
    expect(state.replacementTarget()?.report.id).toBe(row.id);
    expect(document.body.textContent).toContain('Report already exists');
  });
  it('cancels replacement without changing the selected source or calling a mutation', async () => {
    const { fixture, state, service } = await setup();
    service.uploadTarget.mockReturnValue(of(uploadTarget(detail)));
    const file = new File(['fixture'], 'Countries.Directory.rpt');
    state.openEditor(null);
    state.form.controls.file.setValue(file);
    state.save();
    await fixture.whenStable();
    state.cancelReplacement();
    await fixture.whenStable();
    expect(state.replacementTarget()).toBeNull();
    expect(state.editorOpen()).toBe(true);
    expect(state.form.controls.file.value).toBe(file);
    expect(service.replace).not.toHaveBeenCalled();
    expect(service.upload).not.toHaveBeenCalled();
  });
  it('uses one atomic replacement request with the confirmed target and concurrency token', async () => {
    const { fixture, state, service } = await setup();
    service.uploadTarget.mockReturnValue(of(uploadTarget(detail)));
    service.detail.mockReturnValue(of(replacementDetail));
    const file = new File(['fixture'], 'Countries.Directory.rpt');
    state.openEditor(null);
    state.form.controls.file.setValue(file);
    state.save();
    await fixture.whenStable();
    state.confirmReplacement();
    await fixture.whenStable();
    expect(service.replace).toHaveBeenCalledExactlyOnceWith(
      row.id,
      'countries',
      file,
      row.rowVersion,
    );
    expect(service.upload).not.toHaveBeenCalled();
    expect(service.publish).not.toHaveBeenCalled();
    expect(state.editorOpen()).toBe(false);
    expect(state.replacementTarget()).toBeNull();
    expect(state.detail()?.currentVersionNumber).toBe(2);
  });
  it('invalidates confirmation when the file changes', async () => {
    const { fixture, state, service } = await setup();
    service.uploadTarget.mockReturnValue(of(uploadTarget(detail)));
    state.openEditor(null);
    state.form.controls.file.setValue(new File(['first'], 'Countries.Directory.rpt'));
    state.save();
    await fixture.whenStable();
    state.form.controls.file.setValue(new File(['second'], 'Countries.Other.rpt'));
    state.confirmReplacement();
    expect(state.replacementTarget()).toBeNull();
    expect(service.replace).not.toHaveBeenCalled();
  });
  it('does not upload a stale file when an earlier identity lookup completes', async () => {
    const { fixture, state, service } = await setup();
    const pending = new Subject<ReturnType<typeof uploadTarget>>();
    service.uploadTarget.mockReturnValue(pending);
    state.openEditor(null);
    state.form.controls.file.setValue(new File(['first'], 'Countries.Directory.rpt'));
    state.save();
    state.form.controls.file.setValue(new File(['second'], 'Countries.Other.rpt'));
    pending.next(uploadTarget());
    pending.complete();
    await fixture.whenStable();
    expect(service.upload).not.toHaveBeenCalled();
    expect(state.pending()).toBe(false);
  });
  it('blocks archived or unauthorized replacement without uploading', async () => {
    const { fixture, state, service } = await setup();
    service.uploadTarget.mockReturnValue(of(uploadTarget({ ...detail, isArchived: true }, false)));
    state.openEditor(null);
    state.form.controls.file.setValue(new File(['fixture'], 'Countries.Directory.rpt'));
    state.save();
    await fixture.whenStable();
    expect(state.feedback()?.key).toBe('globalTemplates.replacementUnavailable');
    expect(state.replacementTarget()).toBeNull();
    expect(service.upload).not.toHaveBeenCalled();
    expect(service.replace).not.toHaveBeenCalled();
  });
  it('closes a stale confirmation and leaves the editor available for a fresh lookup', async () => {
    const { fixture, state, service } = await setup();
    service.uploadTarget.mockReturnValue(of(uploadTarget(detail)));
    service.replace.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    state.openEditor(null);
    state.form.controls.file.setValue(new File(['fixture'], 'Countries.Directory.rpt'));
    state.save();
    await fixture.whenStable();
    state.confirmReplacement();
    await fixture.whenStable();
    expect(state.replacementTarget()).toBeNull();
    expect(state.editorOpen()).toBe(true);
    expect(state.feedback()?.key).toBe('globalTemplates.conflict');
  });
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
        'GlobalCrystalReports:Upload',
        'GlobalCrystalReports:Publish',
        'GlobalCrystalReports:Download',
        'Countries:Edit',
      ],
    });
    const service = {
      entities: vi.fn(() =>
        of([
          {
            entityKey: 'countries' as const,
            scope: 'global' as const,
            filters: [],
            contractSchemaVersion: 1,
            contractFingerprint: hash,
          },
        ]),
      ),
      list: vi.fn(() => of({ items: [row], totalCount: 1 })),
      detail: vi.fn(() => of(detail)),
      access: vi.fn(() =>
        of({
          access: [],
          allowedRights: ['Run', 'Download', 'Upload', 'Publish'],
          canView: true,
          canEdit: true,
          rowVersion: row.rowVersion,
        }),
      ),
      roles: vi.fn(() => of({ items: [], totalCount: 0 })),
      saveAccess: vi.fn(() => of(null)),
      archive: vi.fn(() => of(null)),
      candidates: vi.fn(() => of({ items: [candidate], totalCount: 1 })),
      upload: vi.fn(() => of(detail)),
      uploadTarget: vi.fn(() => of(uploadTarget())),
      replace: vi.fn(() => of(replacementDetail)),
      inspect: vi.fn(() =>
        of({
          isValid: true,
          validationReason: null,
          contractFingerprint: hash,
          contractSchemaVersion: 1,
          failure: 0,
        }),
      ),
      publish: vi.fn(() => of(detail)),
      revalidate: vi.fn(() => of(detail)),
      import: vi.fn(() => of(detail)),
      download: vi.fn(() => of(new Blob(['fixture']))),
      schema: vi.fn(() => of(new Blob(['schema']))),
    };
    TestBed.configureTestingModule({
      providers: [
        provideAppTheme(),
        provideHttpClient(),
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: GlobalTemplateService, useValue: service },
      ],
    });
    await TestBed.inject(LocalizationRuntime).loadNamespace('core');
    await TestBed.inject(LocalizationRuntime).loadNamespace('reporting');
    const fixture = TestBed.createComponent(GlobalTemplateManager);
    await fixture.whenStable();
    return {
      fixture,
      state: fixture.componentInstance.state,
      service,
      identity,
      root: fixture.nativeElement as HTMLElement,
    };
  }
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });
  it('keeps dropdown actions permission-scoped and blocks dispatch during an existing upload', async () => {
    const { fixture, state, service, identity } = await setup();
    const list = fixture.debugElement.query(By.directive(GlobalTemplateList))
      .componentInstance as GlobalTemplateList;
    expect(list.toolbarActions().map((action) => action.id)).toEqual([
      'upload',
      'register',
      'design',
      'schema',
    ]);
    list.toolbarAction('upload');
    await fixture.whenStable();
    expect(state.editorOpen()).toBe(true);
    const pending = new Subject<typeof detail>();
    service.upload.mockReturnValue(pending);
    state.form.controls.file.setValue(new File(['fixture'], 'Countries.rpt'));
    state.save();
    await fixture.whenStable();
    expect(state.pending()).toBe(true);
    list.toolbarAction('register');
    expect(service.candidates).not.toHaveBeenCalled();
    identity.set({
      ...identity(),
      permissions: identity().permissions.filter(
        (permission) => permission !== 'GlobalCrystalReports:Create',
      ),
    });
    await fixture.whenStable();
    expect(list.toolbarActions().map((action) => action.id)).toEqual(['schema']);
    list.toolbarAction('register');
    list.toolbarAction('upload');
    expect(service.candidates).not.toHaveBeenCalled();
    expect(state.editorOpen()).toBe(false);
  });
  it('registers an existing server file without local upload and refreshes its registered state', async () => {
    const { fixture, state, service, root } = await setup();
    state.loadCandidates();
    await fixture.whenStable();
    expect(state.candidateSource().result?.rows[0]?.fileName).toBe(candidate.fileName);
    expect(root.ownerDocument.body.textContent).toContain('Not registered');
    expect(state.canRegister(candidate)).toBe(true);
    expect(state.canRegister({ ...candidate, isImported: true })).toBe(false);
    expect(state.canRegister({ ...candidate, isImportable: false, sha256: '' })).toBe(false);
    service.candidates.mockReturnValue(
      of({ items: [{ ...candidate, isImported: true }], totalCount: 1 }),
    );
    state.import(candidate);
    await fixture.whenStable();
    expect(service.import).toHaveBeenCalledWith('countries', candidate.sourceId, candidate.sha256);
    expect(service.upload).not.toHaveBeenCalled();
    expect(service.publish).not.toHaveBeenCalled();
    expect(state.candidatesOpen()).toBe(true);
    expect(state.candidateSource().result?.rows[0]?.isImported).toBe(true);
    state.import({ ...candidate, isImported: true });
    expect(service.import).toHaveBeenCalledTimes(1);
  });
  it('keeps Save enabled and renders field validation through the shared form system', async () => {
    const { fixture, state, root, service } = await setup();
    state.openEditor(null);
    await fixture.whenStable();
    const form = root.ownerDocument.querySelector<HTMLFormElement>('form');
    expect(form?.noValidate).toBe(true);
    const save = form?.querySelector<HTMLButtonElement>('button[type=submit]');
    expect(save?.disabled).toBe(false);
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(service.upload).not.toHaveBeenCalled();
    expect(state.form.controls.file.touched).toBe(true);
    expect(root.ownerDocument.body.textContent).toContain('Select a Crystal .rpt file.');
    expect(root.ownerDocument.activeElement?.closest('erp-file-field')).not.toBeNull();
  });
  it('keeps the All-entity list filter when opening a report or registering an existing file', async () => {
    const { fixture, state, service } = await setup();
    await state.selectEntity('');
    await fixture.whenStable();
    expect(service.list).toHaveBeenLastCalledWith('', '', 0, 10, '', []);
    state.openDetail(row);
    await fixture.whenStable();
    expect(state.filterEntity()).toBe('');
    expect(state.entity()).toBe('countries');
    state.closeDetail();
    state.loadCandidates();
    await fixture.whenStable();
    expect(state.filterEntity()).toBe('');
    expect(service.candidates).toHaveBeenCalledWith('countries', '', 0, 10);
  });
  it('applies and clears controlled column rules at the first server page', async () => {
    const { fixture, state, service, root } = await setup();
    expect(root.querySelectorAll('p-column-filter')).toHaveLength(6);
    state.page(2, 10);
    await fixture.whenStable();
    const filters = [
      {
        field: 'displayName',
        operator: 'and',
        constraints: [{ matchMode: 'contains', value: 'Directory' }],
      },
    ] as const;
    state.changeColumnFilters(filters);
    await fixture.whenStable();
    expect(state.criteria().pageIndex).toBe(0);
    expect(service.list).toHaveBeenLastCalledWith('countries', '', 0, 10, '', filters);
    expect(() => state.changeColumnFilters([{ field: 'unknown' }])).toThrow();
    expect(state.columnFilters()).toEqual(filters);
    state.changeColumnFilters([]);
    await fixture.whenStable();
    expect(service.list).toHaveBeenLastCalledWith('countries', '', 0, 10, '', []);
  });
  it('shows a failed discovery response and allows retry instead of presenting an empty catalog', async () => {
    const { fixture, state, service } = await setup();
    service.candidates.mockReturnValue(throwError(() => new Error('Discovery failed')));
    state.loadCandidates();
    await fixture.whenStable();
    expect(state.candidateSource().kind).toBe('error');
    expect(state.candidateFailure()).not.toBeNull();
    service.candidates.mockReturnValue(of({ items: [candidate], totalCount: 1 }));
    state.refreshCandidates();
    await fixture.whenStable();
    expect(state.candidateSource().result?.rows).toHaveLength(1);
  });
  it('opens version detail and never publishes as an effect of uploading', async () => {
    const { fixture, state, service } = await setup();
    state.openDetail(row);
    await fixture.whenStable();
    expect(state.detail()?.versions).toHaveLength(1);
    state.openEditor(detail);
    state.form.controls.file.setValue(new File(['fixture'], 'Countries.rpt'));
    state.save();
    await fixture.whenStable();
    expect(service.upload).toHaveBeenCalledWith('countries', expect.any(File), '', row.id);
    expect(service.publish).not.toHaveBeenCalled();
    expect(state.editorOpen()).toBe(false);
    expect(state.publishable(version)).toBe(false);
    expect(
      state.publishable({
        ...version,
        isPublished: false,
        validationContractFingerprint: 'b'.repeat(64),
      }),
    ).toBe(false);
    expect(
      state.validationStatus({ ...version, validationContractFingerprint: 'b'.repeat(64) }),
    ).toBe('NeedsRevalidation');
    expect(
      state.publishable({
        ...version,
        isPublished: false,
        validationContractFingerprint: 'b'.repeat(64),
        isContractCurrent: true,
      }),
    ).toBe(true);
    expect(
      state.validationStatus({
        ...version,
        validationContractFingerprint: 'b'.repeat(64),
        isContractCurrent: true,
      }),
    ).toBe('Valid');
    expect(state.publishable({ ...version, isPublished: false, isContractCurrent: false })).toBe(
      false,
    );
  });
  it('resolves a viewer template by exact report key and published hash before opening its editor', async () => {
    const { fixture, state, service } = await setup();
    state.openViewerTemplate({
      ...viewerSource,
    });
    await expect.poll(() => state.editor()?.reportId).toBe(row.id);
    await fixture.whenStable();
    expect(service.list).toHaveBeenCalledWith('countries', '', 0, 10, 'published', [
      {
        field: 'reportKey',
        operator: 'and',
        constraints: [{ matchMode: 'equals', value: row.reportKey }],
      },
    ]);
    expect(state.detail()?.id).toBe(row.id);
    expect(state.editorOpen()).toBe(true);
    expect(state.editor()?.reportId).toBe(row.id);
    expect(service.upload).not.toHaveBeenCalled();
  });
  it('rejects a stale viewer source and refuses a template without Upload permission', async () => {
    const { fixture, state, service, identity } = await setup();
    state.openViewerTemplate({
      ...viewerSource,
      rowVersion: 'b'.repeat(64),
    });
    await expect.poll(() => state.feedback()?.key).toBe('globalTemplates.conflict');
    await fixture.whenStable();
    expect(state.editorOpen()).toBe(false);
    expect(state.feedback()?.key).toBe('globalTemplates.conflict');
    service.list.mockClear();
    identity.set({
      ...identity(),
      permissions: identity().permissions.filter(
        (permission) => permission !== 'GlobalCrystalReports:Upload',
      ),
    });
    await fixture.whenStable();
    service.list.mockClear();
    state.openViewerTemplate({
      ...viewerSource,
    });
    await fixture.whenStable();
    expect(service.list).not.toHaveBeenCalled();
    expect(state.editorOpen()).toBe(false);
  });
  it('reuses the existing upload and version dialogs from the viewer and retains explicit publication', async () => {
    const { service } = await setup();
    const viewerEditor = TestBed.createComponent(GlobalReportTemplateEditor);
    viewerEditor.componentRef.setInput('report', {
      ...globalReportFixture,
      ...viewerSource,
    });
    await viewerEditor.whenStable();
    const state = viewerEditor.componentInstance.state;
    await expect.poll(() => state.editor()?.reportId).toBe(row.id);
    await viewerEditor.whenStable();
    state.form.controls.file.setValue(new File(['fixture'], 'Countries.rpt'));
    state.save();
    await viewerEditor.whenStable();
    expect(service.upload).toHaveBeenCalledWith('countries', expect.any(File), '', row.id);
    expect(service.publish).not.toHaveBeenCalled();
    expect(state.detailOpen()).toBe(true);
    expect(document.body.querySelector('erp-global-template-versions')).not.toBeNull();
    const closed = vi.fn();
    viewerEditor.componentInstance.closed.subscribe(closed);
    state.closeDetail();
    await viewerEditor.whenStable();
    expect(closed).toHaveBeenCalledTimes(1);
    viewerEditor.destroy();
  });
  it('requires the report-specific Upload grant before opening a viewer upload', async () => {
    const { fixture, state, service } = await setup();
    service.access.mockReturnValue(
      of({
        access: [],
        allowedRights: ['Run', 'Download'],
        canView: true,
        canEdit: false,
        rowVersion: row.rowVersion,
      }),
    );
    state.openViewerTemplate({
      ...viewerSource,
    });
    await expect.poll(() => state.feedback()?.key).toBe('authorization.forbidden.title');
    await fixture.whenStable();
    expect(state.editorOpen()).toBe(false);
    expect(state.feedback()?.key).toBe('authorization.forbidden.title');
    expect(service.upload).not.toHaveBeenCalled();
  });
  it('rejects another immutable viewer identity even when the report key and source bytes match', async () => {
    const { fixture, state, service } = await setup();
    state.openViewerTemplate({ ...viewerSource, id: 'f'.repeat(64) });
    await expect.poll(() => state.feedback()?.key).toBe('globalTemplates.conflict');
    await fixture.whenStable();
    expect(state.editorOpen()).toBe(false);
    expect(state.feedback()?.key).toBe('globalTemplates.conflict');
    expect(service.upload).not.toHaveBeenCalled();
  });
  it('rejects a replaced published version even when its RPT bytes have the same hash', async () => {
    const { fixture, state, service } = await setup();
    service.detail.mockReturnValue(
      of({ ...detail, versions: [{ ...version, id: '204c0411-c988-449d-9a36-e27d2d7532f5' }] }),
    );
    state.openViewerTemplate(viewerSource);
    await fixture.whenStable();
    await expect.poll(() => state.feedback()?.key).toBe('globalTemplates.conflict');
    expect(state.editorOpen()).toBe(false);
    expect(service.upload).not.toHaveBeenCalled();
  });
  it('revokes UI state and cancels an outstanding mutation after authority changes', async () => {
    const { fixture, state, service, identity } = await setup();
    const pending = new Subject<typeof detail>();
    service.upload.mockReturnValue(pending);
    state.openEditor(null);
    state.form.controls.file.setValue(new File(['fixture'], 'Countries.rpt'));
    state.save();
    expect(state.pending()).toBe(true);
    identity.set({ ...identity(), permissions: [] });
    await fixture.whenStable();
    expect(state.allowed()).toBe(false);
    expect(state.editorOpen()).toBe(false);
    pending.next(detail);
    await fixture.whenStable();
    expect(state.detail()).toBeNull();
    expect(state.pending()).toBe(false);
  });
});

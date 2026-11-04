import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { provideAppTheme } from '../../../../../../theme/public-api';
import { AuthSession } from '../../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../../platform/auth/auth.fixture';
import { LocalizationRuntime } from '../../../../../platform/localization/public-api';
import { GlobalTemplateService } from '../../services/global-template-service';
import { GlobalTemplateManager } from './global-template-manager';

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
  const detail = { ...row, versions: [version] };
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
    expect(service.list).toHaveBeenLastCalledWith('', '', 0, 10, '');
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

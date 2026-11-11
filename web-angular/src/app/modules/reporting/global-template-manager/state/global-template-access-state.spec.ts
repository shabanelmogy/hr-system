import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { AuthSession } from '../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../platform/auth/auth.fixture';
import { GlobalTemplateService } from '../services/global-template-service';
import { GlobalTemplateAccessState } from './global-template-access-state';
import type { GlobalTemplateDetail, GlobalTemplateGrant } from '../types/global-template';

describe('global template role drafts', () => {
  const report: GlobalTemplateDetail = {
    id: 'c6518e27-5e26-4790-932c-80d572099a32',
    entityKey: 'countries',
    reportKey: 'countries-directory',
    displayName: 'Directory',
    description: null,
    updatedOn: null,
    currentVersionNumber: null,
    isPublished: false,
    isArchived: false,
    rowVersion: 'AAAAAAAAAAA=',
    versions: [],
  };
  function setup(initialGrants: GlobalTemplateGrant[] = [], archived = false) {
    const identity = signal({
      ...sessionFixture,
      roles: ['super_admin'],
      permissions: [
        'GlobalCrystalReports:View',
        'Countries:Edit',
        'GlobalCrystalReportAccess:View',
        'GlobalCrystalReportAccess:Edit',
      ],
    });
    let grants = initialGrants;
    const service = {
      access: vi.fn(() =>
        of({
          access: grants,
          allowedRights: ['Run', 'Download', 'Upload', 'Publish'],
          canView: true,
          canEdit: true,
          rowVersion: report.rowVersion,
        }),
      ),
      roles: vi.fn((_entity: string, _search: string, page: number) =>
        of({
          items: [
            page === 0
              ? { id: 'role-a', name: 'Employee A', tenantId: 'tenant-a', tenantName: 'Tenant A' }
              : { id: 'role-b', name: 'Employee B', tenantId: 'tenant-b', tenantName: 'Tenant B' },
          ],
          totalCount: 11,
        }),
      ),
      saveAccess: vi.fn((_id: string, _version: string, value: readonly GlobalTemplateGrant[]) => {
        grants = [...value];
        return of(null);
      }),
    };
    TestBed.configureTestingModule({
      providers: [
        GlobalTemplateAccessState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: GlobalTemplateService, useValue: service },
      ],
    });
    const state = TestBed.inject(GlobalTemplateAccessState);
    TestBed.tick();
    state.select({ ...report, isArchived: archived });
    TestBed.tick();
    return { state, service, identity };
  }
  afterEach(() => TestBed.resetTestingModule());
  it('preserves checked roles across server pages and saves their independent rights with concurrency', () => {
    const { state, service } = setup();
    const first = state.controls('role-a');
    if (!first) throw new Error('Expected the first role page');
    first.Run.setValue(true);
    state.page(1, 10);
    TestBed.tick();
    const second = state.controls('role-b');
    if (!second) throw new Error('Expected the second role page');
    second.Download.setValue(true);
    expect(state.dirty()).toBe(true);
    state.save();
    TestBed.tick();
    expect(service.saveAccess).toHaveBeenCalledWith(report.id, report.rowVersion, [
      { roleId: 'role-a', roleName: 'Employee A', rights: ['Run'] },
      { roleId: 'role-b', roleName: 'Employee B', rights: ['Download'] },
    ]);
    expect(state.dirty()).toBe(false);
    expect(state.draft()).toHaveLength(2);
  });
  it('preserves tenant and platform scope for archived readonly grants and marks legacy scope unknown', () => {
    const { state, service } = setup(
      [
        {
          roleId: 'tenant-role',
          roleName: 'Accountant',
          rights: ['Run'],
          tenantId: 'tenant-a',
          tenantName: 'Tenant A',
          scopeKnown: true,
        },
        {
          roleId: 'platform-role',
          roleName: 'Reader',
          rights: ['Run'],
          tenantId: null,
          tenantName: null,
          scopeKnown: true,
        },
        { roleId: 'legacy-role', roleName: 'Legacy', rights: ['Run'] },
        {
          roleId: 'removed-role',
          roleName: 'Removed',
          rights: ['Run'],
          tenantId: null,
          tenantName: null,
          scopeKnown: false,
        },
      ],
      true,
    );
    const source = state.source();
    expect(state.canEdit()).toBe(false);
    expect(service.roles).not.toHaveBeenCalled();
    if (source.kind !== 'ready') throw new Error('Expected readonly grants');
    expect(source.result?.rows).toEqual([
      {
        id: 'tenant-role',
        name: 'Accountant',
        tenantId: 'tenant-a',
        tenantName: 'Tenant A',
        scopeKnown: true,
      },
      { id: 'platform-role', name: 'Reader', tenantId: null, tenantName: null, scopeKnown: true },
      { id: 'legacy-role', name: 'Legacy', tenantId: null, tenantName: null, scopeKnown: false },
      { id: 'removed-role', name: 'Removed', tenantId: null, tenantName: null, scopeKnown: false },
    ]);
  });
  it('discards a stale draft on a reported conflict and reloads server grants', () => {
    const { state, service } = setup();
    const controls = state.controls('role-a');
    if (!controls) throw new Error('Expected the first role page');
    controls.Run.setValue(true);
    service.saveAccess.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    state.save();
    TestBed.tick();
    expect(state.feedback()?.key).toBe('globalTemplates.conflict');
    expect(state.dirty()).toBe(false);
    expect(state.draft()).toEqual([]);
    expect(service.access).toHaveBeenCalledTimes(2);
  });
  it('cancels a pending grant save and clears its draft when the actor authority changes', () => {
    const { state, service, identity } = setup();
    const pending = new Subject<null>();
    service.saveAccess.mockReturnValue(pending);
    state.save();
    expect(state.pending()).toBe(true);
    identity.set({ ...identity(), permissions: [] });
    TestBed.tick();
    pending.next(null);
    expect(state.pending()).toBe(false);
    expect(state.snapshot()).toBeNull();
    expect(state.draft()).toEqual([]);
  });
});

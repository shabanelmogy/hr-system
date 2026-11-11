import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NEVER, Subject } from 'rxjs';
import { AuthSession, type Session } from '../../../../auth/session.public-api';
import { sessionFixture } from '../../../../auth/auth.fixture';
import { LocalizationRuntime } from '../../../../localization/public-api';
import { FeedbackNotifications } from '../../../../../shared/ui/public-api';
import { TenantManagementService } from '../../services/tenant-management-service';
import { TenantEditorState, type TenantSaved } from '../../state/tenant-editor-state';
import { TenantEntitlementsState } from '../../state/tenant-entitlements-state';
import { TenantEditorWorkspace } from './tenant-editor-workspace';
import { tenantFixture } from '../../tenant.fixture';

describe('Routed Tenant editor lifetime', () => {
  afterEach(() => TestBed.resetTestingModule());
  it.each(['create', 'edit'] as const)(
    'continues a successful %s through its owning route',
    (mode) => {
      const saved = new Subject<TenantSaved>();
      const router = {
        navigate: vi.fn().mockResolvedValue(true),
        navigateByUrl: vi.fn().mockResolvedValue(true),
      };
      const success = vi.fn();
      TestBed.configureTestingModule({
        providers: [
          TenantEditorWorkspace,
          { provide: TenantEditorState, useValue: { saved: saved.asObservable() } },
          { provide: TenantEntitlementsState, useValue: { ready: () => false } },
          { provide: AuthSession, useValue: { readIdentity: () => null } },
          { provide: Router, useValue: router },
          { provide: FeedbackNotifications, useValue: { success } },
          {
            provide: LocalizationRuntime,
            useValue: { loadNamespace: () => Promise.resolve() },
          },
        ],
      });
      TestBed.inject(TenantEditorWorkspace);
      saved.next({ mode, tenant: tenantFixture });

      expect(success).toHaveBeenCalledWith(
        mode === 'create' ? 'tenantManagement.created' : 'tenantManagement.updated',
        'platform-tenants',
      );
      if (mode === 'create') {
        expect(router.navigate).toHaveBeenCalledExactlyOnceWith(
          ['/super-admin/tenants', tenantFixture.id, 'edit'],
          { queryParams: { tab: 'administrators' }, replaceUrl: true },
        );
        expect(router.navigateByUrl).not.toHaveBeenCalled();
      } else {
        expect(router.navigateByUrl).toHaveBeenCalledExactlyOnceWith('/super-admin/tenants', {
          state: { editedTenantId: tenantFixture.id },
        });
        expect(router.navigate).not.toHaveBeenCalled();
      }
    },
  );

  it('starts a fresh draft for a new authorized actor only after its catalog is ready', () => {
    const actor: Session = { ...sessionFixture, roles: ['super_admin'], permissions: [] };
    const identity = signal<Session | null>(actor);
    const ready = signal(true);
    const modules = [{ code: 'hr', name: 'HR', isDefault: true, submodules: [] }];
    const commands = {
      detail: vi.fn(() => NEVER),
      create: vi.fn(() => NEVER),
      update: vi.fn(() => NEVER),
    };
    TestBed.configureTestingModule({
      providers: [
        TenantEditorWorkspace,
        TenantEditorState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: Router, useValue: { navigateByUrl: vi.fn().mockResolvedValue(true) } },
        { provide: FeedbackNotifications, useValue: { success: vi.fn() } },
        {
          provide: LocalizationRuntime,
          useValue: { translate: (key: string) => key, loadNamespace: () => Promise.resolve() },
        },
        { provide: TenantManagementService, useValue: commands },
        {
          provide: TenantEntitlementsState,
          useValue: {
            ready,
            modules: () => modules,
            pending: computed(() => !ready()),
            view: computed(() =>
              ready() ? { kind: 'ready', data: modules } : { kind: 'loading' },
            ),
          },
        },
      ],
    });
    TestBed.inject(TenantEditorWorkspace);
    const editor = TestBed.inject(TenantEditorState);
    TestBed.tick();
    expect(editor.active()).toBe(true);
    editor.form.name().value.set('Previous actor draft');
    ready.set(false);
    identity.set({ ...actor, userId: 'replacement-user' });
    TestBed.tick();
    expect(editor.active()).toBe(false);
    ready.set(true);
    TestBed.tick();
    expect(editor.active()).toBe(true);
    expect(editor.form.name().value()).toBe('');
    expect(editor.form.planName().value()).toBe('Free');
    expect(commands.create).not.toHaveBeenCalled();
  });
});

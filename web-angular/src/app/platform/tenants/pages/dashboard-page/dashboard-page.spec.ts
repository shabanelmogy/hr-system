import { fixtureItem } from '../../../../../testing/fixture-item';
import { signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { AuthSession } from '../../../auth/session.public-api';
import { sessionFixture } from '../../../auth/auth.fixture';
import { TestBed } from '@angular/core/testing';
import { provideAppTheme, ThemeService } from '../../../../../theme/public-api';
import { DashboardState } from '../../state/dashboard-state';
import { dashboardFixture } from '../../dashboard.fixture';
import { DashboardPage } from './dashboard-page';
import { SHELL_DATA_NAVIGATION } from '../../../../shell/public-api';

describe('Independent dashboard namespace and readable accents', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthSession,
          useValue: {
            readIdentity: signal({ ...sessionFixture, roles: ['super_admin'], permissions: [] }),
          },
        },
      ],
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    document.cookie = 'i18next=; Path=/; Max-Age=0';
  });
  it('loads its own Arabic captions on a direct reload and uses the shared strong secondary brand', async () => {
    document.cookie = 'i18next=ar; Path=/';
    TestBed.configureTestingModule({ imports: [DashboardPage], providers: [provideAppTheme()] });
    TestBed.overrideComponent(DashboardPage, {
      set: {
        providers: [
          {
            provide: DashboardState,
            useValue: { state: signal({ kind: 'ready', data: dashboardFixture }), retry: vi.fn() },
          },
        ],
      },
    });
    const f = TestBed.createComponent(DashboardPage);
    await f.whenStable();
    const root = f.nativeElement as HTMLElement;
    await vi.waitFor(() => {
      f.detectChanges();
      expect(root.textContent).toContain('لوحة تحكم مدير النظام');
    });
    expect(root.textContent).not.toContain('superAdminDashboard.');
    expect(root.textContent).not.toContain('tenantManagement.');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const manage = root.querySelector<HTMLButtonElement>('[data-testid=manage-tenants] button');
    expect(manage).not.toBeNull();
    manage?.click();
    expect(navigate).toHaveBeenCalledWith('/super-admin/tenants');
    expect(fixtureItem(f.componentInstance.metrics(), 2).accent).toBe(
      TestBed.inject(ThemeService).theme().colors.brand2,
    );
  });
  it('does not show a Basic Data shortcut even when shell navigation is available', async () => {
    const available = signal(true),
      open = vi.fn();
    TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideAppTheme(),
        { provide: SHELL_DATA_NAVIGATION, useValue: { available, open } },
      ],
    });
    TestBed.overrideComponent(DashboardPage, {
      set: {
        providers: [
          {
            provide: DashboardState,
            useValue: { state: signal({ kind: 'ready', data: dashboardFixture }), retry: vi.fn() },
          },
        ],
      },
    });
    const f = TestBed.createComponent(DashboardPage);
    await f.whenStable();
    const root = f.nativeElement as HTMLElement;
    expect(root.querySelector('[data-testid=open-data]')).toBeNull();
    expect(open).not.toHaveBeenCalled();
    available.set(false);
    await f.whenStable();
    expect(root.querySelector('[data-testid=open-data]')).toBeNull();
  });
});

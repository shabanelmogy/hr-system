import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideAppTheme, ThemeService } from '../../../../theme/public-api';
import { DashboardState } from '../state/dashboard-state';
import { dashboardFixture } from '../dashboard.fixture';
import { DashboardPage } from './dashboard-page';

describe('Independent dashboard namespace and readable accents',()=>{
  afterEach(()=>{document.cookie='i18next=; Path=/; Max-Age=0';});
  it('loads its own Arabic captions on a direct reload and uses the shared strong secondary brand',async()=>{
    document.cookie='i18next=ar; Path=/';
    TestBed.configureTestingModule({imports:[DashboardPage],providers:[provideAppTheme()]});
    TestBed.overrideComponent(DashboardPage,{set:{providers:[{provide:DashboardState,useValue:{state:signal({kind:'ready',data:dashboardFixture}),retry:vi.fn()}}]}});
    const f=TestBed.createComponent(DashboardPage);await f.whenStable();const root=f.nativeElement as HTMLElement;
    await vi.waitFor(()=>{f.detectChanges();expect(root.textContent).toContain('لوحة تحكم مدير النظام');});
    expect(root.textContent).not.toContain('superAdminDashboard.');expect(root.textContent).not.toContain('tenantManagement.');
    expect(f.componentInstance.metrics()[2].accent).toBe(TestBed.inject(ThemeService).theme().colors.brand2);
  });
});

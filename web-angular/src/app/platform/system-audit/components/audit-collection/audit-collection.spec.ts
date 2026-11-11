import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MyDataGrid } from '../../../../shared/ui/public-api';
import { auditTestSetup } from '../../audit.spec-setup';
import { AuditCollection } from './audit-collection';

describe('Audit authoritative collection composition', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });
  it('supplies six stable columns, composite identity, unknown totals and single-click detail', async () => {
    const { detail } = await auditTestSetup();
    const fixture = TestBed.createComponent(AuditCollection);
    await fixture.whenStable();
    expect(fixture.componentInstance.columns().map((column) => column.key)).toEqual([
      'occurredOn',
      'action',
      'record',
      'moduleCode',
      'userName',
      'changeCount',
    ]);
    expect(fixture.componentInstance.source().result?.total).toBeNull();
    expect(fixture.componentInstance.source().result?.rows[0]?.key).toBe('hr:1');
    const grid = fixture.debugElement.query(By.directive(MyDataGrid))
      .componentInstance as MyDataGrid<unknown>;
    expect(grid.rowActivation()).toBe('click');
    expect(grid.pageSizes()).toEqual([25]);
    expect(grid.recordNavigation()).toBe(true);
    expect(grid.selectionEnabled()).toBe(true);
    expect(fixture.componentInstance.columns().every((column) => !column.sortField)).toBe(true);
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLElement>('[data-collection-row]')?.click();
    expect(detail.open).toHaveBeenCalledWith(expect.objectContaining({ moduleCode: 'hr', id: 1 }));
  });
});

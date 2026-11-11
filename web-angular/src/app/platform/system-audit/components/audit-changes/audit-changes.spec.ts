import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MyDataGrid } from '../../../../shared/ui/public-api';
import { LocalizationRuntime } from '../../../localization/public-api';
import { auditTestSetup } from '../../audit.spec-setup';
import { auditDetailFixture } from '../../audit.fixture';
import { AuditChanges } from './audit-changes';

describe('Audit field snapshot table', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });
  it('pages the returned changes locally, preserves text escaping and resets on a new detail', async () => {
    await auditTestSetup();
    const fixture = TestBed.createComponent(AuditChanges);
    fixture.componentRef.setInput('details', auditDetailFixture);
    await fixture.whenStable();
    const owner = fixture.componentInstance,
      root = fixture.nativeElement as HTMLElement;
    expect(owner.source().result?.rows).toHaveLength(10);
    expect(root.textContent).toContain('<script>literal text</script>');
    expect(root.querySelector('script')).toBeNull();
    owner.changePage({ pageIndex: 1, pageSize: 10 });
    await fixture.whenStable();
    expect(owner.source().result?.rows[0]?.id).toBe(10);
    owner.changePage({ pageIndex: 0, pageSize: 25 });
    expect(owner.source().result?.rows).toHaveLength(25);
    owner.changePage({ pageIndex: 0, pageSize: 50 });
    expect(owner.source().result?.rows).toHaveLength(26);
    fixture.componentRef.setInput('details', { ...auditDetailFixture, changes: [] });
    await fixture.whenStable();
    expect(owner.source().query.pageIndex).toBe(0);
    expect(root.textContent).toContain('No field details were recorded for this action.');
  });
  it('sorts the full changes array locally with stable IDs and retains shared selection/navigation', async () => {
    await auditTestSetup();
    const fixture = TestBed.createComponent(AuditChanges);
    fixture.componentRef.setInput('details', auditDetailFixture);
    await fixture.whenStable();
    const owner = fixture.componentInstance;
    const grid = fixture.debugElement.query(By.directive(MyDataGrid))
      .componentInstance as MyDataGrid<unknown>;
    expect(owner.columns().map((column) => column.sortField)).toEqual([
      'field',
      'oldValue',
      'newValue',
    ]);
    expect(grid.recordNavigation()).toBe(true);
    expect(grid.selectionEnabled()).toBe(true);
    expect(grid.controller.selectedIds()).toEqual([]);
    owner.changePage({ pageIndex: 1, pageSize: 10 });
    grid.sortChange.emit({ field: 'field', direction: 'asc' });
    await fixture.whenStable();
    expect(owner.source().query.pageIndex).toBe(0);
    expect(owner.source().result?.rows[0]).toMatchObject({ id: 0, field: 'NameEn' });
    grid.sortChange.emit({ field: 'oldValue', direction: 'asc' });
    await fixture.whenStable();
    expect(owner.source().result?.rows[0]).toMatchObject({ id: 0, oldValue: null });
    grid.sortChange.emit({ field: 'oldValue', direction: 'desc' });
    await fixture.whenStable();
    expect(owner.source().result?.rows[0]).toMatchObject({ id: 9, oldValue: 'Before 9' });
    expect(auditDetailFixture.changes[0]?.field).toBe('NameEn');
    fixture.componentRef.setInput('details', { ...auditDetailFixture, changes: [] });
    await fixture.whenStable();
    expect(owner.source().query.pageIndex).toBe(0);
    expect(grid.sort()).toBeUndefined();
  });
  it('exposes the shared local text-filter control for the detail snapshot', async () => {
    await auditTestSetup();
    const fixture = TestBed.createComponent(AuditChanges);
    fixture.componentRef.setInput('details', auditDetailFixture);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('erp-collection-text-filter')).not.toBeNull();
  });
  it.each(['en', 'ar'] as const)(
    'filters the complete snapshot by the displayed %s field label',
    async (language) => {
      await auditTestSetup();
      TestBed.inject(LocalizationRuntime).setLanguage(language);
      const fixture = TestBed.createComponent(AuditChanges);
      fixture.componentRef.setInput('details', auditDetailFixture);
      await fixture.whenStable();
      const owner = fixture.componentInstance;
      const displayedLabel = language === 'ar' ? 'الاسم بالإنجليزي' : 'English name';
      owner.changePage({ pageIndex: 2, pageSize: 10 });
      owner.collection.changeFilter({
        field: 'field',
        operator: 'equals',
        values: [displayedLabel],
      });
      expect(owner.source().query.pageIndex).toBe(0);
      expect(owner.source().result?.total).toBe(1);
      expect(owner.source().result?.rows[0]).toMatchObject({ id: 0, field: 'NameEn' });
    },
  );
});

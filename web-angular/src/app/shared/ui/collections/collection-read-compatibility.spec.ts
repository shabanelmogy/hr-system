import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideAppTheme } from '../../../../theme/public-api';
import { LocalizationRuntime } from '../../../platform/localization/public-api';
import { ActionButton, CardList, CollectionCardTemplate, CollectionCardHeader, CollectionCardFooter, MyDataGrid, ProgressMeter, type CollectionColumn, type CollectionSearch, type CollectionSource } from '../public-api';
import { CollectionFrame } from './collection-frame';

interface RecordFixture { id: number; name: string; }
const query = { scopeKey: 'fixture', criteriaKey: 'all', pageIndex: 0, pageSize: 5 };
@Component({ imports: [MyDataGrid], template: `<erp-data-table [source]="source" label="Search fixture" [columns]="columns" [rowId]="id" [search]="search()" (searchChange)="changed($event)" />` })
class SearchFixture {
  readonly source: CollectionSource<RecordFixture> = { query, kind: 'ready', result: { query, rows: [{ id: 1, name: 'Fixture' }], total: 1, hasNextPage: false } };
  readonly id = (row: RecordFixture) => row.id;
  readonly columns: CollectionColumn<RecordFixture>[] = [{ key: 'name', header: 'Name fixture', value: row => row.name, sortField: 'name' }];
  readonly search = signal<CollectionSearch>({ value: '', placeholder: 'Search fixture', maxLength: 2 });
  readonly changed = vi.fn();
}
@Component({ imports: [CardList, CollectionCardTemplate, CollectionCardHeader, CollectionCardFooter, ActionButton], template: `
  <erp-card-list [source]="source" label="Cards fixture" [rowId]="id" [rowLabel]="label">
    @if(custom()){
      <ng-template [erpCollectionCardHeader]="source" let-row><h3>Header {{row.name}}</h3></ng-template>
      <ng-template [erpCollectionCardFooter]="source" let-row><erp-button [label]="row.name" (activated)="opened.set(row.id)" /></ng-template>
    }
    <ng-template [erpCollectionCard]="source" let-row><span>Body {{row.id}}</span></ng-template>
  </erp-card-list>` })
class CardFixture {
  readonly source: CollectionSource<RecordFixture> = { query, kind: 'ready', result: { query, rows: [{ id: 7, name: 'Fixture' }], total: 1, hasNextPage: false } };
  readonly id = (row: RecordFixture) => row.id; readonly label = (row: RecordFixture) => row.name;
  readonly custom = signal(true); readonly opened = signal<number | null>(null);
}
describe('Shared read-workspace compatibility extensions', () => {
  // jsdom has no layout observer; Chrome acceptance owns actual resize/scroll proof.
  beforeEach(async () => { vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} }); TestBed.configureTestingModule({ providers: [provideAppTheme()] }); await TestBed.inject(LocalizationRuntime).loadNamespace('core'); });
  afterEach(() => { TestBed.resetTestingModule(); vi.unstubAllGlobals(); });
  it('shows bounded search feedback without emitting an invalid request or losing a draft on label changes', async () => {
    const fixture = TestBed.createComponent(SearchFixture); await fixture.whenStable();
    const frame = fixture.debugElement.query(By.directive(CollectionFrame)).componentInstance as CollectionFrame<RecordFixture>;
    const owner = fixture.componentInstance, root = fixture.nativeElement as HTMLElement;
    expect(owner.changed).not.toHaveBeenCalled(); frame.searchControl.setValue('abc'); frame.searchControl.markAsTouched(); await fixture.whenStable();
    expect(owner.changed).not.toHaveBeenCalled(); expect(root.querySelector('.error')).not.toBeNull();
    owner.search.update(value => ({ ...value, placeholder: 'Changed language fixture' })); await fixture.whenStable();
    expect(frame.searchControl.value).toBe('abc'); expect(frame.searchControl.invalid).toBe(true);
    frame.searchControl.setValue('ab'); await fixture.whenStable(); expect(owner.changed).toHaveBeenCalledExactlyOnceWith({ value: 'ab' });
  });
  it('retains unbounded default search and does not emit when external criteria are synchronized', async () => {
    const fixture = TestBed.createComponent(SearchFixture); fixture.componentInstance.search.set({ value: 'owner', placeholder: 'Fixture' }); await fixture.whenStable();
    const frame = fixture.debugElement.query(By.directive(CollectionFrame)).componentInstance as CollectionFrame<RecordFixture>;
    expect(frame.searchControl.value).toBe('owner'); expect(fixture.componentInstance.changed).not.toHaveBeenCalled();
    frame.searchControl.setValue('x'.repeat(201)); await fixture.whenStable(); expect(fixture.componentInstance.changed).toHaveBeenCalledExactlyOnceWith({ value: 'x'.repeat(201) });
  });
  it('projects typed per-record header/body/footer through the existing shared card and preserves default title behavior', async () => {
    const fixture = TestBed.createComponent(CardFixture); await fixture.whenStable(); const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('erp-surface-card header h3')?.textContent).toBe('Header Fixture');
    expect(root.querySelector('.surface-content')?.textContent).toContain('Body 7');
    root.querySelector<HTMLButtonElement>('.surface-footer button')!.click(); await fixture.whenStable(); expect(fixture.componentInstance.opened()).toBe(7);
    fixture.componentInstance.custom.set(false); await fixture.whenStable();
    expect(root.querySelector('erp-surface-card header h2')?.textContent).toBe('Fixture'); expect(root.querySelector('.surface-footer')).toBeNull();
  });
  it('keeps usage color defaults while allowing a generic owner-defined progress accent', async () => {
    const fixture = TestBed.createComponent(ProgressMeter); fixture.componentRef.setInput('label', 'Progress fixture'); fixture.componentRef.setInput('description', '90');
    fixture.componentRef.setInput('used', 90); fixture.componentRef.setInput('limit', 100); await fixture.whenStable();
    expect(fixture.componentInstance.tokens().value.background).toBe('var(--warning)');
    fixture.componentRef.setInput('accent', 'var(--success)'); await fixture.whenStable(); expect(fixture.componentInstance.tokens().value.background).toBe('var(--success)');
    fixture.componentRef.setInput('accent', null); await fixture.whenStable(); expect(fixture.componentInstance.tokens().value.background).toBe('var(--warning)');
  });
  it('coalesces vendor input synchronization and emits only a committed user sort', async () => {
    const fixture = TestBed.createComponent(SearchFixture); await fixture.whenStable();
    const grid = fixture.debugElement.query(By.directive(MyDataGrid)).componentInstance as MyDataGrid<RecordFixture>;
    const emitted = vi.fn(); grid.sortChange.subscribe(emitted);
    grid.changeSort({ field: 'name', order: 1 }); grid.changeSort({ field: 'name', order: -1 });
    await Promise.resolve(); expect(emitted).toHaveBeenCalledExactlyOnceWith({ field: 'name', direction: 'desc' });
    grid.changeSort({ field: 'unknown', order: 1 }); await Promise.resolve(); expect(emitted).toHaveBeenCalledOnce();
    grid.changeSort({ field: 'name', order: 1 }); fixture.destroy(); await Promise.resolve(); expect(emitted).toHaveBeenCalledOnce();
  });
});

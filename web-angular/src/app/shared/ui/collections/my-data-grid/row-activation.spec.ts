import { TestBed } from '@angular/core/testing';
import { provideAppTheme } from '../../../../../theme/public-api';
import { LocalizationRuntime } from '../../../../platform/localization/public-api';
import { MyDataGrid } from './my-data-grid';

describe('Shared Grid row activation policy', () => {
  beforeEach(async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    TestBed.configureTestingModule({ providers: [provideAppTheme()] });
    await TestBed.inject(LocalizationRuntime).loadNamespace('core');
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });
  async function setup() {
    const fixture = TestBed.createComponent(MyDataGrid<{ id: number; name: string }>);
    const query = { scopeKey: 'activation', criteriaKey: 'all', pageIndex: 0, pageSize: 10 };
    fixture.componentRef.setInput('source', {
      kind: 'ready',
      query,
      result: { query, rows: [{ id: 1, name: 'Record' }], total: 1, hasNextPage: false },
    });
    fixture.componentRef.setInput('rowId', (row: { id: number }) => row.id);
    fixture.componentRef.setInput('label', 'Records');
    fixture.componentRef.setInput('columns', [
      { key: 'name', header: 'Name', value: (row: { name: string }) => row.name },
    ]);
    const opened = vi.fn();
    fixture.componentInstance.rowActivated.subscribe(opened);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const row = root.querySelector<HTMLElement>('[data-collection-row]');
    if (!row) throw Error('Expected rendered collection row');
    return { fixture, row, opened };
  }
  it('preserves double-click and Enter activation by default', async () => {
    const { fixture, row, opened } = await setup();
    row.click();
    expect(opened).not.toHaveBeenCalled();
    row.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(opened).toHaveBeenCalledTimes(1);
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(opened).toHaveBeenCalledTimes(2);
    fixture.destroy();
  });
  it('opts into single-click without duplicating double-click or activating nested interactive controls', async () => {
    const { fixture, row, opened } = await setup();
    fixture.componentRef.setInput('rowActivation', 'click');
    await fixture.whenStable();
    row.click();
    expect(opened).toHaveBeenCalledTimes(1);
    row.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(opened).toHaveBeenCalledTimes(1);
    const button = document.createElement('button');
    row.querySelector('td')?.append(button);
    button.click();
    expect(opened).toHaveBeenCalledTimes(1);
  });
});

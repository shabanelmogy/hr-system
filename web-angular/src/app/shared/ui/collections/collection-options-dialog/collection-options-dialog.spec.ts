import { TestBed } from '@angular/core/testing';
import { CollectionOptionsDialog } from './collection-options-dialog';

describe('Controlled internal collection options', () => {
  it('protects required and last visible columns and rejects untyped vendor values', () => {
    const fixture = TestBed.createComponent(CollectionOptionsDialog);
    fixture.componentRef.setInput('columns', [
      { key: 'id', header: 'ID', hideable: false, value: () => 1 },
      { key: 'name', header: 'Name', value: () => 'First' },
    ]);
    fixture.componentRef.setInput('visibleColumns', ['id', 'name']);
    const changed = vi.fn();
    fixture.componentInstance.columnsChange.subscribe(changed);
    fixture.componentInstance.toggleColumn('id', false);
    fixture.componentInstance.toggleColumn('unknown', false);
    fixture.componentInstance.toggleColumn('name', 'false');
    expect(changed).not.toHaveBeenCalled();
    fixture.componentInstance.toggleColumn('name', false);
    expect(changed).toHaveBeenCalledExactlyOnceWith(['id']);
    expect(fixture.componentInstance.visibleColumns()).toEqual(['id', 'name']);
    fixture.componentRef.setInput('visibleColumns', ['name']);
    fixture.componentInstance.toggleColumn('name', false);
    expect(changed).toHaveBeenLastCalledWith(['name']);
  });

  it('guards optional pin tools and resets only local search plus owner presentation', () => {
    const fixture = TestBed.createComponent(CollectionOptionsDialog);
    fixture.componentRef.setInput('columns', [
      { key: 'name', header: 'Name', value: () => 'First' },
    ]);
    const pin = vi.fn(),
      density = vi.fn(),
      reset = vi.fn();
    fixture.componentInstance.columnPin.subscribe(pin);
    fixture.componentInstance.densityChange.subscribe(density);
    fixture.componentInstance.displayReset.subscribe(reset);
    fixture.componentInstance.pin('name', 'start');
    expect(pin).not.toHaveBeenCalled();
    fixture.componentRef.setInput('columnTools', true);
    fixture.componentInstance.pin('unknown', 'start');
    fixture.componentInstance.pin('name', 'invalid');
    fixture.componentInstance.pin('name', 'start');
    expect(pin).toHaveBeenCalledExactlyOnceWith({ key: 'name', side: 'start' });
    fixture.componentInstance.changeDensity('invalid');
    fixture.componentInstance.changeDensity('compact');
    expect(density).toHaveBeenCalledExactlyOnceWith('compact');
    fixture.componentInstance.columnSearch.set('NAME');
    expect(fixture.componentInstance.optionColumns()).toHaveLength(1);
    fixture.componentInstance.resetOptions();
    expect(fixture.componentInstance.columnSearch()).toBe('');
    expect(reset).toHaveBeenCalledExactlyOnceWith(undefined);
  });
});

import { TestBed } from '@angular/core/testing';
import { provideAppTheme } from '../../../../../theme/public-api';
import { LocalizationRuntime } from '../../../../platform/localization/public-api';
import { CollectionTextFilter } from './collection-text-filter';

describe('Shared local text filter editor', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideAppTheme()] });
    await TestBed.inject(LocalizationRuntime).loadNamespace('core');
  });
  afterEach(() => TestBed.resetTestingModule());
  it('builds typed multiple values and clears through the public output', async () => {
    const fixture = TestBed.createComponent(CollectionTextFilter);
    fixture.componentRef.setInput('columns', [{ field: 'oldValue', label: 'Old value' }]);
    const emitted = vi.fn();
    fixture.componentInstance.filterChange.subscribe(emitted);
    await fixture.whenStable();
    const owner = fixture.componentInstance;
    owner.chooseOperator('isAnyOf');
    const first = owner.draft().values[0];
    if (!first) throw Error('Expected one initial filter value.');
    owner.changeValue(first.key, '  first  ');
    owner.addValue();
    const second = owner.draft().values[1];
    if (!second) throw Error('Expected second filter value.');
    owner.changeValue(second.key, 'second');
    owner.apply();
    expect(emitted).toHaveBeenLastCalledWith({
      field: 'oldValue',
      operator: 'isAnyOf',
      values: ['first', 'second'],
    });
    owner.removeValue(first.key);
    expect(owner.draft().values.map((entry) => entry.value)).toEqual(['second']);
    owner.clear();
    expect(emitted).toHaveBeenLastCalledWith(null);
  });
  it('restores an applied unary criterion and ignores unregistered fields/operators', async () => {
    const fixture = TestBed.createComponent(CollectionTextFilter);
    fixture.componentRef.setInput('columns', [{ field: 'oldValue', label: 'Old value' }]);
    fixture.componentRef.setInput('filter', { field: 'oldValue', operator: 'isEmpty', values: [] });
    await fixture.whenStable();
    const owner = fixture.componentInstance;
    expect(owner.unary()).toBe(true);
    expect(owner.operatorChoices()).toHaveLength(9);
    owner.chooseField('unknown');
    owner.chooseOperator('unknown');
    expect(owner.draft()).toMatchObject({ field: 'oldValue', operator: 'isEmpty' });
  });
});

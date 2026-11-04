import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { GridFilterInput } from './grid-filter-input';
import { OptionSelect } from '../../controls/option-select/option-select';
import { provideAppTheme } from '../../../../../theme/public-api';

describe('shared column choice input', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('renders the existing option selector, emits wire values and clears to null', async () => {
    TestBed.configureTestingModule({ providers: [provideAppTheme()] });
    const fixture = TestBed.createComponent(GridFilterInput);
    const changed = vi.fn();
    fixture.componentRef.setInput('label', 'Status');
    fixture.componentRef.setInput('definition', {
      field: 'status',
      type: 'text',
      modes: ['equals'],
      choices: [{ value: 'draft', label: 'مسودة' }],
    });
    fixture.componentRef.setInput('value', 'draft');
    fixture.componentInstance.changed.subscribe(changed);
    await fixture.whenStable();
    const select = fixture.debugElement.query(By.directive(OptionSelect))
      .componentInstance as OptionSelect;
    expect(select.value()).toBe('draft');
    expect(select.options()).toContainEqual({ value: 'draft', label: 'مسودة' });
    select.valueChange.emit('draft');
    expect(changed).toHaveBeenLastCalledWith('draft');
    select.valueChange.emit('unknown');
    expect(changed).toHaveBeenCalledTimes(1);
    select.valueChange.emit('');
    expect(changed).toHaveBeenLastCalledWith(null);
  });
});

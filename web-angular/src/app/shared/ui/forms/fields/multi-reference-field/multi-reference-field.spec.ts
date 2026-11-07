import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideAppTheme } from '../../../../../../theme/public-api';
import { LocalizationRuntime } from '../../../../../platform/localization/public-api';
import { MultiReferenceField } from './multi-reference-field';

@Component({
  imports: [FormField, MultiReferenceField],
  templateUrl: './multi-reference-field.spec.html',
})
class SignalFixture {
  readonly model = signal({ ids: [] as string[] });
  readonly form = form(this.model);
  readonly options = signal([{ value: 'available', label: 'Available' }]);
  readonly readonly = signal(false);
}

describe('MultiReferenceField', () => {
  it('associates server feedback and help with the actual keyboard-focusable combobox', async () => {
    const fixture = TestBed.createComponent(MultiReferenceField);
    fixture.componentRef.setInput('label', 'Tenants');
    fixture.componentRef.setInput('help', 'Choose an enabled tenant');
    fixture.componentRef.setInput('options', []);
    fixture.componentRef.setInput('touched', true);
    fixture.componentRef.setInput('errors', [{ kind: 'server', message: 'Choose another tenant' }]);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector('[role=combobox]');
    expect(input?.getAttribute('aria-describedby')).toContain('-help');
    expect(input?.getAttribute('aria-describedby')).toContain('-error');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(element.textContent).toContain('Choose another tenant');
  });
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideAppTheme()] });
    await TestBed.inject(LocalizationRuntime).loadNamespace('core');
  });
  async function setup() {
    const fixture = TestBed.createComponent(SignalFixture);
    await fixture.whenStable();
    return {
      fixture,
      owner: fixture.componentInstance,
      field: fixture.debugElement.query(By.directive(MultiReferenceField))
        .componentInstance as MultiReferenceField,
      root: fixture.nativeElement as HTMLElement,
    };
  }
  it('retains an unavailable selected identifier as a disabled option', () => {
    const fixture = TestBed.createComponent(MultiReferenceField);
    const field = fixture.componentInstance;
    fixture.componentRef.setInput('options', [{ value: 'available', label: 'Available' }]);
    field.writeValue(['unavailable']);
    expect(field.displayOptions()).toContainEqual(
      expect.objectContaining({ value: 'unavailable', disabled: true }),
    );
  });
  it('binds a signal form, retains unavailable identifiers after options change, and accepts their explicit removal', async () => {
    const { fixture, owner, field } = await setup();
    field.choose(['available']);
    await fixture.whenStable();
    expect(owner.model().ids).toEqual(['available']);
    owner.model.set({ ids: ['unavailable', 'available'] });
    owner.options.set([]);
    await fixture.whenStable();
    expect(field.displayOptions()).toEqual(
      expect.arrayContaining([expect.objectContaining({ value: 'unavailable', disabled: true })]),
    );
    owner.options.set([{ value: 'available', label: 'Available' }]);
    await fixture.whenStable();
    field.choose(['available']);
    expect(owner.model().ids).toEqual(['available']);
  });
  it('allows explicit removal of one retained unavailable identifier without silently dropping another', async () => {
    const fixture = TestBed.createComponent(MultiReferenceField);
    fixture.componentRef.setInput('options', [{ value: 'valid', label: 'Valid' }]);
    const field = fixture.componentInstance;
    field.writeValue(['missing-one', 'missing-two', 'valid']);
    field.choose(['missing-two', 'valid']);
    expect(field.value()).toEqual(['missing-two', 'valid']);
  });
  it('guards readonly and disabled callbacks while exposing help/error ARIA and focus', async () => {
    const { fixture, owner, field, root } = await setup();
    owner.readonly.set(true);
    await fixture.whenStable();
    field.choose(['available']);
    expect(owner.model().ids).toEqual([]);
    owner.readonly.set(false);
    await fixture.whenStable();
    expect(field.isReadOnly()).toBe(false);
    field.choose(['available']);
    await fixture.whenStable();
    expect(owner.model().ids).toEqual(['available']);
    const input = root.querySelector<HTMLElement>('[role=combobox]');
    expect(input).not.toBeNull();
    expect(root.querySelector('p-multiselect')?.getAttribute('aria-describedby')).toContain(
      '-help',
    );
    field.focus();
    expect(document.activeElement).toBe(input);
  });
  it('rejects disabled callbacks and releases its control subscription on destruction', () => {
    const fixture = TestBed.createComponent(MultiReferenceField);
    fixture.componentRef.setInput('options', [{ value: 'available', label: 'Available' }]);
    fixture.componentRef.setInput('disabled', true);
    const field = fixture.componentInstance;
    field.choose(['available']);
    expect(field.value()).toEqual([]);
    fixture.destroy();
    expect(() => field.control.setValue(['available'])).not.toThrow();
    expect(field.value()).toEqual([]);
  });
});

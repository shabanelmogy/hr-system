import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideAppTheme } from '../../../../theme/public-api';
import { LocalizationRuntime } from '../../../platform/localization/public-api';
import { ActionButton, FormContainer, TextField } from '../public-api';

@Component({ imports: [ReactiveFormsModule, FormContainer, TextField, ActionButton], template: `
  <erp-form [form]="form" title="Read form fixture" submitLabel="Save fixture" [showSubmit]="showSubmit()" (validSubmit)="submitted()">
    <erp-text-field [formControl]="form.controls.name" label="Name fixture" [readOnly]="true" />
    <erp-button formActions label="Close fixture" (activated)="closed()" />
  </erp-form>` })
class ReadFormFixture {
  readonly showSubmit = signal(false); readonly form = new FormGroup({ name: new FormControl('Fixture', { nonNullable: true }) });
  readonly submitted = vi.fn(); readonly closed = vi.fn();
}
describe('Shared form hidden primary action', () => {
  beforeEach(async () => { TestBed.configureTestingModule({ providers: [provideAppTheme()] }); await TestBed.inject(LocalizationRuntime).loadNamespace('core'); });
  it('has no fake Save in a read view and blocks synthetic submit while keeping projected Close', async () => {
    const fixture = TestBed.createComponent(ReadFormFixture); await fixture.whenStable(); const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('button[type=submit]')).toBeNull(); root.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    root.querySelector<HTMLButtonElement>('button')!.click(); await fixture.whenStable();
    expect(fixture.componentInstance.submitted).not.toHaveBeenCalled(); expect(fixture.componentInstance.closed).toHaveBeenCalledOnce();
    fixture.componentInstance.showSubmit.set(true); await fixture.whenStable();
    root.querySelector<HTMLButtonElement>('button[type=submit]')!.click(); await fixture.whenStable(); expect(fixture.componentInstance.submitted).toHaveBeenCalledOnce();
  });
});

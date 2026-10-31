import { TestBed } from '@angular/core/testing';
import { provideAppTheme } from '../../../../theme/public-api';
import { ConfirmationDialog } from '../dialogs/confirmation-dialog';
import { ChoiceDialog } from '../dialogs/choice-dialog';
import { FormCloseGuard } from './form-close-guard';

describe('Shared close components', () => {
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideAppTheme()] }); });
  it('rechecks current input bindings before old consent callbacks and emits the current clean identity', async () => {
    const fixture = TestBed.createComponent(FormCloseGuard);
    fixture.componentRef.setInput('identity', 'A'); fixture.componentRef.setInput('revision', 1);
    fixture.componentRef.setInput('unsaved', true); await fixture.whenStable();
    const guard = fixture.componentInstance; const closed: string[] = [];
    guard.closed.subscribe(value => closed.push(value.identity));
    guard.requestClose(); const previous = guard.prompts()[0];
    fixture.componentRef.setInput('identity', 'B');
    guard.discard(previous); expect(closed).toEqual([]);
    fixture.componentRef.setInput('unsaved', false); await fixture.whenStable();
    guard.requestClose(); guard.requestClose(); expect(closed).toEqual(['B']);
    fixture.destroy(); guard.requestClose(); expect(closed).toEqual(['B']);
  });
  it('invalidates a rendered prompt on revision or pending replacement and ignores old queued clicks', async () => {
    const fixture = TestBed.createComponent(FormCloseGuard);
    fixture.componentRef.setInput('identity', 'A'); fixture.componentRef.setInput('revision', 1);
    fixture.componentRef.setInput('unsaved', true); await fixture.whenStable();
    const guard = fixture.componentInstance; let closed = 0; guard.closed.subscribe(() => closed++);
    guard.requestClose(); const old = guard.prompts()[0];
    fixture.componentRef.setInput('revision', 2); await fixture.whenStable();
    expect(guard.prompts()).toEqual([]); guard.requestClose(); const next = guard.prompts()[0];
    guard.discard(old); expect(closed).toBe(0); expect(guard.prompts()).toEqual([next]);
    fixture.componentRef.setInput('pending', true); await fixture.whenStable();
    guard.discard(next); expect(closed).toBe(0); expect(guard.prompts()).toEqual([]);
  });
  it('confirmation actions and existing scope dialog handlers guard hidden/busy/unregistered choices', async () => {
    const fixture = TestBed.createComponent(ConfirmationDialog);
    for (const [key, value] of Object.entries({ title: 'Confirm fixture', cancelLabel: 'Keep fixture', confirmLabel: 'Discard fixture' })) fixture.componentRef.setInput(key, value);
    let count = 0; fixture.componentInstance.confirmed.subscribe(() => count++);
    fixture.componentInstance.confirm(); expect(count).toBe(0);
    fixture.componentRef.setInput('open', true); fixture.componentRef.setInput('pending', true);
    fixture.componentInstance.confirm(); expect(count).toBe(0);
    fixture.componentRef.setInput('pending', false); fixture.componentInstance.confirm(); expect(count).toBe(1);
    fixture.destroy();
    const choice = TestBed.createComponent(ChoiceDialog);
    for (const [key, value] of Object.entries({ title: 'Choice fixture', cancelLabel: 'Cancel fixture', continueLabel: 'Continue fixture', closeLabel: 'Close fixture', options: [{ value: 'A', label: 'A' }], open: true })) choice.componentRef.setInput(key, value);
    let selected = ''; choice.componentInstance.chosen.subscribe(value => selected = value);
    choice.componentInstance.select('unknown'); choice.componentInstance.choose(); expect(selected).toBe('');
    choice.componentInstance.select('A'); choice.componentRef.setInput('pending', true);
    choice.componentInstance.choose(); expect(selected).toBe('');
    choice.componentRef.setInput('pending', false); choice.componentInstance.choose(); expect(selected).toBe('A');
  });
});

import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { providePrimeNG } from 'primeng/config';
import { ActionButton, ActionButtonGroup } from '../public-api';

@Component({
  imports: [ActionButton, ActionButtonGroup],
  templateUrl: './action-button-group.spec.host.html',
})
class GroupComposition {
  readonly label = signal('Report creation');
  readonly busy = signal(false);
  readonly canRegister = signal(true);
  uploads = 0;
}

describe('Shared PrimeNG action group composition', () => {
  it('retains the original control and its pending guard when the label and permitted actions change', async () => {
    TestBed.configureTestingModule({ providers: [providePrimeNG({ ripple: false })] });
    const fixture = TestBed.createComponent(GroupComposition);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const button = root.querySelector('button');
    if (!button) throw new Error('The projected upload action must be rendered.');
    expect(root.querySelector('[role="group"][aria-label="Report creation"]')).not.toBeNull();
    button.click();
    expect(fixture.componentInstance.uploads).toBe(1);
    fixture.componentInstance.busy.set(true);
    fixture.componentInstance.canRegister.set(false);
    fixture.componentInstance.label.set('إنشاء التقارير');
    await fixture.whenStable();
    expect(root.querySelector('button')).toBe(button);
    expect(root.querySelectorAll('button')).toHaveLength(1);
    expect(root.querySelector('[role="group"][aria-label="إنشاء التقارير"]')).not.toBeNull();
    expect(button.disabled).toBe(true);
    button.click();
    expect(fixture.componentInstance.uploads).toBe(1);
  });
});

import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { providePrimeNG } from 'primeng/config';
import { LocalizationRuntime, UiTextPipe } from '../../../platform/localization/public-api';
import { ActionButton } from './public-api';

@Component({ imports: [ActionButton, UiTextPipe], template: `
  <nav><erp-button [label]="'general.mainTitle' | uiText" [busy]="busy()" [disabled]="disabled()" (activated)="count = count + 1" /></nav>
` })
class ToolbarComposition { readonly busy = signal(false); readonly disabled = signal(false); count = 0; }

@Component({ imports: [ActionButton], template: `
  <form novalidate (submit)="submit($event)"><erp-button label="Save fixture" type="submit" /></form>
` })
class SubmitComposition {
  count = 0;
  submit(event: SubmitEvent): void { event.preventDefault(); this.count++; }
}

describe('Shared action button in distinct compositions', () => {
  beforeEach(() => {
    document.cookie = 'i18next=; Path=/; Max-Age=0';
    TestBed.configureTestingModule({ providers: [providePrimeNG({ ripple: false })] });
  });
  afterEach(() => { document.cookie = 'i18next=; Path=/; Max-Age=0'; });

  it('defaults to an enabled non-submit action, retains its label while busy and blocks duplicate activation', async () => {
    const fixture = TestBed.createComponent(ToolbarComposition); await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    expect(button.type).toBe('button'); expect(button.disabled).toBe(false);
    button.click(); expect(fixture.componentInstance.count).toBe(1);
    fixture.componentInstance.busy.set(true); await fixture.whenStable();
    expect(button.disabled).toBe(true); expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.textContent).toContain('ERP System'); button.click();
    expect(fixture.componentInstance.count).toBe(1);
    fixture.componentInstance.busy.set(false); fixture.componentInstance.disabled.set(true); await fixture.whenStable();
    expect(button.disabled).toBe(true); expect(button.hasAttribute('aria-busy')).toBe(false);
  });

  it('repaints translated accessible text in the zoneless composition', async () => {
    const fixture = TestBed.createComponent(ToolbarComposition); await fixture.whenStable();
    const runtime = TestBed.inject(LocalizationRuntime); runtime.setLanguage('ar'); await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('button')?.textContent?.trim()).toBe(runtime.translate('general.mainTitle'));
  });

  it('preserves explicit native submission semantics in a separate form composition', async () => {
    const fixture = TestBed.createComponent(SubmitComposition); await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    expect(button.type).toBe('submit'); expect(button.disabled).toBe(false);
    button.click(); expect(fixture.componentInstance.count).toBe(1);
  });

  it('exposes selection on the native control and supports programmatic focus', async () => {
    const fixture = TestBed.createComponent(ActionButton);
    fixture.componentRef.setInput('label', 'Palette fixture');
    fixture.componentRef.setInput('pressed', true);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    expect(button.getAttribute('aria-pressed')).toBe('true');
    fixture.componentInstance.focus(); expect(document.activeElement).toBe(button);
    fixture.componentRef.setInput('pressed', null); await fixture.whenStable();
    expect(button.hasAttribute('aria-pressed')).toBe(false);
  });
});

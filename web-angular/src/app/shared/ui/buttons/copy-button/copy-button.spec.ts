import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CopyButton } from './copy-button';

describe('Shared copy action', () => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  afterEach(() => {
    TestBed.resetTestingModule();
    if (original) Object.defineProperty(navigator, 'clipboard', original);
    else Reflect.deleteProperty(navigator, 'clipboard');
  });
  function setup(writeText = vi.fn<(text: string) => Promise<void>>(async () => undefined)) {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const value = signal<string | null>('authorized plain text');
    const fixture = TestBed.createComponent(CopyButton);
    fixture.componentRef.setInput('label', 'Copy');
    fixture.componentRef.setInput('content', () => value());
    return { fixture, value, writeText, owner: fixture.componentInstance };
  }
  it('reads current authorized content at activation and never falls back to previous text', async () => {
    const { owner, value, writeText } = setup();
    value.set(null);
    await owner.copy();
    expect(writeText).not.toHaveBeenCalled();
    value.set('current projection');
    await owner.copy();
    expect(writeText).toHaveBeenCalledExactlyOnceWith('current projection');
  });
  it('does not publish completion feedback after the content is replaced', async () => {
    let complete: (() => void) | undefined;
    const write = vi.fn(
      (_text: string) =>
        new Promise<void>((resolve) => {
          complete = resolve;
        }),
    );
    const { owner, value } = setup(write);
    const copying = owner.copy();
    value.set(null);
    complete?.();
    await copying;
    expect(owner.feedback()).toBe('');
  });
  it('reports clipboard rejection through application feedback without a native dialog', async () => {
    const write = vi.fn(async (_text: string) => {
      throw Error('Clipboard denied');
    });
    const { owner } = setup(write);
    await owner.copy();
    expect(owner.feedback()).toBe('errorDialog.copyFailed');
  });
  it('supports a labelled compact icon action and keeps copy feedback accessible', async () => {
    const { fixture, writeText } = setup();
    fixture.componentRef.setInput('iconOnly', true);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const button = root.querySelector('button');
    expect(button?.getAttribute('aria-label')).toBe('Copy');
    expect(root.querySelector('erp-icon')).not.toBeNull();
    button?.click();
    await fixture.whenStable();
    expect(writeText).toHaveBeenCalledExactlyOnceWith('authorized plain text');
    expect(root.querySelector('[aria-live="polite"]')?.textContent?.trim()).not.toBe('');
  });
});

import { TestBed } from '@angular/core/testing';
import { TextPanel } from './text-panel';

describe('Escaped read-only text panel', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });
  it('keeps raw text escaped with explicit direction and keyboard access', async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const fixture = TestBed.createComponent(TextPanel);
    const text = '<script>unsafe()</script>\nRaw stack <frame> & detail';
    fixture.componentRef.setInput('label', 'Diagnostics');
    fixture.componentRef.setInput('text', text);
    fixture.componentRef.setInput('direction', 'ltr');
    fixture.componentRef.setInput('monospace', true);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('script')).toBeNull();
    expect(root.querySelector('pre')?.textContent).toBe(text);
    expect(root.querySelector('pre')?.getAttribute('dir')).toBe('ltr');
    expect(root.querySelector('pre')?.tabIndex).toBe(0);
    expect(root.querySelector('erp-scroll-viewport')).not.toBeNull();
  });
});

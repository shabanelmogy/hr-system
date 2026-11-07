import { TestBed } from '@angular/core/testing';
import { ViewportDebugger } from './viewport-debugger';
import { UI_LOCALIZATION } from '../../../localization/public-api';
import { signal } from '@angular/core';

describe('Responsive viewport debugger', () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        {
          provide: UI_LOCALIZATION,
          useValue: {
            language: signal('en'),
            direction: signal('ltr'),
            translate: (key: string) => key,
          },
        },
      ],
    }),
  );
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
    else Reflect.deleteProperty(navigator, 'clipboard');
  });

  it('copies the current viewport and breakpoint after a resize through the shared copy action', async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>(async () => undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(900);
    const fixture = TestBed.createComponent(ViewportDebugger);
    await fixture.whenStable();
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(390);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(844);
    window.dispatchEvent(new Event('resize'));
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const copy = root.querySelector<HTMLButtonElement>('erp-copy-button button');
    expect(copy).not.toBeNull();
    copy?.click();
    await fixture.whenStable();
    expect(writeText).toHaveBeenCalledExactlyOnceWith('390 × 844 · xs');
  });

  it('shows CSS viewport dimensions and follows responsive boundaries on resize', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(900);
    const fixture = TestBed.createComponent(ViewportDebugger);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('1440 × 900 · lg');
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(390);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(844);
    window.dispatchEvent(new Event('resize'));
    await fixture.whenStable();
    expect(element.textContent).toContain('390×844');
    for (const [width, breakpoint] of [
      [600, 'sm'],
      [900, 'md'],
      [1200, 'lg'],
    ] as const) {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(width);
      window.dispatchEvent(new Event('resize'));
      await fixture.whenStable();
      expect(fixture.componentInstance.breakpoint()).toBe(breakpoint);
    }
    expect(element.querySelector('output')?.getAttribute('dir')).toBe('ltr');
  });
});

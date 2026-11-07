import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideAppTheme } from '../../../../../theme/public-api';
import { ContentTabs } from './content-tabs';

@Component({ imports: [ContentTabs], templateUrl: './content-tabs.spec.host.html' })
class TabsHost {
  readonly selected = signal('first');
  readonly requested = signal('');
  readonly tabs = [
    { id: 'first', label: 'First' },
    { id: 'second', label: 'Second' },
  ];
}
describe('Externally committed shared tabs', () => {
  beforeEach(() => {
    // jsdom has no geometry observer; native layout is checked in the browser harness.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });
  it('keeps the committed tab while consent is pending, then accepts the owner decision', async () => {
    TestBed.configureTestingModule({ providers: [provideAppTheme()] });
    const fixture = TestBed.createComponent(TabsHost);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const tabs = root.querySelectorAll<HTMLElement>('[role=tab]');
    tabs[1]?.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.requested()).toBe('second');
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true');
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('false');
    fixture.componentInstance.selected.set('second');
    await fixture.whenStable();
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
  });
});

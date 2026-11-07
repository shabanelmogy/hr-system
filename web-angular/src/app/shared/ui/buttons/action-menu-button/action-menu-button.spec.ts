import { TestBed } from '@angular/core/testing';
import { provideAppTheme } from '../../../../../theme/public-api';
import { fixtureItem } from '../../../../../testing/fixture-item';
import { ActionMenuButton } from './action-menu-button';

describe('Shared action menu button', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideAppTheme()] }));
  afterEach(() => TestBed.resetTestingModule());

  it('uses a named non-submit trigger and blocks pending, removed or disabled commands', async () => {
    const fixture = TestBed.createComponent(ActionMenuButton);
    fixture.componentRef.setInput('label', 'Report actions');
    fixture.componentRef.setInput('actions', [
      { id: 'upload', label: 'Upload', icon: 'upload' },
      { id: 'schema', label: 'Schema', disabled: true },
    ]);
    await fixture.whenStable();
    const owner = fixture.componentInstance;
    const activated = vi.fn();
    owner.activated.subscribe(activated);
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.type).toBe('button');
    expect(button?.getAttribute('aria-haspopup')).toBe('menu');
    expect(button?.textContent).toContain('Report actions');
    expect(button?.lastElementChild?.classList.contains('action-menu-indicator')).toBe(true);
    const upload = fixtureItem(owner.model(), 0);
    const schema = fixtureItem(owner.model(), 1);
    if (!upload.command || !schema.command) throw new Error('Fixture menu commands are required.');
    schema.command({});
    expect(activated).not.toHaveBeenCalled();
    upload.command({});
    expect(activated).toHaveBeenCalledExactlyOnceWith('upload');
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    upload.command({});
    expect(button?.disabled).toBe(true);
    fixture.componentRef.setInput('disabled', false);
    fixture.componentRef.setInput('actions', [{ id: 'schema', label: 'Schema' }]);
    await fixture.whenStable();
    upload.command({});
    expect(activated).toHaveBeenCalledTimes(1);
  });

  it('fails closed for ambiguous action identities and isolates trigger IDs per instance', async () => {
    const first = TestBed.createComponent(ActionMenuButton);
    const second = TestBed.createComponent(ActionMenuButton);
    for (const fixture of [first, second]) {
      fixture.componentRef.setInput('label', 'Actions');
      fixture.componentRef.setInput('actions', [{ id: 'same', label: 'Original' }]);
    }
    await first.whenStable();
    const activated = vi.fn();
    first.componentInstance.activated.subscribe(activated);
    const original = fixtureItem(first.componentInstance.model(), 0);
    if (!original.command) throw new Error('Fixture menu command is required.');
    for (const fixture of [first, second]) {
      fixture.componentRef.setInput('actions', [
        { id: 'same', label: 'First' },
        { id: 'same', label: 'Second' },
      ]);
      await fixture.whenStable();
      expect(fixture.componentInstance.model()).toEqual([]);
      expect((fixture.nativeElement as HTMLElement).querySelector('button')?.disabled).toBe(true);
    }
    original.command({});
    expect(activated).not.toHaveBeenCalled();
    expect(first.componentInstance.menuId).not.toBe(second.componentInstance.menuId);
  });
});

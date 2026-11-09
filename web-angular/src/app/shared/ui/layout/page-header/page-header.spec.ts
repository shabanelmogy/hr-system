import { PageHeader, type PageViewOption } from './page-header';
import { TestBed } from '@angular/core/testing';
import { provideAppTheme } from '../../../../../theme/public-api';
describe('Shared collection header views', () => {
  afterEach(() => TestBed.resetTestingModule());
  const options: readonly PageViewOption[] = ['grid', 'cards', 'chart', 'report', 'import'].map(
    (id) => ({ id, label: id, icon: 'apps' }),
  );
  it('renders every available view in order and emits a change from its direct button', async () => {
    TestBed.configureTestingModule({ providers: [provideAppTheme()] });
    const fixture = TestBed.createComponent(PageHeader);
    fixture.componentRef.setInput('title', 'Countries');
    fixture.componentRef.setInput('variant', 'collection');
    fixture.componentRef.setInput('views', options);
    fixture.componentRef.setInput('view', 'report');
    const changed = vi.fn();
    fixture.componentInstance.viewChange.subscribe(changed);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const buttons = [...root.querySelectorAll<HTMLElement>('[data-view]')];
    expect(buttons.map((button) => button.dataset['view'])).toEqual(
      options.map((option) => option.id),
    );
    expect(root.querySelector('[data-view="report"] button')?.getAttribute('aria-pressed')).toBe(
      'true',
    );
    root.querySelector<HTMLButtonElement>('[data-view="import"] button')?.click();
    expect(changed).toHaveBeenCalledWith('import');
  });
});
describe('Shared page title and back navigation', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('renders a view badge only when the current view has a label', async () => {
    TestBed.configureTestingModule({ providers: [provideAppTheme()] });
    const fixture = TestBed.createComponent(PageHeader);
    fixture.componentRef.setInput('title', 'Tenant Administrators');
    fixture.componentRef.setInput('variant', 'collection');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.view-badge')).toBeNull();

    fixture.componentRef.setInput('views', [{ id: 'cards', label: 'Cards', icon: 'cards' }]);
    fixture.componentRef.setInput('view', 'cards');
    await fixture.whenStable();
    expect(root.querySelector('.view-badge')?.textContent).toContain('Cards');
  });
  it('omits a fabricated count when a cursor collection has no known total', async () => {
    TestBed.configureTestingModule({ providers: [provideAppTheme()] });
    const fixture = TestBed.createComponent(PageHeader);
    fixture.componentRef.setInput('title', 'Audit');
    fixture.componentRef.setInput('variant', 'collection');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.total-badge')).not.toBeNull();
    fixture.componentRef.setInput('total', null);
    await fixture.whenStable();
    expect(root.querySelector('.total-badge')).toBeNull();
  });
  it('places one accessible arrow before the title and preserves a disabled pending action', async () => {
    TestBed.configureTestingModule({ providers: [provideAppTheme()] });
    const fixture = TestBed.createComponent(PageHeader);
    fixture.componentRef.setInput('title', 'Create tenant');
    fixture.componentRef.setInput('backLabel', 'Back to tenants');
    fixture.componentRef.setInput('appearance', 'card');
    const back = vi.fn();
    fixture.componentInstance.backRequested.subscribe(back);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const button = root.querySelector<HTMLButtonElement>('erp-back-button button');
    const title = root.querySelector('h1');
    if (!button || !title) throw Error('Expected one back action and page title');
    expect(button?.getAttribute('aria-label')).toBe('Back to tenants');
    expect(button.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    button?.click();
    expect(back).toHaveBeenCalledOnce();
    fixture.componentRef.setInput('backDisabled', true);
    await fixture.whenStable();
    expect(button?.disabled).toBe(true);
    button?.click();
    expect(back).toHaveBeenCalledOnce();
  });
});

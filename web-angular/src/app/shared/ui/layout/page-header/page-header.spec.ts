import { PageHeader, partitionPageViews, type PageViewOption } from './page-header';
import { TestBed } from '@angular/core/testing';
import { provideAppTheme } from '../../../../../theme/public-api';
describe('Shared collection header mobile view partition', () => {
  const options: readonly PageViewOption[] = ['grid', 'cards', 'chart', 'report', 'import'].map(
    (id) => ({ id, label: id, icon: 'apps' }),
  );
  it('keeps the active overflow view visible in the last compact slot without changing source order', () => {
    const result = partitionPageViews(options, 'report', 2);
    expect(result.visible.map((item) => item.id)).toEqual(['grid', 'report']);
    expect(result.overflow.map((item) => item.id)).toEqual(['cards', 'chart', 'import']);
    expect(options.map((item) => item.id)).toEqual(['grid', 'cards', 'chart', 'report', 'import']);
  });
  it('retains all small sets and never produces an empty visible slot when the limit is zero', () => {
    expect(partitionPageViews(options.slice(0, 2), 'grid', 2).overflow).toEqual([]);
    expect(partitionPageViews(options, 'import', 0).visible.map((item) => item.id)).toEqual([
      'import',
    ]);
  });
});
describe('Shared page title and back navigation', () => {
  afterEach(() => TestBed.resetTestingModule());
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

import { TestBed } from '@angular/core/testing';
import { LocalizationRuntime } from '../../../platform/localization/public-api';
import { ValidationSummary } from './validation-summary';

describe('Shared validation summary badges', () => {
  beforeEach(() => { document.cookie = 'i18next=en; Path=/'; });
  afterEach(() => { document.cookie = 'i18next=; Path=/; Max-Age=0'; });

  it('renders accessible field badges, emits their targets and updates the count as errors clear', async () => {
    const fixture = TestBed.createComponent(ValidationSummary);
    const issues = [{ id: 'username', label: 'Username', message: 'Required' }, { id: 'password', label: 'Password', message: 'Required' }];
    fixture.componentRef.setInput('issues', issues); await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement; const selected = vi.fn(); fixture.componentInstance.issueSelected.subscribe(selected);
    expect(root.querySelector('.error-count')?.textContent).toBe('2'); expect(root.querySelectorAll('.error-badge')).toHaveLength(2);
    expect(root.querySelector('[role=alert]')?.getAttribute('aria-label')).toContain('2');
    const link = root.querySelectorAll<HTMLAnchorElement>('a')[1]; const event = new MouseEvent('click', { cancelable: true }); link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true); expect(selected).toHaveBeenCalledExactlyOnceWith('password');
    fixture.componentRef.setInput('issues', [issues[1]]); await fixture.whenStable();
    expect(root.querySelector('.error-count')?.textContent).toBe('1'); expect(root.querySelectorAll('a')).toHaveLength(1);
    fixture.componentRef.setInput('issues', []); await fixture.whenStable(); expect(root.querySelector('[role=alert]')).toBeNull();
  });

  it('uses live Arabic captions and escapes untrusted field/error text', async () => {
    const fixture = TestBed.createComponent(ValidationSummary);
    fixture.componentRef.setInput('issues', [{ id: 'field', label: '<b>Field</b>', message: '<script>untrusted</script>' }]);
    const locale = TestBed.inject(LocalizationRuntime); await locale.loadNamespace('core'); locale.setLanguage('ar'); await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.summary-heading p')?.textContent).toBe(locale.translate('common.validationErrors'));
    expect(root.querySelector('b,script')).toBeNull(); expect(root.textContent).toContain('<script>untrusted</script>');
  });
});

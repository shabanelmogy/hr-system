import { TestBed } from '@angular/core/testing';
import { auditTestSetup } from '../../audit.spec-setup';
import { AuditCriteria } from './audit-criteria';

describe('Audit criteria composition', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });
  it('derives module-specific entity choices and exposes known action choices only', async () => {
    const { filters, reads } = await auditTestSetup();
    const fixture = TestBed.createComponent(AuditCriteria);
    await fixture.whenStable();
    expect(fixture.componentInstance.entities().map((option) => option.value)).toEqual([
      '',
      'Country',
      'Department',
      'JobTitle',
    ]);
    filters.update((value) => ({ ...value, moduleCode: 'hr' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.entities().map((option) => option.value)).toEqual([
      '',
      'Department',
      'JobTitle',
    ]);
    fixture.componentInstance.action('Invalid');
    expect(reads.patchFilters).not.toHaveBeenCalled();
    fixture.componentInstance.action('Modified');
    expect(reads.patchFilters).toHaveBeenCalledWith({ action: 'Modified' });
  });
  it('renders the range feedback beneath the shared end-date input', async () => {
    const { invalid } = await auditTestSetup();
    const fixture = TestBed.createComponent(AuditCriteria);
    await fixture.whenStable();
    invalid.set('range');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('erp-date-field')).toHaveLength(2);
    expect(root.querySelector('erp-date-field:last-child .error')?.textContent).toBe(
      'The start date must be before the end date.',
    );
    expect(
      root.querySelector('erp-date-field:last-child input')?.getAttribute('aria-invalid'),
    ).toBe('true');
  });
});

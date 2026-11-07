import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PageHeader } from '../../../../shared/ui/public-api';
import { auditTestSetup } from '../../audit.spec-setup';
import { SystemAuditPage } from './system-audit-page';

describe('System audit page composition', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });
  it('keeps totals unknown, toggles the shared filter slot and refreshes both read owners', async () => {
    const setup = await auditTestSetup(() =>
      TestBed.overrideComponent(SystemAuditPage, { set: { providers: [] } }),
    );
    setup.active.set(false);
    const fixture = TestBed.createComponent(SystemAuditPage);
    const root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    const header = fixture.debugElement.query(By.directive(PageHeader))
      .componentInstance as PageHeader;
    expect(header.total()).toBeNull();
    expect(header.views().map((view) => view.id)).toEqual(['grid']);
    header.filterToggle.emit();
    await fixture.whenStable();
    expect(root.querySelector('erp-audit-criteria')).not.toBeNull();
    header.refresh.emit();
    expect(setup.reads.refresh).toHaveBeenCalledOnce();
    expect(setup.options.refresh).toHaveBeenCalledOnce();
    setup.optionView.set({ kind: 'error' });
    await fixture.whenStable();
    const feedback = root.querySelector<HTMLElement>('main > erp-feedback-state');
    expect(feedback?.textContent).toContain('The audit trail could not be loaded.');
    feedback?.querySelector<HTMLButtonElement>('button')?.click();
    expect(setup.options.refresh).toHaveBeenCalledTimes(2);
  });
});

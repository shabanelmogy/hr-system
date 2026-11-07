import { TestBed } from '@angular/core/testing';
import { auditTestSetup } from '../../audit.spec-setup';
import { AuditDetails } from './audit-details';

describe('Audit detail shared presentation', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });
  it('shows four labeled metadata values and masks all record content on terminal denial', async () => {
    const { detailView } = await auditTestSetup();
    const fixture = TestBed.createComponent(AuditDetails);
    await fixture.whenStable();
    expect(fixture.componentInstance.fields().map((field) => field.id)).toEqual([
      'module',
      'key',
      'user',
      'when',
    ]);
    expect(document.querySelectorAll('[role=dialog] erp-record-summary dt')).toHaveLength(4);
    detailView.set({ kind: 'forbidden' });
    await fixture.whenStable();
    expect(fixture.componentInstance.fields()).toEqual([]);
    const dialog = document.querySelector('[role=dialog]');
    expect(dialog?.querySelector('erp-record-summary')).toBeNull();
    expect(dialog?.querySelector('erp-audit-changes')).toBeNull();
    expect(dialog?.querySelector('erp-feedback-state')).not.toBeNull();
  });
});

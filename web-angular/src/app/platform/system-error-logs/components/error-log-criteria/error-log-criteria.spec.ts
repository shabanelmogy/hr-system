import { sessionFixture } from '../../../auth/auth.fixture';
import { TestBed } from '@angular/core/testing';
import { ErrorLogCriteria } from './error-log-criteria';
import { errorLogUiSetup, resetErrorLogUiTest } from '../../error-log.spec-setup';

describe('Error log server criteria', () => {
  afterEach(() => {
    resetErrorLogUiTest();
    localStorage.removeItem('erp-angular:views:error-logs-system-view');
  });
  it('exposes the four sources and twelve status choices and suppresses invalid calendar requests', async () => {
    const { service } = await errorLogUiSetup(sessionFixture);
    const fixture = TestBed.createComponent(ErrorLogCriteria);
    await fixture.whenStable();
    const owner = fixture.componentInstance;
    expect(owner.sources().map((option) => option.value)).toEqual([
      '',
      'api',
      'job',
      'web',
      'mobile',
    ]);
    expect(owner.statuses()).toHaveLength(13);
    const reads = service.list.mock.calls.length;
    owner.reads.patchFilters({ from: '2026-02-30' });
    await fixture.whenStable();
    expect(owner.reads.invalid()).toBe('range');
    expect(owner.rangeErrors()[0]?.message).toBeTruthy();
    expect(service.list.mock.calls).toHaveLength(reads);
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('erp-date-field')).toHaveLength(
      2,
    );
  });
});

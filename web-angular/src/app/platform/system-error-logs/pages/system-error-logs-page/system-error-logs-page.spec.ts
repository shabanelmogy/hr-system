import { sessionFixture } from '../../../auth/auth.fixture';
import { TestBed } from '@angular/core/testing';
import { SystemErrorLogsPage } from './system-error-logs-page';
import { errorLogUiSetup, resetErrorLogUiTest } from '../../error-log.spec-setup';

describe('System error log page composition', () => {
  beforeEach(() => localStorage.removeItem('erp-angular:views:error-logs-system-view'));
  afterEach(() => {
    resetErrorLogUiTest();
    localStorage.removeItem('erp-angular:views:error-logs-system-view');
  });
  it('restores a permitted view and keeps XLSX action available independently of filter visibility', async () => {
    await errorLogUiSetup(sessionFixture);
    localStorage.setItem('erp-angular:views:error-logs-system-view', 'cards');
    const fixture = TestBed.createComponent(SystemErrorLogsPage);
    await fixture.whenStable();
    const owner = fixture.componentInstance,
      root = fixture.nativeElement as HTMLElement;
    expect(owner.view()).toBe('cards');
    expect(root.querySelector('erp-card-list')).not.toBeNull();
    expect(root.querySelector('erp-page-header')?.textContent).toContain('Export');
    expect(root.querySelector('.collection-toolbar')).toBeNull();
    owner.filtersVisible.set(true);
    await fixture.whenStable();
    expect(root.querySelector('erp-error-log-criteria')).not.toBeNull();
    owner.selectView('grid');
    await fixture.whenStable();
    expect(localStorage.getItem('erp-angular:views:error-logs-system-view')).toBe('grid');
  });
});

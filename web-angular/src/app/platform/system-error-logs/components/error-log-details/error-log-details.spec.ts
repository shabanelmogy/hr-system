import { sessionFixture } from '../../../auth/auth.fixture';
import { TestBed } from '@angular/core/testing';
import { ErrorLogDetails } from './error-log-details';
import { ErrorLogDetailState } from '../../state/error-log-detail-state';
import { errorLogUiSetup, resetErrorLogUiTest } from '../../error-log.spec-setup';

describe('Error log authorized detail projection', () => {
  afterEach(() => {
    resetErrorLogUiTest();
    localStorage.removeItem('erp-angular:views:error-logs-system-view');
  });
  it('renders grouped escaped details and copies the same current authorized projection', async () => {
    const { row } = await errorLogUiSetup(sessionFixture);
    const fixture = TestBed.createComponent(ErrorLogDetails);
    await fixture.whenStable();
    const state = TestBed.inject(ErrorLogDetailState);
    state.open(row);
    await fixture.whenStable();
    const dialog = document.querySelector<HTMLElement>('[role=dialog]');
    expect(dialog).not.toBeNull();
    expect(dialog?.querySelector('script')).toBeNull();
    expect(dialog?.textContent).toContain('Action information');
    expect(dialog?.textContent).toContain('User information');
    const copied = fixture.componentInstance.copyContent();
    for (const value of [
      'fixture-correlation',
      'fixture-client',
      'fixture-browser',
      row.summary,
      'Frame <raw> & detail',
      'Action information',
      'User information',
    ])
      expect(copied).toContain(value);
    state.close();
    expect(fixture.componentInstance.copyContent()).toBeNull();
  });
});

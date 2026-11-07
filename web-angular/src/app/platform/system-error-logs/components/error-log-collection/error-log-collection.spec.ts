import { sessionFixture } from '../../../auth/auth.fixture';
import { TestBed } from '@angular/core/testing';
import { ErrorLogCollection } from './error-log-collection';
import { errorLogUiSetup, resetErrorLogUiTest } from '../../error-log.spec-setup';

describe('Error log collection contracts', () => {
  afterEach(() => {
    resetErrorLogUiTest();
    localStorage.removeItem('erp-angular:views:error-logs-system-view');
  });
  it('exposes twelve typed column filters and an explicit permitted View without checkboxes', async () => {
    const { service, identity } = await errorLogUiSetup(sessionFixture);
    const fixture = TestBed.createComponent(ErrorLogCollection);
    await fixture.whenStable();
    const owner = fixture.componentInstance,
      root = fixture.nativeElement as HTMLElement;
    expect(owner.columns()).toHaveLength(13);
    expect(owner.columns().every((column) => column.sortField === undefined)).toBe(true);
    expect(root.querySelector('p-checkbox')).toBeNull();
    expect(owner.columns().filter((column) => column.filter)).toHaveLength(12);
    expect(owner.columns().find((column) => column.key === 'details')?.filter).toBeUndefined();
    expect(root.querySelector('p-column-filter')).not.toBeNull();
    expect(service.detail).not.toHaveBeenCalled();
    const view = Array.from(root.querySelectorAll<HTMLButtonElement>('tbody button')).find(
      (button) => button.textContent?.trim() === 'View',
    );
    expect(view).toBeDefined();
    view?.click();
    await fixture.whenStable();
    expect(service.detail).toHaveBeenCalledOnce();
    identity.update((actor) =>
      actor ? { ...actor, permissions: ['SystemErrorLogs:View'] } : null,
    );
    await fixture.whenStable();
    expect(
      Array.from(root.querySelectorAll('tbody button')).some(
        (button) => button.textContent?.trim() === 'View',
      ),
    ).toBe(false);
  });
  it('shows search, criteria and shared actions only with the filter toolbar in either view', async () => {
    await errorLogUiSetup(sessionFixture);
    const fixture = TestBed.createComponent(ErrorLogCollection);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.collection-toolbar')).toBeNull();
    fixture.componentRef.setInput('filtersVisible', true);
    await fixture.whenStable();
    expect(root.querySelector('erp-error-log-criteria')).not.toBeNull();
    fixture.componentRef.setInput('view', 'cards');
    await fixture.whenStable();
    expect(root.querySelector('erp-card-list')).not.toBeNull();
    expect(root.querySelector('erp-error-log-criteria')).not.toBeNull();
    fixture.componentRef.setInput('filtersVisible', false);
    await fixture.whenStable();
    expect(root.querySelector('.collection-toolbar')).toBeNull();
  });
});

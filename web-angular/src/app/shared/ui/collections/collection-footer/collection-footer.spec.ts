import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideAppTheme } from '../../../../../theme/public-api';
import { LocalizationRuntime } from '../../../../platform/localization/public-api';
import { createCollectionController } from '../collection-controller';
import type { CollectionSource } from '../collection.types';
import { CollectionFooter } from './collection-footer';

describe('Unknown-total record and page navigation', () => {
  afterEach(() => TestBed.resetTestingModule());
  it.each([null, 3])(
    'reuses the Countries record controls for cursor pages with total %s without duplicate arrows or a Page menu',
    async (total) => {
      TestBed.configureTestingModule({ providers: [provideAppTheme()] });
      const locale = TestBed.inject(LocalizationRuntime);
      locale.setLanguage('en');
      await locale.loadNamespace('core');
      const query = {
        scopeKey: 'cursor-list',
        criteriaKey: 'all',
        pageIndex: 0,
        pageSize: 2,
        pageAccess: 'sequential' as const,
      };
      const source = signal<CollectionSource<{ id: number }>>({
        query,
        kind: 'ready',
        result: { query, rows: [{ id: 1 }, { id: 2 }], total, hasNextPage: true },
      });
      const page = vi.fn();
      const controller = TestBed.runInInjectionContext(() =>
        createCollectionController(
          source,
          signal((row: { id: number }) => row.id),
          signal(() => true),
          { page, active: vi.fn(), selected: vi.fn() },
        ),
      );
      const fixture = TestBed.createComponent(CollectionFooter);
      fixture.componentRef.setInput('controller', controller);
      fixture.componentRef.setInput('recordNavigation', true);
      fixture.componentRef.setInput('pageSizes', [2]);
      await fixture.whenStable();
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelector('.record-navigation-layout')).not.toBeNull();
      const button = (label: string) =>
        root.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
      expect(button('Go to next record')).not.toBeNull();
      expect(button('Next')).toBeNull();
      expect(root.querySelectorAll('.record-controls button')).toHaveLength(4);
      expect(
        root.querySelector('.cursor-page-controls, erp-action-menu-button, p-paginator'),
      ).toBeNull();
      expect(root.querySelectorAll('erp-option-select')).toHaveLength(1);
      expect(button('Go to previous record')?.disabled).toBe(true);
      expect(button('Go to last record')?.disabled).toBe(true);
      controller.page({ pageIndex: 8, pageSize: 2 });
      expect(page).not.toHaveBeenCalled();
      button('Go to next record')?.click();
      await fixture.whenStable();
      expect(page).not.toHaveBeenCalled();
      button('Go to next record')?.click();
      await fixture.whenStable();
      expect(page).toHaveBeenCalledExactlyOnceWith({ pageIndex: 1, pageSize: 2 });
      source.set({
        query: { ...query, pageIndex: 1 },
        kind: 'ready',
        result: {
          query: { ...query, pageIndex: 1 },
          rows: [{ id: 3 }],
          total,
          hasNextPage: false,
        },
      });
      await fixture.whenStable();
      expect(root.querySelector('.size-settings .page-count')?.textContent).toContain('Page 2');
      expect(button('Go to next record')?.disabled).toBe(true);
      expect(button('Go to previous record')?.disabled).toBe(false);
      expect(button('Go to first record')?.disabled).toBe(false);
      button('Go to next record')?.click();
      expect(page).toHaveBeenCalledTimes(1);
      source.set({ query, kind: 'forbidden' });
      await fixture.whenStable();
      for (const control of root.querySelectorAll<HTMLButtonElement>('.record-controls button')) {
        expect(control.disabled).toBe(true);
      }
    },
  );

  it('uses the same shared record layout for known totals and never invents last navigation for cursors', async () => {
    TestBed.configureTestingModule({ providers: [provideAppTheme()] });
    const locale = TestBed.inject(LocalizationRuntime);
    locale.setLanguage('en');
    await locale.loadNamespace('core');
    const query = { scopeKey: 'fixture', criteriaKey: 'all', pageIndex: 0, pageSize: 2 };
    const source = signal<CollectionSource<{ id: number }>>({
      query,
      kind: 'ready',
      result: { query, rows: [{ id: 1 }, { id: 2 }], total: 4, hasNextPage: true },
    });
    const controller = TestBed.runInInjectionContext(() =>
      createCollectionController(
        source,
        signal((row: { id: number }) => row.id),
        signal(() => true),
        { page: vi.fn(), active: vi.fn(), selected: vi.fn() },
      ),
    );
    const fixture = TestBed.createComponent(CollectionFooter);
    fixture.componentRef.setInput('controller', controller);
    fixture.componentRef.setInput('recordNavigation', true);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.record-navigation-layout .record-controls')).not.toBeNull();
    expect(root.querySelector('.record-navigation-layout .size-settings')).not.toBeNull();
    source.set({
      query,
      kind: 'ready',
      result: { query, rows: [{ id: 1 }, { id: 2 }], total: null, hasNextPage: true },
    });
    await fixture.whenStable();
    expect(root.querySelector('.record-navigation-layout .record-controls')).not.toBeNull();
    expect(
      root.querySelector<HTMLButtonElement>('button[aria-label="Go to last record"]')?.disabled,
    ).toBe(true);
    expect(root.querySelector('.record-count')?.textContent?.trim()).toBe('1');
    expect(root.textContent).not.toContain(locale.translate('pagination.unknownTotal'));
    expect(root.querySelector('.size-settings .page-count')?.textContent).toContain('Page 1');
  });
});

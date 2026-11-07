import { Component, computed, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Paginator } from 'primeng/paginator';
import { UI_LOCALIZATION, UiTextPipe } from '../../../localization/public-api';
import { GridLocale } from '../../../../../theme/grid-public-api';
import { ActionButton } from '../../buttons/public-api';
import { OptionSelect } from '../../controls/option-select/option-select';
import type { CollectionController } from '../collection-controller';
import { collectionPageSizes, type RecordAction } from '../collection.types';
@Component({
  selector: 'erp-collection-footer',
  imports: [NgTemplateOutlet, Paginator, ActionButton, OptionSelect, UiTextPipe],
  templateUrl: './collection-footer.html',
  styleUrl: './collection-footer.scss',
})
export class CollectionFooter<T> {
  constructor() {
    inject(GridLocale);
  }
  readonly recordNavigation = input(false);
  readonly Math = Math;
  readonly controller = input.required<CollectionController<T>>();
  readonly pageSizes = input<readonly number[]>(collectionPageSizes);
  readonly locale = inject(UI_LOCALIZATION);
  readonly recordActions: readonly { value: RecordAction; label: string; icon: string }[] = [
    { value: 'first', label: 'pagination.goToFirstRecord', icon: '«' },
    { value: 'previous', label: 'pagination.goToPreviousRecord', icon: '‹' },
    { value: 'next', label: 'pagination.goToNextRecord', icon: '›' },
    { value: 'last', label: 'pagination.goToLastRecord', icon: '»' },
  ];
  readonly pageActions = [
    { value: 'first', label: 'pagination.first', icon: '«' },
    { value: 'previous', label: 'pagination.previous', icon: '‹' },
    { value: 'next', label: 'pagination.next', icon: '›' },
  ] as const;
  readonly tokens = {
    root: { padding: '0px', background: 'transparent', gap: '2px' },
    navButton: {
      width: '32px',
      height: '32px',
      color: 'var(--muted-foreground)',
      hoverBackground: 'var(--accent)',
      hoverColor: 'var(--foreground)',
    },
  };
  readonly blocked = computed(() =>
    ['loading', 'forbidden'].includes(this.controller().view().kind),
  );
  readonly total = computed(() =>
    this.controller().view().total === null
      ? this.locale.translate('pagination.unknownTotal')
      : this.number(this.controller().view().total!),
  );
  readonly pageCount = computed(() => {
    const view = this.controller().view();
    return view.total === null
      ? this.locale.translate('pagination.unknownTotal')
      : this.number(Math.max(1, Math.ceil(view.total / view.query.pageSize)));
  });
  readonly sizeOptions = computed(() =>
    this.pageSizes().map((value) => ({ value: String(value), label: this.number(value) })),
  );
  readonly nativePageSizes = computed(() => [...this.pageSizes()]);
  readonly pageReport = computed(
    () =>
      this.locale.translate('pagination.page') +
      ' {currentPage} ' +
      this.locale.translate('pagination.of') +
      ' {totalPages}',
  );
  readonly paginatorLabels = computed(() => {
    const view = this.controller().view();
    const action = (page: string) => ({
      'aria-label': this.locale.translate('pagination.' + page),
    });
    return {
      root: {
        'aria-label': this.locale.translate('pagination.goToPage'),
      },
      current: {
        class: 'collection-page-report',
      },
      first: {
        ...action('first'),
        disabled: this.blocked() || view.query.pageIndex === 0,
      },
      prev: action('previous'),
      next: action('next'),
      last: action('last'),
      pcRowPerPageDropdown: {
        root: { style: { width: '80px', height: '36px', fontSize: '14px' } },
        label: { style: { padding: '6px 10px' } },
        dropdown: { style: { width: '28px' } },
      },
    };
  });
  number(value: number) {
    return new Intl.NumberFormat(this.locale.language()).format(value);
  }
  paginate(value: unknown) {
    if (
      this.blocked() ||
      typeof value !== 'object' ||
      value === null ||
      !('page' in value) ||
      !('rows' in value) ||
      typeof value.page !== 'number' ||
      typeof value.rows !== 'number'
    )
      return;
    if (!this.pageSizes().includes(value.rows)) return;
    this.controller().page({
      pageIndex: value.rows === this.controller().view().query.pageSize ? value.page : 0,
      pageSize: value.rows,
    });
  }
  resize(size: number) {
    if (this.pageSizes().includes(size)) this.controller().page({ pageIndex: 0, pageSize: size });
  }
  unknownPage(action: 'first' | 'previous' | 'next') {
    const view = this.controller().view();
    this.controller().page({
      pageIndex: action === 'first' ? 0 : view.query.pageIndex + (action === 'next' ? 1 : -1),
      pageSize: view.query.pageSize,
    });
  }
}

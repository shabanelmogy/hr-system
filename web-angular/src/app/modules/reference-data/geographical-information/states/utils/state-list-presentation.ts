import type { CollectionColumn, GridRowAction } from '../../../../../shared/ui/public-api';
import type { StateListItem } from '../types/state';
export interface StatePresentation {
  readonly text: (key: string) => string;
  readonly stateText: (key: string) => string;
  readonly date: (value: string | null) => string;
  readonly country: (row: StateListItem) => string;
  readonly status: (row: StateListItem) => string;
}
export function stateColumns(
  presentation: StatePresentation,
): readonly CollectionColumn<StateListItem>[] {
  return [
    {
      key: 'id',
      sortField: 'id',
      header: presentation.text('general.id'),
      value: (row) => row.id,
      align: 'center',
      flex: 0.5,
    },
    {
      key: 'nameAr',
      header: presentation.text('general.nameAr'),
      value: (row) => row.nameAr,
      sortField: 'nameAr',
      align: 'center',
      flex: 1.15,
    },
    {
      key: 'nameEn',
      header: presentation.text('general.nameEn'),
      value: (row) => row.nameEn,
      sortField: 'nameEn',
      align: 'center',
      flex: 1.15,
    },
    {
      key: 'code',
      header: presentation.stateText('states.code'),
      value: (row) => row.code,
      sortField: 'code',
      align: 'center',
      flex: 0.75,
    },
    {
      key: 'country',
      header: presentation.stateText('states.country'),
      value: presentation.country,
      sortField: 'country',
      align: 'center',
      flex: 1.2,
    },
    {
      key: 'districtsCount',
      header: presentation.stateText('states.districts'),
      value: (row) => row.districtsCount,
      align: 'center',
      flex: 0.75,
    },
    {
      key: 'createdOn',
      header: presentation.text('general.createdOn'),
      value: (row) => presentation.date(row.createdOn),
      sortField: 'createdOn',
      align: 'center',
      flex: 1,
    },
    {
      key: 'updatedOn',
      header: presentation.text('general.updatedOn'),
      value: (row) => presentation.date(row.updatedOn),
      align: 'center',
      flex: 1,
    },
    {
      key: 'isDeleted',
      header: presentation.stateText('states.status.label'),
      value: presentation.status,
      align: 'center',
      flex: 0.8,
    },
  ];
}
export function stateRowActions(
  policy: { readonly edit: boolean; readonly archive: boolean; readonly restore: boolean },
  text: (key: string) => string,
): readonly GridRowAction[] {
  return [
    { id: 'view', label: text('actions.view'), icon: 'view' },
    ...(policy.edit ? [{ id: 'edit', label: text('actions.edit'), icon: 'edit' as const }] : []),
    ...(policy.archive
      ? [
          {
            id: 'archive',
            label: text('actions.archive'),
            icon: 'archive' as const,
            tone: 'warning' as const,
          },
        ]
      : []),
    ...(policy.restore
      ? [
          {
            id: 'restore',
            label: text('actions.restore'),
            icon: 'restore' as const,
            tone: 'success' as const,
          },
        ]
      : []),
  ];
}

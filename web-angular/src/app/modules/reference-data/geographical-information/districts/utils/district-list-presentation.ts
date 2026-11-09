import type { CollectionColumn, GridRowAction } from '../../../../../shared/ui/public-api';
import type { DistrictListItem } from '../types/district';
export interface DistrictPresentation {
  readonly text: (key: string) => string;
  readonly districtText: (key: string) => string;
  readonly date: (value: string | null) => string;
  readonly state: (row: DistrictListItem) => string;
  readonly status: (row: DistrictListItem) => string;
}
export function districtColumns(
  presentation: DistrictPresentation,
): readonly CollectionColumn<DistrictListItem>[] {
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
      header: presentation.districtText('districts.code'),
      value: (row) => row.code,
      sortField: 'code',
      align: 'center',
      flex: 0.75,
    },
    {
      key: 'state',
      header: presentation.districtText('districts.state'),
      value: presentation.state,
      sortField: 'state',
      align: 'center',
      flex: 1.2,
    },
    {
      key: 'addressesCount',
      header: presentation.districtText('districts.addresses'),
      value: (row) => row.addressesCount,
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
      header: presentation.districtText('districts.status.label'),
      value: presentation.status,
      align: 'center',
      flex: 0.8,
    },
  ];
}
export function districtRowActions(
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

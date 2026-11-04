import type {
  CollectionColumn,
  GridColumnFilter,
  GridRowAction,
} from '../../../../../shared/ui/public-api';
import type { CountryListItem } from '../types/country';
import { countryColumnFilterDefinitions } from '../state/country-column-filters';

export interface CountryPresentation {
  readonly text: (key: string) => string;
  readonly countryText: (key: string) => string;
  readonly date: (value: string | null) => string;
  readonly status: (row: CountryListItem) => string;
}
function countryFilter(field: string): GridColumnFilter {
  const definition = countryColumnFilterDefinitions.find((filter) => filter.field === field);
  if (!definition) throw Error('Missing Country column filter: ' + field);
  return definition;
}
export function countryColumns(
  presentation: CountryPresentation,
): readonly CollectionColumn<CountryListItem>[] {
  return [
    {
      key: 'id',
      filter: countryFilter('id'),
      align: 'center',
      flex: 0.5,
      header: presentation.text('general.id'),
      value: (row) => row.id,
    },
    {
      key: 'nameAr',
      filter: countryFilter('nameAr'),
      align: 'center',
      flex: 1,
      header: presentation.text('general.nameAr'),
      value: (row) => row.nameAr,
      sortField: 'nameAr',
    },
    {
      key: 'nameEn',
      filter: countryFilter('nameEn'),
      align: 'center',
      flex: 1.5,
      header: presentation.text('general.nameEn'),
      value: (row) => row.nameEn,
      sortField: 'nameEn',
    },
    {
      key: 'alpha2Code',
      filter: countryFilter('alpha2Code'),
      align: 'center',
      flex: 0.8,
      header: presentation.countryText('countries.alpha2Code'),
      value: (row) => row.alpha2Code,
      sortField: 'alpha2Code',
    },
    {
      key: 'alpha3Code',
      filter: countryFilter('alpha3Code'),
      align: 'center',
      flex: 0.8,
      header: presentation.countryText('countries.alpha3Code'),
      value: (row) => row.alpha3Code,
      sortField: 'alpha3Code',
    },
    {
      key: 'phoneCode',
      filter: countryFilter('phoneCode'),
      align: 'center',
      flex: 0.8,
      header: presentation.countryText('countries.phoneCode'),
      value: (row) => row.phoneCode,
    },
    {
      key: 'currencyCode',
      filter: countryFilter('currencyCode'),
      align: 'center',
      flex: 0.8,
      header: presentation.countryText('countries.currencyCode'),
      value: (row) => row.currencyCode,
      sortField: 'currencyCode',
    },
    {
      key: 'statesCount',
      filter: countryFilter('statesCount'),
      align: 'center',
      flex: 1.2,
      header: presentation.countryText('countries.states'),
      value: (row) => row.statesCount,
    },
    {
      key: 'createdOn',
      filterValue: (row) => row.createdOn.slice(0, 10),
      filter: countryFilter('createdOn'),
      align: 'center',
      flex: 1,
      header: presentation.text('general.createdOn'),
      value: (row) => presentation.date(row.createdOn),
      sortField: 'createdOn',
    },
    {
      key: 'updatedOn',
      filterValue: (row) => row.updatedOn?.slice(0, 10),
      filter: countryFilter('updatedOn'),
      align: 'center',
      flex: 1,
      header: presentation.text('general.updatedOn'),
      value: (row) => presentation.date(row.updatedOn),
    },
    {
      key: 'isDeleted',
      filterValue: (row) => row.isDeleted,
      filter: countryFilter('isDeleted'),
      align: 'center',
      flex: 0.8,
      header: presentation.countryText('countries.status.label'),
      value: (row) => presentation.status(row),
    },
  ];
}
export function countryRowActions(
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

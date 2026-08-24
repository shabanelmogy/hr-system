/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { permissions } from '@/src/features/auth';
import { CountriesScreen } from './CountriesScreen';
import type { Country } from '../types/country';

const mockUseCountries = jest.fn();
const mockSave = jest.fn();
const mockArchive = jest.fn();
const mockRestore = jest.fn();
const mockBulkArchive = jest.fn();
const mockSetSearchInput = jest.fn();
const mockSetPage = jest.fn();
const mockSetPageSize = jest.fn();
const mockSetFilters = jest.fn();
const mockSetSort = jest.fn();
const mockAllowedPermissions = new Set<string>();
let mockReadOnly = false;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key: string) => key,
  }),
}));

jest.mock('@/src/core/localization', () => ({
  useLocalization: () => ({ direction: 'ltr' }),
}));

jest.mock('@/src/core/theme', () => ({
  useAppTheme: () => ({
    theme: { colors: { onPrimary: '#fff', primary: '#00f', success: '#0a0', warning: '#fa0' } },
  }),
}));

jest.mock('@/src/features/auth', () => ({
  permissions: {
    CreateCountries: 'Countries:Create',
    EditCountries: 'Countries:Edit',
    DeleteCountries: 'Countries:Delete',
    ViewCrystalReports: 'CrystalReports:View',
  },
  useAuthorization: ({ requiredPermissions }: { requiredPermissions: string[] }) => ({
    allowed: requiredPermissions.every((permission) => mockAllowedPermissions.has(permission)),
  }),
}));

jest.mock('@/src/shared/contexts/AppReadOnlyContext', () => ({
  useAppReadOnly: () => ({ isReadOnly: mockReadOnly, notifyBlockedAction: jest.fn() }),
}));

jest.mock('@/src/shared/listing', () => ({
  toApiPageNumber: (page: number) => page + 1,
  useServerListState: () => ({
    searchInput: '',
    setFilters: mockSetFilters,
    setPage: mockSetPage,
    setPageSize: mockSetPageSize,
    setSearchInput: mockSetSearchInput,
    setSort: mockSetSort,
    state: {
      filters: { status: 'active' },
      page: 0,
      pageSize: 5,
      search: '',
      sort: { columnId: 'createdOn', direction: 'descending' },
    },
  }),
}));

jest.mock('../queries/use-countries', () => ({
  useArchiveCountry: () => ({ isPending: false, mutateAsync: mockArchive }),
  useBulkArchiveCountries: () => ({ isPending: false, mutateAsync: mockBulkArchive }),
  useBulkCreateCountries: () => ({ isPending: false, mutateAsync: jest.fn() }),
  useCountries: (query: unknown) => mockUseCountries(query),
  useRestoreCountry: () => ({ mutateAsync: mockRestore }),
  useSaveCountry: () => ({ isPending: false, mutateAsync: mockSave }),
}));

jest.mock('@/src/shared/components', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return ({
  AppButton: ({ children, onPress }: { children: React.ReactNode; onPress: () => void }) => (
    <Pressable onPress={onPress} testID="bulk-action"><Text>{children}</Text></Pressable>
  ),
  AppDataTable: ({ columns, rows }: { columns: { id: string; render: (row: Country) => React.ReactNode }[]; rows: Country[] }) => (
    <View>{rows.map((row) => <View key={row.id}>{columns.find((column) => column.id === 'actions')?.render(row)}</View>)}</View>
  ),
  AppIconButton: ({ label, onPress }: { label: string; onPress: () => void }) => (
    <Pressable onPress={onPress} testID={`icon-${label}`}><Text>{label}</Text></Pressable>
  ),
  AppListScreen: ({ aboveViews, fillViewSelector, filterControl, items, searchActions, views }: {
    aboveViews?: React.ReactNode;
    fillViewSelector?: boolean;
    filterControl: React.ReactNode;
    items: Country[];
    searchActions?: React.ReactNode;
    views: { value: string; disabled?: boolean; render: (rows: Country[]) => React.ReactNode }[];
  }) => (
    <View testID="country-list">
      {filterControl}
      {searchActions}
      {aboveViews}
      <Text testID="country-selector-fill">{String(fillViewSelector)}</Text>
      <Text testID="country-import-present">{String(Boolean(views.find((view) => view.value === 'import')))}</Text>
      {views.map((view) => <View key={view.value}>{view.render(items)}</View>)}
    </View>
  ),
  AppPageHeader: () => <View testID="country-page-header" />,
  AppScreen: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  AppStateView: ({ state }: { state: string }) => <Text testID={`state-${state}`}>{state}</Text>,
  AppStatusBadge: ({ label }: { label: string }) => <Text>{label}</Text>,
  AppText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
  ConfirmationDialog: ({ onConfirm, visible }: { onConfirm: () => void; visible: boolean }) => visible
    ? <Pressable onPress={onConfirm} testID="confirm-action"><Text>confirm</Text></Pressable>
    : null,
    showToast: { error: jest.fn(), success: jest.fn() },
  });
});

jest.mock('../components/CountryCard', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return ({
  CountryCard: ({ canDelete, canEdit, country, onArchive, onEdit, onToggleSelection, onView }: {
    canDelete: boolean;
    canEdit: boolean;
    country: Country;
    onArchive: (country: Country) => void;
    onEdit: (country: Country) => void;
    onToggleSelection: (country: Country) => void;
    onView: (country: Country) => void;
  }) => (
    <View>
      <Pressable onPress={() => onView(country)} testID={`view-${country.id}`}><Text>view</Text></Pressable>
      {canEdit ? <Pressable onPress={() => onEdit(country)} testID={`edit-${country.id}`}><Text>edit</Text></Pressable> : null}
      {canDelete ? <Pressable onPress={() => onArchive(country)} testID={`archive-${country.id}`}><Text>archive</Text></Pressable> : null}
      <Pressable onPress={() => onToggleSelection(country)} testID={`select-${country.id}`}><Text>select</Text></Pressable>
    </View>
    ),
  });
});

jest.mock('../components/CountryFilterButton', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { CountryFilterButton: () => <View testID="country-filter" /> };
});

jest.mock('../components/CountryForm', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { CountryForm: ({ mode }: { mode: string }) => <View testID={`country-form-${mode}`} /> };
});

jest.mock('../components/CountryReportView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { CountryReportView: () => <View testID="country-report" /> };
});

jest.mock('../components/CountriesChartView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { CountriesChartView: () => <View testID="country-charts" /> };
});

jest.mock('../components/import-data/CountryImportView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { CountryImportView: () => <View testID="country-import" /> };
});

const country: Country = {
  id: 7,
  nameAr: 'مصر',
  nameEn: 'Egypt',
  alpha2Code: 'EG',
  alpha3Code: 'EGY',
  phoneCode: '+20',
  currencyCode: 'EGP',
  statesCount: 2,
  createdOn: '2026-08-24T00:00:00Z',
  updatedOn: null,
  isDeleted: false,
};

describe('CountriesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReadOnly = false;
    mockAllowedPermissions.clear();
    mockAllowedPermissions.add(permissions.CreateCountries);
    mockAllowedPermissions.add(permissions.EditCountries);
    mockAllowedPermissions.add(permissions.DeleteCountries);
    mockAllowedPermissions.add(permissions.ViewCrystalReports);
    mockUseCountries.mockReturnValue({
      data: { items: [country], metaData: { totalCount: 1 } },
      error: null,
      isFetching: false,
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
    });
    mockArchive.mockResolvedValue(undefined);
    mockBulkArchive.mockResolvedValue({ archivedCount: 1 });
  });

  it('uses only visible server criteria and composes table, cards, charts, filters, and reports', async () => {
    await render(<CountriesScreen />);

    expect(mockUseCountries).toHaveBeenCalledWith({
      pageNumber: 1,
      pageSize: 5,
      search: '',
      searchField: 'all',
      searchOperator: 'contains',
      status: 'active',
      sortBy: 'createdOn',
      sortDirection: 'desc',
    });
    expect(screen.getByTestId('country-list')).toBeTruthy();
    expect(screen.getByTestId('country-filter')).toBeTruthy();
    expect(screen.getByTestId('icon-countries.addCountry')).toBeTruthy();
    expect(screen.queryByTestId('country-page-header')).toBeNull();
    expect(screen.getByTestId('country-charts')).toBeTruthy();
    expect(screen.getByTestId('country-report')).toBeTruthy();
    expect(screen.getByTestId('country-selector-fill').props.children).toBe('true');
    expect(screen.getByTestId('country-import-present').props.children).toBe('true');
    expect(screen.getByTestId('country-import')).toBeTruthy();
  });

  it('opens view/edit forms and archives single and selected rows through confirmation', async () => {
    await render(<CountriesScreen />);

    await fireEvent.press(screen.getAllByTestId('view-7')[0]);
    expect(screen.getByTestId('country-form-view')).toBeTruthy();

    await fireEvent.press(screen.getAllByTestId('edit-7')[0]);
    expect(screen.getByTestId('country-form-edit')).toBeTruthy();

    await fireEvent.press(screen.getAllByTestId('archive-7')[0]);
    await fireEvent.press(screen.getByTestId('confirm-action'));
    await waitFor(() => expect(mockArchive).toHaveBeenCalledWith(7));

    await fireEvent.press(screen.getAllByTestId('select-7')[0]);
    await fireEvent.press(screen.getByTestId('bulk-action'));
    await fireEvent.press(screen.getByTestId('confirm-action'));
    await waitFor(() => expect(mockBulkArchive).toHaveBeenCalledWith([7]));
  });

  it('hides mutation and report entry points when permissions are absent', async () => {
    mockAllowedPermissions.clear();
    await render(<CountriesScreen />);

    expect(screen.queryByTestId('icon-countries.addCountry')).toBeNull();
    expect(screen.queryByTestId('edit-7')).toBeNull();
    expect(screen.queryByTestId('archive-7')).toBeNull();
    expect(screen.queryByTestId('country-report')).toBeNull();
    expect(screen.getByTestId('country-import-present').props.children).toBe('false');
  });
});

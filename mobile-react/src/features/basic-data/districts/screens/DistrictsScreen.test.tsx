/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { permissions } from '@/src/features/auth';
import { DistrictsScreen } from './DistrictsScreen';
import type { District } from '../types/district';

const mockUseDistricts = jest.fn();
const mockAllowedPermissions = new Set<string>();
let mockReadOnly = false;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en' }, t: (key: string) => key }),
}));
jest.mock('@/src/core/theme', () => ({
  useAppTheme: () => ({ theme: { colors: { onPrimary: '#fff', primary: '#00f', success: '#0a0', warning: '#fa0' } } }),
}));
jest.mock('@/src/features/auth', () => ({
  permissions: {
    CreateDistricts: 'Districts:Create',
    EditDistricts: 'Districts:Edit',
    DeleteDistricts: 'Districts:Delete',
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
    setFilters: jest.fn(),
    setPage: jest.fn(),
    setPageSize: jest.fn(),
    setSearchInput: jest.fn(),
    setSort: jest.fn(),
    state: {
      filters: { status: 'active' },
      page: 0,
      pageSize: 5,
      search: '',
      sort: { columnId: 'createdOn', direction: 'descending' },
    },
  }),
}));
jest.mock('../queries/use-districts', () => ({
  useArchiveDistrict: () => ({ isPending: false, mutateAsync: jest.fn() }),
  useBulkArchiveDistricts: () => ({ isPending: false, mutateAsync: jest.fn() }),
  useRestoreDistrict: () => ({ mutateAsync: jest.fn() }),
  useSaveDistrict: () => ({ isPending: false, mutateAsync: jest.fn() }),
  useDistricts: (query: unknown) => mockUseDistricts(query),
}));
jest.mock('@/src/shared/components', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    AppButton: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    AppDataTable: () => <View testID="district-table" />,
    AppIconButton: ({ label }: { label: string }) => <Pressable testID={`icon-${label}`}><Text>{label}</Text></Pressable>,
    AppListScreen: ({ fillViewSelector, items, searchActions, views }: { fillViewSelector?: boolean; items: District[]; searchActions?: React.ReactNode; views: { value: string; render: (rows: District[]) => React.ReactNode }[] }) => (
      <View testID="district-list">
        {searchActions}
        <Text testID="district-selector-fill">{String(fillViewSelector)}</Text>
        <Text testID="district-view-values">{views.map((view) => view.value).join(',')}</Text>
        {views.map((view) => <View key={view.value}>{view.render(items)}</View>)}
      </View>
    ),
    AppScreen: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    AppStateView: ({ state }: { state: string }) => <Text>{state}</Text>,
    AppStatusBadge: ({ label }: { label: string }) => <Text>{label}</Text>,
    AppText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    ConfirmationDialog: () => null,
    showToast: { error: jest.fn(), success: jest.fn() },
  };
});
jest.mock('../components/DistrictCard', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { DistrictCard: () => <View testID="district-card" /> };
});
jest.mock('../components/DistrictFilterButton', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { DistrictFilterButton: () => <View testID="district-filter" /> };
});
jest.mock('../components/DistrictForm', () => ({ DistrictForm: () => null }));
jest.mock('../components/DistrictsChartView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { DistrictsChartView: () => <View testID="district-chart" /> };
});
jest.mock('../components/DistrictReportView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { DistrictReportView: () => <View testID="district-report" /> };
});
jest.mock('../components/import-data/DistrictImportView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { DistrictImportView: () => <View testID="district-import" /> };
});

const district: District = {
  id: 11,
  nameAr: 'المعادي',
  nameEn: 'Maadi',
  code: 'MAA',
  stateId: 7,
  state: { id: 7, nameAr: 'القاهرة', nameEn: 'Cairo', isDeleted: false },
  addressesCount: 2,
  createdOn: '2026-08-24T00:00:00Z',
  updatedOn: null,
  isDeleted: false,
};

describe('DistrictsScreen views', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReadOnly = false;
    mockAllowedPermissions.clear();
    mockAllowedPermissions.add(permissions.CreateDistricts);
    mockAllowedPermissions.add(permissions.EditDistricts);
    mockAllowedPermissions.add(permissions.DeleteDistricts);
    mockUseDistricts.mockReturnValue({
      data: { items: [district], metaData: { totalCount: 1 } },
      error: null,
      isFetching: false,
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
    });
  });

  it('registers Table, Cards, Chart, Report, and Import for an authorized writable user', async () => {
    await render(<DistrictsScreen />);

    expect(mockUseDistricts).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 5, search: '', searchField: 'all', searchOperator: 'contains', status: 'active', sortBy: 'createdOn', sortDirection: 'desc' });
    expect(screen.getByTestId('district-view-values').props.children).toBe('table,cards,chart,report,import');
    expect(screen.getByTestId('district-selector-fill').props.children).toBe('true');
    expect(screen.getByTestId('district-report')).toBeTruthy();
    expect(screen.getByTestId('district-import')).toBeTruthy();
  });

  it('keeps Report visible but removes Import without District create permission', async () => {
    mockAllowedPermissions.clear();
    await render(<DistrictsScreen />);

    expect(screen.getByTestId('district-view-values').props.children).toBe('table,cards,chart,report');
    expect(screen.getByTestId('district-report')).toBeTruthy();
    expect(screen.queryByTestId('district-import')).toBeNull();
  });
});

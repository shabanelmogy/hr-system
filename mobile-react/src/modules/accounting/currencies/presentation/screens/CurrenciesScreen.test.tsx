/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/src/core/api';
import { CurrenciesScreen } from './CurrenciesScreen';
import type { Currency } from '../../domain/models/currency';

const mockListRefetch = jest.fn();
const mockDetailRefetch = jest.fn();
const mockSave = jest.fn();
const mockArchive = jest.fn();
const mockRestore = jest.fn();
const mockAllowedPermissions = new Set<string>();
let mockReadOnly = false;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/src/core/theme', () => ({
  useAppTheme: () => ({ theme: { colors: { primary: '#00f', onPrimary: '#fff', success: '#0a0', warning: '#fa0' } } }),
}));

jest.mock('@/src/platform/auth', () => ({
  permissions: {
    ViewCurrencies: 'Currencies:View',
    CreateCurrencies: 'Currencies:Create',
    EditCurrencies: 'Currencies:Edit',
    ArchiveCurrencies: 'Currencies:Archive',
    RestoreCurrencies: 'Currencies:Restore',
  },
  useAuthorization: ({ requiredPermissions }: { requiredPermissions: string[] }) => ({
    allowed: requiredPermissions.every(permission => mockAllowedPermissions.has(permission)),
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
      filters: { recordStatus: 'active' },
      page: 0,
      pageSize: 5,
      search: '',
      sort: { columnId: 'currencyCode', direction: 'ascending' },
    },
  }),
}));

jest.mock('../queries/use-currencies', () => ({
  useArchiveCurrency: () => ({ isPending: false, mutateAsync: mockArchive }),
  useCurrencies: () => ({
    data: { items: [currency], metaData: { totalCount: 1 } },
    error: null,
    isFetching: false,
    isLoading: false,
    isRefetching: false,
    refetch: mockListRefetch,
  }),
  useCurrency: () => ({
    data: currency,
    error: null,
    isFetching: false,
    refetch: mockDetailRefetch,
  }),
  useRestoreCurrency: () => ({ isPending: false, mutateAsync: mockRestore }),
  useSaveCurrency: () => ({ isPending: false, mutateAsync: mockSave }),
}));

jest.mock('@/src/shared/components', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    AppDataCard: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    AppDataTable: ({ columns, rows }: { columns: { id: string; render: (row: Currency) => React.ReactNode }[]; rows: Currency[] }) => (
      <View>{rows.map(row => <View key={row.id}>{columns.find(column => column.id === 'actions')?.render(row)}</View>)}</View>
    ),
    AppIconButton: ({ label, onPress }: { label: string; onPress: () => void }) => (
      <Pressable onPress={onPress} testID={`icon-${label}`}><Text>{label}</Text></Pressable>
    ),
    AppListScreen: ({ items, views }: { items: Currency[]; views: { value: string; render: (rows: Currency[]) => React.ReactNode }[] }) => (
      <View testID="currency-list">{views[0]?.render(items)}</View>
    ),
    AppScreen: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    AppStateView: ({ state }: { state: string }) => <Text>{state}</Text>,
    AppStatusBadge: ({ label }: { label: string }) => <Text>{label}</Text>,
    AppText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    ConfirmationDialog: ({ onConfirm, visible }: { onConfirm: () => void; visible: boolean }) => visible
      ? <Pressable onPress={onConfirm} testID="confirm-action"><Text>confirm</Text></Pressable>
      : null,
    showToast: {
      error: jest.fn(),
      success: jest.fn(),
      warning: jest.fn(),
    },
  };
});

jest.mock('../components/CurrencyFilterButton', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { CurrencyFilterButton: () => <View testID="currency-filter" /> };
});

jest.mock('../components/CurrencyForm', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    CurrencyForm: ({ mode, onSave }: { mode: string; onSave: (request: { currencyCode: string; nameEn: string; nameAr: string; symbol: string }) => Promise<void> }) => (
      <View testID={`currency-form-${mode}`}>
        <Pressable
          testID="currency-save"
          onPress={() => void onSave({ currencyCode: 'USD', nameEn: 'US Dollar', nameAr: 'دولار أمريكي', symbol: '$' })}
        >
          <Text>save</Text>
        </Pressable>
      </View>
    ),
  };
});

const currency: Currency = {
  id: 7,
  currencyCode: 'USD',
  nameEn: 'US Dollar',
  nameAr: 'دولار أمريكي',
  symbol: '$',
  createdOn: '2026-09-22T00:00:00Z',
  updatedOn: null,
  isDeleted: false,
  rowVersion: 'AQ==',
};

const conflict = () => new ApiError(
  409,
  'Concurrency conflict.',
  { status: 409, code: 'ConcurrencyConflict' },
);

const mockShowToast = jest.requireMock('@/src/shared/components').showToast as {
  error: jest.Mock;
  warning: jest.Mock;
};

describe('CurrenciesScreen concurrency recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReadOnly = false;
    mockAllowedPermissions.clear();
    mockAllowedPermissions.add('Currencies:View');
    mockAllowedPermissions.add('Currencies:Create');
    mockAllowedPermissions.add('Currencies:Edit');
    mockAllowedPermissions.add('Currencies:Archive');
    mockAllowedPermissions.add('Currencies:Restore');
    mockListRefetch.mockResolvedValue(undefined);
    mockDetailRefetch.mockResolvedValue(undefined);
  });

  it('reloads authoritative list/detail and closes a stale edit form after a save conflict', async () => {
    mockSave.mockRejectedValue(conflict());
    await render(<CurrenciesScreen />);

    await fireEvent.press(screen.getByTestId('icon-common.edit'));
    expect(screen.getByTestId('currency-form-edit')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('currency-save'));

    await waitFor(() => expect(mockListRefetch).toHaveBeenCalledTimes(1));
    expect(mockDetailRefetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('currency-form-edit')).toBeNull();
    expect(mockShowToast.warning).toHaveBeenCalledWith('currencies.messages.conflictReloaded');
    expect(mockShowToast.error).not.toHaveBeenCalled();
  });

  it('reloads authoritative list and clears a stale archive action after a lifecycle conflict', async () => {
    mockArchive.mockRejectedValue(conflict());
    await render(<CurrenciesScreen />);

    await fireEvent.press(screen.getByTestId('icon-common.archive'));
    await fireEvent.press(screen.getByTestId('confirm-action'));

    await waitFor(() => expect(mockListRefetch).toHaveBeenCalledTimes(1));
    expect(screen.queryByTestId('confirm-action')).toBeNull();
    expect(mockShowToast.warning).toHaveBeenCalledWith('currencies.messages.conflictReloaded');
    expect(mockShowToast.error).not.toHaveBeenCalled();
  });
});

describe('CurrenciesScreen authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReadOnly = false;
    mockAllowedPermissions.clear();
    mockAllowedPermissions.add('Currencies:View');
  });

  it('allows view-only users to see currency rows without write actions', async () => {
    await render(<CurrenciesScreen />);

    expect(screen.getByTestId('currency-list')).toBeTruthy();
    expect(screen.getByTestId('icon-common.view')).toBeTruthy();
    expect(screen.queryByTestId('icon-common.edit')).toBeNull();
    expect(screen.queryByTestId('icon-common.archive')).toBeNull();
    expect(screen.queryByTestId('icon-common.restore')).toBeNull();
    expect(screen.queryByTestId('icon-currencies.actions.add')).toBeNull();
  });

  it('suppresses write actions for managers when the application is read-only', async () => {
    mockAllowedPermissions.add('Currencies:Create');
    mockAllowedPermissions.add('Currencies:Edit');
    mockAllowedPermissions.add('Currencies:Archive');
    mockAllowedPermissions.add('Currencies:Restore');
    mockReadOnly = true;

    await render(<CurrenciesScreen />);

    expect(screen.getByTestId('currency-list')).toBeTruthy();
    expect(screen.getByTestId('icon-common.view')).toBeTruthy();
    expect(screen.queryByTestId('icon-common.edit')).toBeNull();
    expect(screen.queryByTestId('icon-common.archive')).toBeNull();
    expect(screen.queryByTestId('icon-common.restore')).toBeNull();
    expect(screen.queryByTestId('icon-currencies.actions.add')).toBeNull();
  });

  it('shows access denied when the view permission is missing', async () => {
    mockAllowedPermissions.clear();

    await render(<CurrenciesScreen />);

    expect(screen.getByText('error')).toBeTruthy();
    expect(screen.queryByTestId('currency-list')).toBeNull();
  });
});

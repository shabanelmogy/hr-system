/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { permissions } from '@/src/features/auth';
import { StatesScreen } from './StatesScreen';
import type { State } from '../types/state';

const mockUseStates = jest.fn();
const mockArchive = jest.fn();
const mockBulkArchive = jest.fn();
const mockAllowedPermissions = new Set<string>();
let mockReadOnly = false;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en' }, t: (key: string) => key }),
}));
jest.mock('@/src/core/localization', () => ({ useLocalization: () => ({ direction: 'ltr' }) }));
jest.mock('@/src/core/theme', () => ({
  useAppTheme: () => ({ theme: { colors: { onPrimary: '#fff', primary: '#00f', success: '#0a0', warning: '#fa0' } } }),
}));
jest.mock('@/src/features/auth', () => ({
  permissions: {
    CreateStates: 'States:Create',
    EditStates: 'States:Edit',
    DeleteStates: 'States:Delete',
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
jest.mock('../queries/use-states', () => ({
  useArchiveState: () => ({ isPending: false, mutateAsync: mockArchive }),
  useBulkArchiveStates: () => ({ isPending: false, mutateAsync: mockBulkArchive }),
  useBulkCreateStates: () => ({ isPending: false, mutateAsync: jest.fn() }),
  useRestoreState: () => ({ mutateAsync: jest.fn() }),
  useSaveState: () => ({ isPending: false, mutateAsync: jest.fn() }),
  useStates: (query: unknown) => mockUseStates(query),
}));
jest.mock('@/src/shared/components', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    AppButton: ({ children, onPress }: { children: React.ReactNode; onPress: () => void }) => <Pressable onPress={onPress} testID="bulk-action"><Text>{children}</Text></Pressable>,
    AppDataTable: ({ columns, rows }: { columns: { id: string; render: (row: State) => React.ReactNode }[]; rows: State[] }) => <View>{rows.map((row) => <View key={row.id}>{columns.find((column) => column.id === 'actions')?.render(row)}</View>)}</View>,
    AppIconButton: ({ label, onPress }: { label: string; onPress: () => void }) => <Pressable onPress={onPress} testID={`icon-${label}`}><Text>{label}</Text></Pressable>,
    AppListScreen: ({ aboveViews, fillViewSelector, filterControl, items, searchActions, views }: { aboveViews?: React.ReactNode; fillViewSelector?: boolean; filterControl: React.ReactNode; items: State[]; searchActions?: React.ReactNode; views: { value: string; disabled?: boolean; render: (rows: State[]) => React.ReactNode }[] }) => <View testID="state-list">{filterControl}{searchActions}{aboveViews}<Text testID="state-selector-fill">{String(fillViewSelector)}</Text><Text testID="state-import-present">{String(Boolean(views.find((view) => view.value === 'import')))}</Text>{views.map((view) => <View key={view.value}>{view.render(items)}</View>)}</View>,
    AppPageHeader: () => <View testID="state-page-header" />,
    AppScreen: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    AppStateView: ({ state }: { state: string }) => <Text>{state}</Text>,
    AppStatusBadge: ({ label }: { label: string }) => <Text>{label}</Text>,
    AppText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    ConfirmationDialog: ({ onConfirm, visible }: { onConfirm: () => void; visible: boolean }) => visible ? <Pressable onPress={onConfirm} testID="confirm-action"><Text>confirm</Text></Pressable> : null,
    showToast: { error: jest.fn(), success: jest.fn() },
  };
});
jest.mock('../components/StateCard', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    StateCard: ({ canDelete, canEdit, onArchive, onEdit, onToggleSelection, onView, state }: {
      canDelete: boolean;
      canEdit: boolean;
      onArchive: (state: State) => void;
      onEdit: (state: State) => void;
      onToggleSelection: (state: State) => void;
      onView: (state: State) => void;
      state: State;
    }) => <View>
      <Pressable onPress={() => onView(state)} testID={`view-${state.id}`}><Text>view</Text></Pressable>
      {canEdit ? <Pressable onPress={() => onEdit(state)} testID={`edit-${state.id}`}><Text>edit</Text></Pressable> : null}
      {canDelete ? <Pressable onPress={() => onArchive(state)} testID={`archive-${state.id}`}><Text>archive</Text></Pressable> : null}
      <Pressable onPress={() => onToggleSelection(state)} testID={`select-${state.id}`}><Text>select</Text></Pressable>
    </View>,
  };
});
jest.mock('../components/StateFilterButton', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { StateFilterButton: () => <View testID="state-filter" /> };
});
jest.mock('../components/StateForm', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { StateForm: ({ mode }: { mode: string }) => <View testID={`state-form-${mode}`} /> };
});
jest.mock('../components/StateReportView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { StateReportView: () => <View testID="state-report" /> };
});

jest.mock('../components/StatesChartView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { StatesChartView: () => <View testID="state-charts" /> };
});

jest.mock('../components/import-data/StateImportView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { StateImportView: () => <View testID="state-import" /> };
});

const state: State = {
  id: 11,
  nameAr: 'القاهرة',
  nameEn: 'Cairo',
  code: 'CAI',
  countryId: 7,
  country: { id: 7, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false },
  districtsCount: 2,
  createdOn: '2026-08-24T00:00:00Z',
  updatedOn: null,
  isDeleted: false,
};

describe('StatesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReadOnly = false;
    mockAllowedPermissions.clear();
    mockAllowedPermissions.add(permissions.CreateStates);
    mockAllowedPermissions.add(permissions.EditStates);
    mockAllowedPermissions.add(permissions.DeleteStates);
    mockUseStates.mockReturnValue({ data: { items: [state], metaData: { totalCount: 1 } }, error: null, isFetching: false, isLoading: false, isRefetching: false, refetch: jest.fn() });
    mockArchive.mockResolvedValue(undefined);
    mockBulkArchive.mockResolvedValue({ archivedCount: 1 });
  });

  it('composes the server list criteria, filter modal, all views, and list-authoritative form actions', async () => {
    await render(<StatesScreen />);
    expect(mockUseStates).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 5, search: '', searchField: 'all', searchOperator: 'contains', status: 'active', sortBy: 'createdOn', sortDirection: 'desc' });
    expect(screen.getByTestId('state-list')).toBeTruthy();
    expect(screen.getByTestId('state-filter')).toBeTruthy();
    expect(screen.getByTestId('icon-states.addState')).toBeTruthy();
    expect(screen.queryByTestId('state-page-header')).toBeNull();
    expect(screen.getByTestId('state-charts')).toBeTruthy();
    expect(screen.getByTestId('state-report')).toBeTruthy();
    expect(screen.getByTestId('state-selector-fill').props.children).toBe('true');
    expect(screen.getByTestId('state-import-present').props.children).toBe('true');
    expect(screen.getByTestId('state-import')).toBeTruthy();
    await fireEvent.press(screen.getAllByTestId('view-11')[0]);
    expect(screen.getByTestId('state-form-view')).toBeTruthy();
    await fireEvent.press(screen.getAllByTestId('edit-11')[0]);
    expect(screen.getByTestId('state-form-edit')).toBeTruthy();
  });

  it('archives single and selected rows and hides mutation entry points without permission', async () => {
    await render(<StatesScreen />);
    await fireEvent.press(screen.getAllByTestId('archive-11')[0]);
    await fireEvent.press(screen.getByTestId('confirm-action'));
    await waitFor(() => expect(mockArchive).toHaveBeenCalledWith(11));
    await fireEvent.press(screen.getAllByTestId('select-11')[0]);
    await fireEvent.press(screen.getByTestId('bulk-action'));
    await fireEvent.press(screen.getByTestId('confirm-action'));
    await waitFor(() => expect(mockBulkArchive).toHaveBeenCalledWith([11]));

    mockAllowedPermissions.clear();
    await screen.rerender(<StatesScreen />);
    expect(screen.queryByTestId('icon-states.addState')).toBeNull();
    expect(screen.queryByTestId('edit-11')).toBeNull();
    expect(screen.queryByTestId('archive-11')).toBeNull();
    expect(screen.getByTestId('state-import-present').props.children).toBe('false');
  });
});

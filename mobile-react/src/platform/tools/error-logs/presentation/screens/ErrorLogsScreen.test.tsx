/* eslint-disable @typescript-eslint/no-require-imports */
import React, { type PropsWithChildren, type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ErrorLogRow } from '../../domain/models/error-log';
import { ErrorLogsScreen } from './ErrorLogsScreen';

let mockDetail = true;
let mockExport = true;
const mockDownload = jest.fn();
const mockRows: ErrorLogRow[] = [{ id: '60c804af-c503-49e8-9187-753c641563fa', occurredOnUtc: '2026-10-17T12:00:00Z', source: 'mobile', severity: 'error', userName: 'User', service: 'Orders', action: 'Read', statusCode: 500, durationMs: 10, correlationId: 'correlation', summary: 'Safe summary', client: 'mobile', browser: null, ipAddress: null }];
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'ar' } }) }));
jest.mock('@/src/core/theme', () => ({ useAppTheme: () => ({ theme: { colors: { primary: '#123456' } } }) }));
jest.mock('@/src/platform/auth', () => ({ appRoles: { superAdmin: 'super_admin' }, permissions: { ViewErrorLogs: 'view', ViewErrorLogDetails: 'detail', ExportErrorLogs: 'export' },
  useAuth: () => ({ isServerAuthenticated: true, isSwitchingCompany: false }),
  useAuthorization: ({ requiredPermissions }: { requiredPermissions: string[] }) => ({ allowed: requiredPermissions[0] === 'view' || (requiredPermissions[0] === 'detail' ? mockDetail : mockExport) }),
}));
jest.mock('../queries/use-error-logs', () => ({ useErrorLogs: () => ({ data: { items: mockRows, totalCount: 31 } }), useExportErrorLogs: () => ({ mutateAsync: mockDownload, isPending: false }) }));
jest.mock('../components/ErrorLogDetailModal', () => ({ ErrorLogDetailModal: () => null }));
jest.mock('@/src/shared/components', () => {
  const N = require('react-native');
  const React = jest.requireActual<typeof import('react')>('react');
  const Text = ({ children }: PropsWithChildren) => <N.Text>{children}</N.Text>;
  return { AppScreen: ({ children }: PropsWithChildren) => <N.View>{children}</N.View>, AppPageHeader: () => null, AppText: Text,
    AppIconButton: ({ label, onPress }: { label: string; onPress: () => void }) => <N.Pressable accessibilityLabel={label} onPress={onPress} />,
    AppDataCard: ({ children }: PropsWithChildren) => <N.View>{children}</N.View>, AppStateView: () => null,
    AppDateTimeField: () => null, AppSelectField: () => null, AppTextField: () => null,
    AppDataTable: ({ columns, rows }: { columns: { id: string; render: (row: ErrorLogRow) => ReactNode }[]; rows: ErrorLogRow[] }) => <N.View>{rows.map((row) => <N.View key={row.id}>{columns.map((column) => <N.View key={column.id}>{column.render(row)}</N.View>)}</N.View>)}</N.View>,
    AppListScreen: function MockList({ views, items, searchActions, serverPagination }: { views: { value: string; render: (items: ErrorLogRow[]) => ReactNode }[]; items: ErrorLogRow[]; searchActions: ReactNode; serverPagination: { totalItems: number } }) {
      const [view, setView] = React.useState(0);
      return <N.View>{searchActions}<N.Text>{serverPagination.totalItems}</N.Text><N.Pressable accessibilityLabel="cards" onPress={() => setView(1)} />{views[view].render(items)}</N.View>;
    }, showToast: { error: jest.fn() },
  };
});
describe('server paged native viewer composition', () => {
  beforeEach(() => { mockDetail = true; mockExport = true; mockDownload.mockReset().mockResolvedValue(undefined); });
  it('shows service metadata in both Table and Cards with the server total', async () => {
    await render(<ErrorLogsScreen scope="company" />);
    expect(screen.getByText('Orders')).toBeTruthy();
    expect(screen.getByText('31')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('cards'));
    expect(screen.getByText('errorLogs.fields.service: Orders')).toBeTruthy();
    expect(screen.getByLabelText('errorLogs.detail')).toBeTruthy();
  });
  it('exports the current query without overriding its validated page size', async () => {
    await render(<ErrorLogsScreen scope="company" />);
    await fireEvent.press(screen.getByLabelText('errorLogs.export'));
    expect(mockDownload).toHaveBeenCalledWith({ scope: 'company', criteria: expect.objectContaining({ page: 1, pageSize: 10 }) });
  });
  it('omits detail and export actions without their independent grants', async () => {
    mockDetail = false; mockExport = false;
    await render(<ErrorLogsScreen scope="company" />);
    expect(screen.queryByLabelText('errorLogs.detail')).toBeNull();
    expect(screen.queryByLabelText('errorLogs.export')).toBeNull();
  });
});

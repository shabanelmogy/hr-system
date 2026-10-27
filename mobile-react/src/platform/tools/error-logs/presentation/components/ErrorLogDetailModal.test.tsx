/* eslint-disable @typescript-eslint/no-require-imports */
import React, { type PropsWithChildren } from 'react';
import { render, screen } from '@testing-library/react-native';
import { ErrorLogDetailModal } from './ErrorLogDetailModal';
import type { ErrorLogRow } from '../../domain/models/error-log';

const mockEntry: ErrorLogRow = { id: '60c804af-c503-49e8-9187-753c641563fa', occurredOnUtc: '2026-10-17T12:00:00Z', source: 'api', severity: 'error', userName: 'user', service: 'Orders', action: 'Read', statusCode: 500, durationMs: 10, correlationId: 'correlation', summary: 'Safe summary', client: 'http', browser: 'Chrome', ipAddress: '192.0.2.1' };
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }) }));
jest.mock('@/src/core/localization', () => ({ useLocalization: () => ({ direction: 'ltr' }) }));
jest.mock('../queries/use-error-logs', () => ({ useErrorLogDetail: () => ({ data: { entry: mockEntry, diagnostics: ['Safe.Method', 'HttpMethod: GET', 'Exception[0].HResult: 0x80004005'] } }) }));
jest.mock('@/src/shared/components', () => {
  const N = require('react-native');
  return { AppModal: ({ visible, children }: PropsWithChildren<{ visible: boolean }>) => visible ? <N.View>{children}</N.View> : null,
    AppText: ({ children }: PropsWithChildren) => <N.Text>{children}</N.Text>, AppStateView: () => null };
});
it('omits company IP and method frames even if a malformed company projection contains them', async () => {
  await render(<ErrorLogDetailModal scope="company" item={mockEntry} canView onClose={jest.fn()} />);
  expect(screen.getByText('Safe summary')).toBeTruthy();
  expect(screen.queryByText('192.0.2.1')).toBeNull();
  expect(screen.queryByText('Safe.Method')).toBeNull();
  expect(screen.queryByText('HttpMethod: GET')).toBeNull();
});
it('renders technical method frames only in authorized system detail', async () => {
  await render(<ErrorLogDetailModal scope="system" item={mockEntry} canView onClose={jest.fn()} />);
  expect(screen.getByText('192.0.2.1')).toBeTruthy();
  expect(screen.getByText('Safe.Method')).toBeTruthy();
  expect(screen.getByText('HttpMethod: GET')).toBeTruthy();
  expect(screen.getByText('Exception[0].HResult: 0x80004005')).toBeTruthy();
});
it('does not open detail without its independent permission', async () => {
  await render(<ErrorLogDetailModal scope="system" item={mockEntry} canView={false} onClose={jest.fn()} />);
  expect(screen.queryByText('Safe.Method')).toBeNull();
  expect(screen.queryByText('HttpMethod: GET')).toBeNull();
});

/* eslint-disable @typescript-eslint/no-require-imports */
import React, { type PropsWithChildren } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { AdministrationLinks } from './AdministrationLinks';

const mockPush = jest.fn();
const mockClose = jest.fn();
let mockPaths: string[] = [];
let mockUsersAllowed = false;
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/src/platform/auth', () => ({
  permissions: { ViewUsers: 'Users:View' },
  useAuth: () => ({ session: {} }),
  canAccessRoute: (path: string) => mockPaths.includes(path),
  isAuthorized: () => mockUsersAllowed,
}));
jest.mock('@/src/shared/components', () => {
  const Native = require('react-native');
  return { AppCard: ({ children }: PropsWithChildren) => <Native.View>{children}</Native.View>,
    AppText: ({ children }: PropsWithChildren) => <Native.Text>{children}</Native.Text>,
    AppButton: ({ children, onPress }: PropsWithChildren<{ onPress: () => void }>) => <Native.Pressable onPress={onPress} accessibilityLabel={String(children)} /> };
});

beforeEach(() => { mockPaths = []; mockUsersAllowed = false; mockPush.mockClear(); mockClose.mockClear(); });
it('shows only permitted operational links and closes the drawer before navigation', async () => {
  mockPaths = ['/advanced-tools/error-logs'];
  await render(<AdministrationLinks onNavigate={mockClose} />);
  expect(screen.getByText('navigation.administration')).toBeTruthy();
  expect(screen.queryByLabelText('navigation.errorLogSettings')).toBeNull();
  expect(screen.queryByLabelText('navigation.systemErrorLogs')).toBeNull();
  await fireEvent.press(screen.getByLabelText('navigation.errorLogs'));
  expect(mockClose).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith('/advanced-tools/error-logs');
  expect(mockClose.mock.invocationCallOrder[0]).toBeLessThan(mockPush.mock.invocationCallOrder[0]);
});
it('does not label the aggregate Administration fallback as Users without Users:View', async () => {
  mockPaths = ['/administration'];
  await render(<AdministrationLinks />);
  expect(screen.queryByText('navigation.administration')).toBeNull();
  expect(screen.queryByLabelText('navigation.users')).toBeNull();
});
it('keeps global system diagnostics separate from company tools', async () => {
  mockPaths = ['/system-error-logs'];
  await render(<AdministrationLinks />);
  expect(screen.getByLabelText('navigation.systemErrorLogs')).toBeTruthy();
  expect(screen.queryByLabelText('navigation.errorLogs')).toBeNull();
});

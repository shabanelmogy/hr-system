import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import { AppErrorBoundary } from './AppErrorBoundary';

jest.mock('expo-app-metrics/src/module', () => ({
  __esModule: true,
  default: { reportError: jest.fn() },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/src/core/theme', () => ({
  useAppTheme: () => ({ theme: { colors: { background: '#ffffff' } } }),
}));

jest.mock('@/src/shared/components/layout/AppScreen', () => ({
  AppScreen: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/src/shared/components/feedback/AppStateView', () => ({
  AppStateView: ({ message, onRetry, title }: { message: string; onRetry: () => void; title: string }) => {
    const ReactRuntime = jest.requireActual<typeof import('react')>('react');
    const ReactNative = jest.requireActual<typeof import('react-native')>('react-native');
    return ReactRuntime.createElement(
      ReactNative.View,
      null,
      ReactRuntime.createElement(ReactNative.Text, null, title),
      ReactRuntime.createElement(ReactNative.Text, null, message),
      ReactRuntime.createElement(
        ReactNative.Pressable,
        {
          accessibilityRole: 'button',
          onPress: () => {
            shouldFail = false;
            onRetry();
          },
          testID: 'retry',
        },
        ReactRuntime.createElement(ReactNative.Text, null, 'Retry'),
      ),
    );
  },
}));

let shouldFail = true;

function RecoverableScreen() {
  if (shouldFail) throw new Error('render failure');
  return <ReactNative.Text>Recovered</ReactNative.Text>;
}

describe('AppErrorBoundary', () => {
  it('shows a localized themed fallback and retries the failed subtree', async () => {
    shouldFail = true;
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const warningLog = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const appMetrics = jest.requireMock('expo-app-metrics/src/module').default as {
      reportError: jest.Mock;
    };
    appMetrics.reportError.mockClear();
    const { getByText, getByTestId } = await render(
      <AppErrorBoundary>
        <RecoverableScreen />
      </AppErrorBoundary>,
    );

    expect(getByText('feedback.errorTitle')).toBeTruthy();
    expect(getByText('feedback.unhandledErrorMessage')).toBeTruthy();
    expect(appMetrics.reportError).toHaveBeenCalledWith(expect.objectContaining({
      isFatal: false,
      message: 'render failure',
      source: 'errorBoundary',
    }));
    fireEvent.press(getByTestId('retry'));
    expect(shouldFail).toBe(false);
    await waitFor(() => expect(getByText('Recovered')).toBeTruthy());
    warningLog.mockRestore();
    errorLog.mockRestore();
  });
});

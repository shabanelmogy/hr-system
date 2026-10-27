/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AppHtmlPreview } from './AppHtmlPreview';
jest.mock('@/src/core/theme', () => ({ useAppTheme: () => ({ theme: { colors: { border: 'gray' } } }) }));
jest.mock('../feedback/AppStateView', () => ({ AppStateView: () => null }));
jest.mock('react-native-webview', () => {
  const Native = require('react-native');
  return { WebView: (props: Record<string, unknown>) => <Native.View {...props} testID="html-preview" /> };
});
it('renders the final HTML with scripting/storage/files/copies disabled and rejects external navigation', async () => {
  await render(<AppHtmlPreview html="<html><body>Final content</body></html>" title="Preview" />);
  const view = screen.getByTestId('html-preview');
  expect(view.props.javaScriptEnabled).toBe(false);
  expect(view.props.domStorageEnabled).toBe(false);
  expect(view.props.allowFileAccess).toBe(false);
  expect(view.props.sharedCookiesEnabled).toBe(false);
  expect(view.props.source.html).toContain('Final content');
  expect(view.props.onShouldStartLoadWithRequest({ url: 'https://example.invalid/action' })).toBe(false);
  expect(view.props.onShouldStartLoadWithRequest({ url: 'about:blank' })).toBe(true);
});

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppFormTabs } from './AppFormTabs';

jest.mock('@/src/core/localization', () => ({
  useLocalization: () => ({ direction: 'rtl', isRTL: true }),
}));

jest.mock('@/src/core/theme', () => ({
  useAppTheme: () => ({
    theme: {
      colors: {
        border: '#ddd',
        danger: '#d00',
        primary: '#067',
        surfaceMuted: '#eee',
        textMuted: '#666',
      },
    },
  }),
}));

describe('AppFormTabs', () => {
  it('exposes accessible tabs, error labels, RTL direction, and mounted panels', async () => {
    const onChange = jest.fn();
    const { getByLabelText, getByText } = await render(
      <AppFormTabs
        label="Tenant sections"
        tabs={[
          { value: 'identity', label: 'Identity', content: <Text>Identity content</Text> },
          { value: 'contact', label: 'Contact', content: <Text>Contact content</Text>, hasError: true, errorLabel: 'Contact has errors' },
        ]}
        value="identity"
        onChange={onChange}
      />,
    );

    expect(getByLabelText('Tenant sections')).toBeTruthy();
    expect(getByLabelText('Contact. Contact has errors')).toBeTruthy();
    expect(getByText('Contact content', { includeHiddenElements: true })).toBeTruthy();
    fireEvent.press(getByLabelText('Contact. Contact has errors'));
    expect(onChange).toHaveBeenCalledWith('contact');
  });

  it('unmounts inactive panels when keepMounted is false', async () => {
    const { getByText, queryByText } = await render(
      <AppFormTabs
        keepMounted={false}
        label="Tenant sections"
        tabs={[
          { value: 'identity', label: 'Identity', content: <Text>Identity content</Text> },
          { value: 'contact', label: 'Contact', content: <Text>Contact content</Text> },
        ]}
        value="identity"
        onChange={() => undefined}
      />,
    );

    expect(getByText('Identity content')).toBeTruthy();
    expect(queryByText('Contact content')).toBeNull();
  });
});

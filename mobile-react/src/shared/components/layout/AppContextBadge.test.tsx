import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { AppContextBadge } from './AppContextBadge';

jest.mock('@/src/core/localization', () => ({
  useLocalization: () => ({ direction: 'ltr', isRTL: false }),
}));

jest.mock('@/src/core/theme', () => ({
  useAppTheme: () => ({
    theme: {
      colors: {
        border: '#ddd',
        accent: '#a21caf',
        danger: '#d00',
        onDanger: '#fff',
        onSecondary: '#fff',
        onSolid: '#fff',
        onWarning: '#fff',
        primary: '#067',
        secondary: '#06c',
        success: '#080',
        warning: '#b60',
        shadow: '#000',
        surface: '#fff',
        surfaceMuted: '#eee',
        text: '#111',
        textMuted: '#666',
      },
    },
  }),
}));

describe('AppContextBadge', () => {
  it('keeps a 44-point target and announces both scope and value', async () => {
    const onPress = jest.fn();
    const { getByLabelText, queryByText } = await render(
      <AppContextBadge
        expandable
        icon="calendar-outline"
        label="Working fiscal year"
        onPress={onPress}
        value="FY 2026"
      />,
    );

    const trigger = getByLabelText('Working fiscal year: FY 2026');
    expect(StyleSheet.flatten(trigger.props.style)).toMatchObject({
      minHeight: 44,
    });
    expect(queryByText('Working fiscal year')).toBeNull();
    expect(queryByText('FY 2026')).not.toBeNull();
    fireEvent.press(trigger);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses an icon-only 44-point square without losing the accessible value', async () => {
    const { getByLabelText } = await render(
      <AppContextBadge
        icon="business-outline"
        iconOnly
        label="Current company"
        value="Contoso"
      />,
    );

    const badge = getByLabelText('Current company: Contoso');
    expect(StyleSheet.flatten(badge.props.style)).toMatchObject({
      minHeight: 44,
      minWidth: 44,
      width: 44,
    });
  });

  it('uses a transparent on-primary treatment inside the unified context group', async () => {
    const { getByLabelText } = await render(
      <AppContextBadge
        icon="layers-outline"
        label="Current tenant"
        tone="onPrimary"
        value="Northwind"
      />,
    );

    expect(StyleSheet.flatten(getByLabelText('Current tenant: Northwind').props.style)).toMatchObject({
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      minHeight: 44,
    });
  });
});

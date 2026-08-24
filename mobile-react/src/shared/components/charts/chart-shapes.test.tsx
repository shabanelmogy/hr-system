import { render } from '@testing-library/react-native';

import { AppRingChart } from './AppRingChart';
import { AppVerticalBarChart } from './AppVerticalBarChart';

jest.mock('@/src/core/localization', () => ({
  useLocalization: () => ({ isRTL: false }),
}));

jest.mock('@/src/core/theme', () => ({
  spacing: { sm: 8, xs: 4 },
  useAppTheme: () => ({
    theme: {
      colors: {
        accent: '#a0a',
        border: '#ddd',
        danger: '#d00',
        onPrimary: '#fff',
        primary: '#067',
        secondary: '#06c',
        success: '#080',
        surface: '#fff',
        surfaceMuted: '#eee',
        text: '#111',
        textMuted: '#666',
        warning: '#c60',
      },
      radius: { full: 999, sm: 6 },
    },
  }),
}));

const data = [
  { key: 'jan', label: 'Jan', value: 2 },
  { key: 'feb', label: 'Feb', value: 4 },
] as const;

describe('shared chart shapes', () => {
  it('renders an accessible vertical comparison', async () => {
    const { getByLabelText } = await render(
      <AppVerticalBarChart data={data} emptyLabel="No values" />,
    );

    expect(getByLabelText('Jan: 2, Feb: 4')).toBeTruthy();
  });

  it('renders an accessible proportional ring with its total', async () => {
    const { getByLabelText, getByText } = await render(
      <AppRingChart centerLabel="Loaded" data={data} emptyLabel="No values" />,
    );

    expect(getByLabelText('Loaded: 6. Jan: 2, Feb: 4')).toBeTruthy();
    expect(getByText('Loaded')).toBeTruthy();
    expect(getByText('6')).toBeTruthy();
  });

  it('uses the explicit empty state when the series has no positive values', async () => {
    const { getByText } = await render(
      <AppRingChart
        centerLabel="Loaded"
        data={[{ key: 'empty', label: 'Empty', value: 0 }]}
        emptyLabel="No values"
      />,
    );

    expect(getByText('No values')).toBeTruthy();
  });
});

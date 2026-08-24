import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { AppSegmentedControl } from './AppSegmentedControl';

jest.mock('@/src/core/localization', () => ({
  useLocalization: () => ({ direction: 'ltr', isRTL: false }),
}));

jest.mock('@/src/core/theme', () => ({
  useAppTheme: () => ({
    theme: {
      colors: {
        border: '#ddd',
        danger: '#d00',
        onPrimary: '#fff',
        primary: '#067',
        surface: '#fff',
        surfaceMuted: '#eee',
        text: '#111',
        textMuted: '#666',
      },
      radius: { full: 999, md: 8, sm: 6 },
      spacing: { xs: 4 },
    },
  }),
}));

const options = [
  { label: 'Table', value: 'table' },
  { label: 'Cards', value: 'cards' },
  { label: 'Charts', value: 'chart' },
  { label: 'Report', value: 'report' },
  { disabled: true, label: 'Import', value: 'import' },
] as const;

describe('AppSegmentedControl fill layout', () => {
  it('distributes five compact options across one horizontal row', async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await render(
      <AppSegmentedControl
        label="Views"
        layout="fill"
        onChange={onChange}
        options={options}
        showOptionLabels={false}
        value="table"
      />,
    );

    const groupStyle = StyleSheet.flatten(getByLabelText('Views').props.style);
    expect(groupStyle).toMatchObject({
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'flex-start',
      width: '100%',
    });

    for (const label of options.map((option) => option.label)) {
      const option = getByLabelText(label);
      const optionStyle = typeof option.props.style === 'function'
        ? option.props.style({ pressed: false })
        : option.props.style;

      expect(StyleSheet.flatten(optionStyle)).toMatchObject({
        flexGrow: 1,
        flexShrink: 1,
        minHeight: 40,
        minWidth: 44,
      });
    }

    fireEvent.press(getByLabelText('Import'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

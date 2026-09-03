import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AppInteractiveEntityChart, type AppInteractiveChartItem } from './AppInteractiveEntityChart';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('react-native-keyboard-controller', () => {
  const { View } = require('react-native');
  return {
    KeyboardAvoidingView: View,
    KeyboardAwareScrollView: View,
    KeyboardProvider: View,
    useKeyboardHandler: jest.fn(),
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'ar', resolvedLanguage: 'ar' },
    t: (key: string) => key,
  }),
}));

jest.mock('@/src/core/localization', () => ({
  useLocalization: () => ({ direction: 'rtl', isRTL: true }),
}));

jest.mock('@/src/core/theme', () => {
  const actual = jest.requireActual('@/src/core/theme/theme');
  return {
    ...actual,
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
          warning: '#fa0',
          success: '#0a0',
          secondary: '#08a',
        },
        radius: actual.radius,
        spacing: actual.spacing,
        typography: actual.typography,
        layout: actual.layout,
      },
    }),
  };
});

interface DummyCostCenter {
  id: number;
  code: string;
  name: string;
  parentName?: string;
}

const mockData: AppInteractiveChartItem<DummyCostCenter>[] = [
  {
    item: { id: 1, code: 'CC-101', name: 'المقر الرئيسي' },
    key: '1',
    code: 'CC-101',
    label: 'المقر الرئيسي',
    value: 5,
    badgeLabel: 'رئيسي',
    details: [
      { label: 'النوع', value: 'مركز رئيسي' },
      { label: 'المراكز الفرعية', value: 5 },
    ],
  },
  {
    item: { id: 2, code: 'CC-102', name: 'قطاع التقنية', parentName: 'المقر الرئيسي' },
    key: '2',
    code: 'CC-102',
    label: 'قطاع التقنية',
    value: 2,
    badgeLabel: 'فرعي',
    details: [
      { label: 'المركز الأب', value: 'المقر الرئيسي' },
      { label: 'المراكز الفرعية', value: 2 },
    ],
  },
];

describe('AppInteractiveEntityChart shared component', () => {
  it('renders title, items, codes, and values properly', async () => {
    const { getByText } = await render(
      <AppInteractiveEntityChart<DummyCostCenter>
        data={mockData}
        title="مخطط مراكز التكلفة"
        valueUnit="مراكز فرعية"
      />
    );

    expect(getByText('مخطط مراكز التكلفة')).toBeTruthy();
    expect(getByText('المقر الرئيسي')).toBeTruthy();
    expect(getByText('قطاع التقنية')).toBeTruthy();
    expect(getByText('CC-101')).toBeTruthy();
    expect(getByText('CC-102')).toBeTruthy();
  });

  it('selects an item on tap and displays its details card', async () => {
    const { getByText, queryByText } = await render(
      <AppInteractiveEntityChart<DummyCostCenter>
        data={mockData}
        entityName="مركز التكلفة"
        title="مخطط مراكز التكلفة"
      />
    );

    // Before selection, detail pair shouldn't be rendered
    expect(queryByText('النوع')).toBeNull();

    // Tap on the first item
    await fireEvent.press(getByText('المقر الرئيسي'));

    // Now details card is visible
    expect(getByText('النوع')).toBeTruthy();
    expect(getByText('مركز رئيسي')).toBeTruthy();
  });

  it('calls onViewItem when view button in details card is pressed', async () => {
    const onViewItemMock = jest.fn();
    const { getByText } = await render(
      <AppInteractiveEntityChart<DummyCostCenter>
        data={mockData}
        entityName="مركز التكلفة"
        onViewItem={onViewItemMock}
        title="مخطط مراكز التكلفة"
      />
    );

    // Select item
    await fireEvent.press(getByText('قطاع التقنية'));

    // Press view details button
    const viewBtn = getByText('عرض تفاصيل مركز التكلفة');
    await fireEvent.press(viewBtn);

    expect(onViewItemMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 2, code: 'CC-102' })
    );
  });

  it('renders emptyMessage when data is empty', async () => {
    const { getByText } = await render(
      <AppInteractiveEntityChart<DummyCostCenter>
        data={[]}
        emptyMessage="لا توجد مراكز تكلفة"
        title="مخطط مراكز التكلفة"
      />
    );

    expect(getByText('لا توجد مراكز تكلفة')).toBeTruthy();
  });
});

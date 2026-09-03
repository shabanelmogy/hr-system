import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AppHierarchicalTree } from './AppHierarchicalTree';

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
    i18n: { language: 'en', resolvedLanguage: 'en' },
    t: (key: string) => key,
  }),
}));

jest.mock('@/src/core/localization', () => ({
  useLocalization: () => ({ direction: 'ltr', isRTL: false }),
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

interface TestDepartment {
  id: number;
  code: string;
  name: string;
  parentId?: number;
}

const mockItems: TestDepartment[] = [
  { id: 1, code: 'DEP-01', name: 'Headquarters' },
  { id: 2, code: 'DEP-02', name: 'Engineering', parentId: 1 },
  { id: 3, code: 'DEP-03', name: 'Frontend Team', parentId: 2 },
  { id: 4, code: 'DEP-04', name: 'Finance' },
];

describe('AppHierarchicalTree shared component', () => {
  it('renders root items and child items in hierarchical structure', async () => {
    const { getByText } = await render(
      <AppHierarchicalTree<TestDepartment>
        getCode={(it) => it.code}
        getId={(it) => it.id}
        getLabel={(it) => it.name}
        getParentId={(it) => it.parentId}
        items={mockItems}
      />
    );

    expect(getByText('Headquarters')).toBeTruthy();
    expect(getByText('Engineering')).toBeTruthy();
    expect(getByText('Frontend Team')).toBeTruthy();
    expect(getByText('Finance')).toBeTruthy();
    expect(getByText('DEP-01')).toBeTruthy();
  });

  it('renders empty message when no items are provided', async () => {
    const { getByText } = await render(
      <AppHierarchicalTree<TestDepartment>
        emptyMessage="No departments found"
        getCode={(it) => it.code}
        getId={(it) => it.id}
        getLabel={(it) => it.name}
        getParentId={(it) => it.parentId}
        items={[]}
      />
    );

    expect(getByText('No departments found')).toBeTruthy();
  });

  it('calls onView callback when item card is tapped', async () => {
    const onViewMock = jest.fn();
    const { getByText } = await render(
      <AppHierarchicalTree<TestDepartment>
        getCode={(it) => it.code}
        getId={(it) => it.id}
        getLabel={(it) => it.name}
        getParentId={(it) => it.parentId}
        items={mockItems}
        onView={onViewMock}
      />
    );

    await fireEvent.press(getByText('Finance'));
    expect(onViewMock).toHaveBeenCalledWith(expect.objectContaining({ id: 4, name: 'Finance' }));
  });

  it('allows collapsing and expanding nodes', async () => {
    const { getByText, getByTestId, queryByText } = await render(
      <AppHierarchicalTree<TestDepartment>
        getCode={(it) => it.code}
        getId={(it) => it.id}
        getLabel={(it) => it.name}
        getParentId={(it) => it.parentId}
        items={mockItems}
      />
    );

    // Click collapse all button
    await fireEvent.press(getByTestId('btn-collapse-all'));

    // Root items remain, but nested children are collapsed
    expect(getByText('Headquarters')).toBeTruthy();
    expect(getByText('Finance')).toBeTruthy();
    expect(queryByText('Engineering')).toBeNull();

    // Click expand all button
    await fireEvent.press(getByTestId('btn-expand-all'));

    expect(getByText('Engineering')).toBeTruthy();
  });

  it('collapses and expands individual node when its row is pressed', async () => {
    const { getByText, queryByText } = await render(
      <AppHierarchicalTree<TestDepartment>
        getCode={(it) => it.code}
        getId={(it) => it.id}
        getLabel={(it) => it.name}
        getParentId={(it) => it.parentId}
        items={mockItems}
      />
    );

    // Engineering is initially visible
    expect(getByText('Engineering')).toBeTruthy();

    // Click Headquarters to collapse it
    await fireEvent.press(getByText('Headquarters'));

    // Engineering should now be collapsed (hidden)
    expect(queryByText('Engineering')).toBeNull();

    // Click Headquarters again to expand it
    await fireEvent.press(getByText('Headquarters'));

    // Engineering should now be visible again
    expect(getByText('Engineering')).toBeTruthy();
  });

  it('collapses and expands individual node when its chevron button is pressed', async () => {
    const { getAllByLabelText, getByLabelText, getByText, queryByText } = await render(
      <AppHierarchicalTree<TestDepartment>
        getCode={(it) => it.code}
        getId={(it) => it.id}
        getLabel={(it) => it.name}
        getParentId={(it) => it.parentId}
        items={mockItems}
      />
    );

    // Click chevron button of first parent to collapse
    await fireEvent.press(getAllByLabelText('Collapse')[0]);
    expect(queryByText('Engineering')).toBeNull();

    // Click chevron button to expand
    await fireEvent.press(getByLabelText('Expand'));
    expect(getByText('Engineering')).toBeTruthy();
  });

  it('calls onAddChild, onView, and onDelete when node action buttons are pressed', async () => {
    const onAddChildMock = jest.fn();
    const onViewMock = jest.fn();
    const onDeleteMock = jest.fn();

    const { getAllByLabelText } = await render(
      <AppHierarchicalTree<TestDepartment>
        canCreate
        canDelete
        getCode={(it) => it.code}
        getId={(it) => it.id}
        getLabel={(it) => it.name}
        getParentId={(it) => it.parentId}
        items={mockItems}
        onAddChild={onAddChildMock}
        onDelete={onDeleteMock}
        onView={onViewMock}
      />
    );

    // Press Add button on first node
    await fireEvent.press(getAllByLabelText('Add Child')[0]);
    expect(onAddChildMock).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));

    // Press View button on first node
    await fireEvent.press(getAllByLabelText('View')[0]);
    expect(onViewMock).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));

    // Press Delete button on first node
    await fireEvent.press(getAllByLabelText('Delete')[0]);
    expect(onDeleteMock).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });
});

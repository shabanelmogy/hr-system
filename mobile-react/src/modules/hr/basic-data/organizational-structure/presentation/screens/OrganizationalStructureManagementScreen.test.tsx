import React from 'react';
import { render } from '@testing-library/react-native';
import { getOrganizationalDefaultView } from '../utils/organizationalStructureViews';
import { OrganizationalStructureTreeDiagram } from '../components/OrganizationalStructureTreeDiagram';

const treeCapture: { props: Record<string, unknown> | null } = { props: null };

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('react-native-keyboard-controller', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    KeyboardAvoidingView: View,
    KeyboardAwareScrollView: View,
    KeyboardProvider: View,
    useKeyboardHandler: jest.fn(),
  };
});

jest.mock('@/src/shared/components/tree-view/AppHierarchicalTree', () => ({
  AppHierarchicalTree: (props: Record<string, unknown>) => {
    treeCapture.props = props;
    return null;
  },
}));

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
  const actual = jest.requireActual<typeof import('@/src/core/theme/theme')>('@/src/core/theme/theme');
  return {
  ...actual,
  useAppTheme: () => ({
    theme: {
      isDark: false,
      colors: {
        border: '#ddd',
        danger: '#d00',
        onPrimary: '#fff',
        primary: '#067',
        secondary: '#08a',
        surface: '#fff',
        surfaceMuted: '#eee',
        text: '#111',
        textMuted: '#666',
        warning: '#fa0',
      },
      spacing: actual.spacing,
      radius: actual.radius,
      typography: actual.typography,
      layout: actual.layout,
    },
  }),
  };
});

const items = [
  { id: 1, code: 'CC-ROOT', nameEn: 'Root', nameAr: 'الجذر', parentCostCenterId: null, isDeleted: false },
  { id: 2, code: 'CC-CHILD', nameEn: 'Child', nameAr: 'فرعي', parentCostCenterId: 1, isDeleted: false },
] as never[];

describe('mobile cost-center tree pattern', () => {
  it('uses tree as the default organizational view for cost centers', () => {
    expect(getOrganizationalDefaultView('cost-centers')).toBe('tree');
    expect(getOrganizationalDefaultView('departments')).toBe('table');
  });

  it('composes the cost-center feature with the shared hierarchical tree', async () => {
    await render(
      <OrganizationalStructureTreeDiagram
        canCreate
        canDelete
        canEdit
        items={items}
        onAddChild={jest.fn()}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
        onReparent={jest.fn(async () => undefined)}
        onView={jest.fn()}
        resource="cost-centers"
      />,
    );

    expect(treeCapture.props).not.toBeNull();
    expect(treeCapture.props?.items).toBe(items);
    expect(treeCapture.props?.canCreate).toBe(true);
    expect(treeCapture.props?.canEdit).toBe(true);
    expect(treeCapture.props?.canDelete).toBe(true);
    expect(treeCapture.props?.getParentId && (treeCapture.props.getParentId as (item: typeof items[number]) => number | null)(items[1])).toBe(1);
    expect(treeCapture.props?.getLeafIcon).toEqual(expect.any(Function));
  });
});

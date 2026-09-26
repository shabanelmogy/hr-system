/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, render, screen } from '@testing-library/react-native';

import type { PermissionGroup } from '../permission-groups';
import { PermissionModuleCard } from './PermissionModuleCard';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: { module?: string }) => (
      values?.module ? `${key}:${values.module}` : key
    ),
  }),
}));

jest.mock('@/src/core/localization', () => ({
  useLocalization: () => ({ direction: 'ltr' }),
}));

jest.mock('@/src/core/theme', () => ({
  useAppTheme: () => ({
    theme: {
      colors: {
        border: '#ddd',
        danger: '#d00',
        primary: '#067',
        success: '#080',
        surface: '#fff',
        surfaceMuted: '#eee',
        textMuted: '#666',
      },
      radius: { sm: 6 },
    },
  }),
}));

jest.mock('@/src/shared/components', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');

  return {
    AppCard: ({ children, style }: { children: React.ReactNode; style?: object }) => (
      <View style={style}>{children}</View>
    ),
    AppIcon: () => null,
    AppIconButton: ({
      label,
      onPress,
    }: {
      label: string;
      onPress: () => void;
    }) => (
      <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} />
    ),
    AppSwitchField: ({
      label,
      onValueChange,
      value,
    }: {
      label: string;
      onValueChange: (value: boolean) => void;
      value: boolean;
    }) => (
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        onPress={() => onValueChange(!value)}
      />
    ),
    AppText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
  };
});

const group: PermissionGroup = {
  module: 'Users',
  claims: [
    {
      action: 'View',
      claim: { displayValue: 'Users:View', isSelected: true },
      index: 0,
    },
    {
      action: 'Create',
      claim: { displayValue: 'Users:Create', isSelected: false },
      index: 1,
    },
  ],
};

describe('PermissionModuleCard', () => {
  it('opens one screen disclosure and exposes its permission controls', async () => {
    const onToggleExpanded = jest.fn();
    const onToggle = jest.fn();
    const onSetModule = jest.fn();
    const { rerender } = await render(
      <PermissionModuleCard
        disabled={false}
        expanded={false}
        group={group}
        onSetModule={onSetModule}
        onToggle={onToggle}
        onToggleExpanded={onToggleExpanded}
      />,
    );

    const expand = screen.getByLabelText(
      'roleManagement.expandScreenPermissions:roleManagement.permissionModules.users',
    );
    expect(expand.props.accessibilityState).toEqual({ expanded: false });
    expect(screen.queryByRole('switch')).toBeNull();
    await fireEvent.press(expand);
    expect(onToggleExpanded).toHaveBeenCalledTimes(1);

    await rerender(
      <PermissionModuleCard
        disabled={false}
        expanded
        group={group}
        onSetModule={onSetModule}
        onToggle={onToggle}
        onToggleExpanded={onToggleExpanded}
      />,
    );

    expect(screen.getByLabelText(
      'roleManagement.collapseScreenPermissions:roleManagement.permissionModules.users',
    ).props.accessibilityState).toEqual({ expanded: true });
    await fireEvent.press(screen.getByLabelText('roleManagement.permissionActions.create'));
    expect(onToggle).toHaveBeenCalledWith(1);

    await fireEvent.press(screen.getByLabelText('roleManagement.selectScreenPermissions'));
    expect(onSetModule).toHaveBeenCalledWith(group, true);
  });
});

/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { OfflineOperationsPolicyScreen } from './OfflineOperationsPolicyScreen';

const mockSegmentedControl = jest.fn();
const mockButton = jest.fn();
let mockReadOnly = false;
let mockPolicyStatus: 'ready' | 'missing' = 'missing';
let mockAuthority: 'server' | 'cache' | 'fail-closed' = 'fail-closed';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/src/core/localization', () => ({
  useLocalization: () => ({ direction: 'ltr' }),
}));

jest.mock('@/src/core/theme', () => ({
  useAppTheme: () => ({
    theme: {
      colors: {
        primary: '#123456',
        warning: '#654321',
        surfaceMuted: '#eeeeee',
      },
      radius: { sm: 8 },
    },
  }),
}));

jest.mock('@/src/shared/contexts/AppReadOnlyContext', () => ({
  useAppReadOnly: () => ({
    isReadOnly: mockReadOnly,
    notifyBlockedAction: jest.fn(),
  }),
}));

jest.mock('../providers/OfflineOperationsProvider', () => ({
  useOfflineOperationsPolicy: () => ({
    loaded: true,
    scope: { userId: 'user-a', tenantId: 'tenant-a', companyId: 7 },
    policy: {
      status: mockPolicyStatus,
      authority: mockAuthority,
      snapshot: mockPolicyStatus === 'ready' ? {
        capabilities: [
          { id: 'countries.read', supportedModes: ['online-only', 'offline-read'] },
          { id: 'workforce-plan.update-draft', supportedModes: ['online-only', 'offline-draft', 'offline-command'] },
        ],
      } : null,
      resolved: {
        'countries.read': {
          capabilityId: 'countries.read',
          tenantId: 'tenant-a',
          companyId: 7,
          mode: mockPolicyStatus === 'ready' ? 'offline-read' : 'online-only',
          source: mockPolicyStatus === 'ready' ? 'override' : 'fail-closed',
        },
        'workforce-plan.update-draft': {
          capabilityId: 'workforce-plan.update-draft',
          tenantId: 'tenant-a',
          companyId: 7,
          mode: 'online-only',
          source: mockPolicyStatus === 'ready' ? 'override' : 'fail-closed',
        },
      },
    },
    savingCapabilityId: null,
    reload: jest.fn(),
    setMode: jest.fn(),
    resetScope: jest.fn(),
  }),
}));

jest.mock('@/src/shared/components', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    AppAlert: ({ children, title }: { children: React.ReactNode; title?: string }) => (
      <View>{title ? <Text>{title}</Text> : null}<Text>{children}</Text></View>
    ),
    AppButton: (props: { children: React.ReactNode; disabled?: boolean; onPress: () => void }) => {
      mockButton(props);
      return (
        <Pressable disabled={props.disabled} onPress={props.onPress} testID="reset-policy">
          <Text>{props.children}</Text>
        </Pressable>
      );
    },
    AppCard: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    AppIcon: () => null,
    AppScreen: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    AppSegmentedControl: (props: {
      disabled?: boolean;
      label: string;
      options: { value: string; label: string; disabled?: boolean }[];
    }) => {
      mockSegmentedControl(props);
      return (
        <View testID={`modes-${props.label}`}>
          {props.options.map((option) => (
            <Text key={option.value}>{`${option.value}:${String(Boolean(option.disabled))}`}</Text>
          ))}
        </View>
      );
    },
    AppStatusBadge: ({ label }: { label: string }) => <Text>{label}</Text>,
    AppText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    ConfirmationDialog: ({ visible, title }: { visible: boolean; title: string }) => (
      visible ? <Text>{title}</Text> : null
    ),
    showToast: { error: jest.fn(), success: jest.fn() },
  };
});

describe('OfflineOperationsPolicyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReadOnly = false;
    mockPolicyStatus = 'missing';
    mockAuthority = 'fail-closed';
  });

  it('shows fail-closed state and keeps policy editing disabled without a live server policy', async () => {
    await render(<OfflineOperationsPolicyScreen />);

    expect(screen.getByText('offlineOperations.missingSnapshot')).toBeTruthy();
    expect(screen.getByText('offlineOperations.groups.basicData')).toBeTruthy();
    expect(screen.getByText('offlineOperations.groups.workforcePlanning')).toBeTruthy();
    expect(mockSegmentedControl.mock.calls.every(([props]) => props.disabled === true)).toBe(true);
    expect(mockButton).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
  });

  it('enables only modes certified by both the app and the live server contract', async () => {
    mockPolicyStatus = 'ready';
    mockAuthority = 'server';

    await render(<OfflineOperationsPolicyScreen />);

    const countries = mockSegmentedControl.mock.calls.find(
      ([props]) => props.label === 'offlineOperations.capabilities.countriesRead',
    )?.[0];
    const workforce = mockSegmentedControl.mock.calls.find(
      ([props]) => props.label === 'offlineOperations.capabilities.workforcePlanUpdateDraft',
    )?.[0];

    expect(countries.options).toEqual([
      expect.objectContaining({ value: 'online-only', disabled: false }),
      expect.objectContaining({ value: 'offline-read', disabled: false }),
      expect.objectContaining({ value: 'offline-draft', disabled: true }),
      expect.objectContaining({ value: 'offline-command', disabled: true }),
    ]);
    expect(workforce.options).toEqual([
      expect.objectContaining({ value: 'online-only', disabled: false }),
      expect.objectContaining({ value: 'offline-read', disabled: true }),
      expect.objectContaining({ value: 'offline-draft', disabled: false }),
      expect.objectContaining({ value: 'offline-command', disabled: false }),
    ]);
    expect(screen.queryByText('offlineOperations.safetyBlockedDescription')).toBeNull();
  });

  it('disables policy editing while the tenant is read-only', async () => {
    mockPolicyStatus = 'ready';
    mockAuthority = 'server';
    mockReadOnly = true;

    await render(<OfflineOperationsPolicyScreen />);

    expect(mockSegmentedControl.mock.calls.every(([props]) => props.disabled === true)).toBe(true);
    expect(mockButton).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
    expect(screen.getAllByText('offlineOperations.source.serverPolicy').length).toBeGreaterThan(0);
  });

  it('shows cached authority and keeps policy editing disabled until the server is live', async () => {
    mockPolicyStatus = 'ready';
    mockAuthority = 'cache';

    await render(<OfflineOperationsPolicyScreen />);

    expect(screen.getByText('offlineOperations.cachedPolicyNotice')).toBeTruthy();
    expect(screen.getAllByText('offlineOperations.source.cachedPolicy').length).toBeGreaterThan(0);
    expect(mockSegmentedControl.mock.calls.every(([props]) => props.disabled === true)).toBe(true);
    expect(mockButton).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
  });
});

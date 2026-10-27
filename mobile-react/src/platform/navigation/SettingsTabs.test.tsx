/* eslint-disable @typescript-eslint/no-require-imports */
import React, { type ReactNode } from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { clearUnsavedChangesForTests, registerUnsavedChange } from '@/src/shared/contexts/unsaved-changes-registry';
import { SettingsTabs } from './SettingsTabs';

let mockPaths: string[] = [];
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/src/platform/auth', () => ({ useAuth: () => ({ session: {} }), canAccessRoute: (path: string) => mockPaths.includes(path) }));
jest.mock('@/src/platform/tools/error-logs', () => { const Native = require('react-native'); return { ErrorLogSettingsScreen: () => <Native.Text>Retention body</Native.Text> }; });
jest.mock('@/src/platform/tenant-administration/company-localizations', () => { const Native = require('react-native'); return { SystemLocalizationsScreen: () => <Native.Text>Global translations body</Native.Text>, CompanyLocalizationsScreen: () => <Native.Text>Company translations body</Native.Text> }; });
jest.mock('@/src/platform/tenant-administration/company-geographic-scope', () => { const Native = require('react-native'); return { CompanyGeographicScopeScreen: () => <Native.Text>Geography body</Native.Text> }; });
jest.mock('@/src/platform/offline-operations', () => { const Native = require('react-native'); return { OfflineOperationsPolicyScreen: () => <Native.Text>Offline body</Native.Text> }; });
jest.mock('@/src/platform/tools/localization', () => { const Native = require('react-native'); return { LocalizationManagementScreen: () => <Native.Text>Messages body</Native.Text> }; });
jest.mock('@/src/shared/components', () => {
  const Native = require('react-native');
  return {
    AppFormTabs: ({ tabs, value, onChange }: { tabs: { value: string; label: string; content: ReactNode }[]; value: string; onChange: (value: string) => void }) => <Native.View>
      {tabs.map((tab) => <Native.Pressable key={tab.value} accessibilityRole="tab" accessibilityLabel={tab.label} onPress={() => onChange(tab.value)} />)}
      {tabs.find((tab) => tab.value === value)?.content}
    </Native.View>,
    ConfirmationDialog: ({ visible, onCancel, onConfirm }: { visible: boolean; onCancel: () => void; onConfirm: () => void }) => visible ? <Native.View>
      <Native.Pressable accessibilityLabel="Keep editing" onPress={onCancel} />
      <Native.Pressable accessibilityLabel="Discard" onPress={onConfirm} />
    </Native.View> : null,
  };
});
beforeEach(() => { mockPaths = []; clearUnsavedChangesForTests(); });
afterEach(clearUnsavedChangesForTests);

it('renders the permitted editor in-place and switches to actual device preferences', async () => {
  mockPaths = ['/error-log-settings'];
  await render(<SettingsTabs preferences={<Text>Device body</Text>} />);
  expect(screen.getByText('Retention body')).toBeTruthy();
  expect(screen.queryByText('Device body')).toBeNull();
  expect(screen.queryByText('Company translations body')).toBeNull();
  await fireEvent.press(screen.getByLabelText('settings.devicePreferences'));
  expect(screen.getByText('Device body')).toBeTruthy();
  expect(screen.queryByText('Retention body')).toBeNull();
});
it('never mounts a denied system panel for a company configuration holder', async () => {
  mockPaths = ['/administration/company-localizations'];
  await render(<SettingsTabs preferences={<Text>Device body</Text>} />);
  expect(screen.getByText('Company translations body')).toBeTruthy();
  expect(screen.queryByLabelText('navigation.errorLogSettings')).toBeNull();
  expect(screen.queryByText('Retention body')).toBeNull();
});
it('retains the current editor on cancel, then discards through the shared registry before switching', async () => {
  mockPaths = ['/error-log-settings'];
  const discard = jest.fn();
  registerUnsavedChange(discard);
  await render(<SettingsTabs preferences={<Text>Device body</Text>} />);
  await fireEvent.press(screen.getByLabelText('settings.devicePreferences'));
  await fireEvent.press(screen.getByLabelText('Keep editing'));
  expect(screen.getByText('Retention body')).toBeTruthy();
  expect(discard).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByLabelText('settings.devicePreferences'));
  await fireEvent.press(screen.getByLabelText('Discard'));
  expect(discard).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Device body')).toBeTruthy();
});
it('does not leave an editor while submission is pending', async () => {
  mockPaths = ['/error-log-settings'];
  const discard = jest.fn();
  registerUnsavedChange(discard, true);
  await render(<SettingsTabs preferences={<Text>Device body</Text>} />);
  await fireEvent.press(screen.getByLabelText('settings.devicePreferences'));
  expect(screen.queryByLabelText('Discard')).toBeNull();
  expect(screen.getByText('Retention body')).toBeTruthy();
  expect(discard).not.toHaveBeenCalled();
});

it('opens authorized global texts as a Settings tab without company tabs',async()=>{mockPaths=['/system-ui-texts'];await render(<SettingsTabs preferences={<Text>Preferences body</Text>}/>);expect(screen.getByText('Global translations body')).toBeTruthy();expect(screen.queryByText('Company translations body')).toBeNull();});

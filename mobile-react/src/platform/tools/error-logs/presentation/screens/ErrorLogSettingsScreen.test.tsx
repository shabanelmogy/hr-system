/* eslint-disable @typescript-eslint/no-require-imports */
import React, { type PropsWithChildren } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ApiError } from '@/src/core/api';
import { ErrorLogSettingsScreen } from './ErrorLogSettingsScreen';

const mockSave = jest.fn();
const mockRefetch = jest.fn();
let mockCanEdit = true;
let mockData = { retentionDays: 90, revision: 0, queueDepth: 0, droppedCount: 0, failedWrites: 0 };
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/src/platform/auth', () => ({
  appRoles: { superAdmin: 'super_admin' }, permissions: { ViewErrorLogSettings: 'view', EditErrorLogSettings: 'edit' },
  useAuth: () => ({ isServerAuthenticated: true, isSwitchingCompany: false }),
  useAuthorization: ({ requiredPermissions }: { requiredPermissions: string[] }) => ({ allowed: requiredPermissions[0] === 'view' || mockCanEdit }),
}));
jest.mock('@/src/shared/contexts/AppReadOnlyContext', () => ({ useAppReadOnly: () => ({ isReadOnly: false, notifyBlockedAction: jest.fn() }) }));
jest.mock('../queries/use-error-logs', () => ({
  useErrorLogSettings: () => ({ data: mockData, refetch: mockRefetch }),
  useSaveErrorLogSettings: () => ({ mutateAsync: mockSave, isPending: false }),
}));
jest.mock('@/src/shared/components', () => {
  const N = require('react-native');
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    AppScreen: ({ children }: PropsWithChildren) => <N.View>{children}</N.View>,
    AppPageHeader: () => null, AppFormSection: ({ children }: PropsWithChildren) => <N.View>{children}</N.View>,
    AppText: ({ children }: PropsWithChildren) => <N.Text>{children}</N.Text>, AppStateView: () => null,
    AppButton: ({ children, onPress }: PropsWithChildren<{ onPress: () => void }>) => <N.Pressable accessibilityLabel={String(children)} onPress={onPress}><N.Text>{children}</N.Text></N.Pressable>,
    AppTextField: React.forwardRef(function MockTextField(_props: { label: string; value: string; onChangeText: (value: string) => void }, _ref) { return <N.TextInput accessibilityLabel={_props.label} value={_props.value} onChangeText={_props.onChangeText} />; }),
    AppForm: ({ children, visible, onSubmit, errors, serverError }: PropsWithChildren<{ visible: boolean; onSubmit?: () => void; errors: Record<string, string>; serverError?: string }>) => visible ? <N.View>{children}<N.Text>{errors.retentionDays}</N.Text><N.Text>{serverError}</N.Text>{onSubmit ? <N.Pressable accessibilityLabel="save" onPress={onSubmit} /> : null}</N.View> : null,
    showToast: { success: jest.fn() },
  };
});

describe('retention editing', () => {
  beforeEach(() => { mockCanEdit = true; mockData = { retentionDays: 90, revision: 0, queueDepth: 0, droppedCount: 0, failedWrites: 0 }; mockSave.mockReset(); mockRefetch.mockReset(); });
  it('keeps submission enabled and explains invalid retention below the field', async () => {
    await render(<ErrorLogSettingsScreen />);
    await fireEvent.press(screen.getByLabelText('common.edit'));
    await fireEvent.changeText(screen.getByLabelText('errorLogSettings.retentionDays'), '0');
    await fireEvent.press(screen.getByLabelText('save'));
    await waitFor(() => expect(screen.getAllByText('errorLogSettings.range').length).toBeGreaterThan(0));
    expect(mockSave).not.toHaveBeenCalled();
  });
  it('retains the original revision through background refresh and preserves the draft through conflict reload', async () => {
    mockSave.mockRejectedValueOnce(new ApiError(409, 'conflict')).mockResolvedValueOnce({ ...mockData, retentionDays: 30, revision: 2 });
    mockRefetch.mockResolvedValue({ data: { ...mockData, retentionDays: 60, revision: 1 } });
    const view = await render(<ErrorLogSettingsScreen />);
    await fireEvent.press(screen.getByLabelText('common.edit'));
    await fireEvent.changeText(screen.getByLabelText('errorLogSettings.retentionDays'), '30');
    mockData = { ...mockData, retentionDays: 60, revision: 1 };
    await view.rerender(<ErrorLogSettingsScreen />);
    await fireEvent.press(screen.getByLabelText('save'));
    await waitFor(() => expect(mockSave).toHaveBeenCalledWith({ retentionDays: 30, expectedRevision: 0 }));
    await fireEvent.press(screen.getByLabelText('errorLogSettings.reloadRevision'));
    await waitFor(() => expect(mockRefetch).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText('errorLogSettings.retentionDays')).toHaveProp('value', '30');
    await fireEvent.press(screen.getByLabelText('save'));
    await waitFor(() => expect(mockSave).toHaveBeenLastCalledWith({ retentionDays: 30, expectedRevision: 1 }));
  });
  it('maps server field validation to the retention input', async () => {
    mockSave.mockRejectedValue(new ApiError(400, 'invalid', { errors: { RetentionDays: ['days rejected'] } }));
    await render(<ErrorLogSettingsScreen />);
    await fireEvent.press(screen.getByLabelText('common.edit'));
    await fireEvent.press(screen.getByLabelText('save'));
    await waitFor(() => expect(screen.getByText('days rejected')).toBeTruthy());
  });
  it('keeps View independent from Edit', async () => {
    mockCanEdit = false;
    await render(<ErrorLogSettingsScreen />);
    expect(screen.queryByLabelText('common.edit')).toBeNull();
    expect(screen.queryByLabelText('save')).toBeNull();
  });
});

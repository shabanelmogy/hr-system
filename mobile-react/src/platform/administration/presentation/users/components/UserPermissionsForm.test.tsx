/* eslint-disable @typescript-eslint/no-require-imports */
import type { PropsWithChildren, ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { PermissionGroup } from '../../roles/permissions/permission-groups';
import type { UserCompanyPermissions } from '../../../domain/models/administration';
import { UserPermissionsForm } from './UserPermissionsForm';

interface FormShellProps extends PropsWithChildren { onSubmit?: () => void; }
interface ButtonProps extends PropsWithChildren { onPress: () => void; }
interface CardProps { group: PermissionGroup; onToggle: (index: number) => void; }

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, values?: Record<string, unknown>) => `${key}${values?.role ? `:${values.role}` : ''}` }) }));
jest.mock('@/src/shared/contexts/AppReadOnlyContext', () => ({ useAppReadOnly: () => ({ isReadOnly: false }) }));
jest.mock('@/src/core/localization', () => ({ getModuleLabel: (code: string) => code }));
jest.mock('@/src/shared/components', () => {
  const { useDiscardChanges } = jest.requireActual('@/src/shared/components/dialogs/discard-changes/useDiscardChanges');
  const Native = require('react-native');
  return { useDiscardChanges,
    AppForm: ({ children, onSubmit }: FormShellProps) => <Native.View>{children}{onSubmit ? <Native.Pressable accessibilityLabel="save" onPress={onSubmit} /> : null}</Native.View>,
    AppFormSection: ({ children }: PropsWithChildren) => <Native.View>{children}</Native.View>, AppStateView: () => <Native.Text>state</Native.Text>, AppText: ({ children }: { children: ReactNode }) => <Native.Text>{children}</Native.Text>,
    AppTextField: () => null, AppSelectField: () => null, AppSegmentedControl: () => null,
    AppButton: ({ children, onPress }: ButtonProps) => <Native.Pressable accessibilityLabel={String(children)} onPress={onPress}><Native.Text>{children}</Native.Text></Native.Pressable>,
    DiscardChangesDialog: ({ visible, onDiscard }: { visible: boolean; onDiscard: () => void }) => visible ? <Native.Pressable accessibilityLabel="discard" onPress={onDiscard} /> : null,
    showToast: { error: jest.fn(), success: jest.fn() },
  };
});
jest.mock('../../roles/permissions/components/PermissionBusinessModuleRail', () => ({ PermissionBusinessModuleRail: () => null }));
jest.mock('../../roles/permissions/components/PermissionModuleCard', () => {
  const Native = require('react-native');
  return { PermissionModuleCard: ({ group, onToggle }: CardProps) => <Native.View>{group.claims.map((claim) => <Native.Pressable accessibilityLabel={claim.claim.displayValue} key={claim.index} onPress={() => onToggle(claim.index)} />)}</Native.View> };
});

const material = (revision = 7, direct = true): UserCompanyPermissions => ({ userId: 'target', userName: 'Target', companyId: 1, companyName: 'A', revision, permissions: [{ permission: 'Users:View', moduleCode: 'platform', submoduleCode: 'Users', isDirect: direct, inheritedFrom: [], isEffective: true, canGrant: false }] });

describe('UserPermissionsForm', () => {
  it('preserves a dirty removable direct grant through refetch and confirms before applying reload', async () => {
    const save = jest.fn<Promise<void>, [string[], number]>().mockResolvedValue(undefined);
    const reload = jest.fn<Promise<UserCompanyPermissions>, []>().mockResolvedValue(material(9));
    const view = await render(<UserPermissionsForm canEdit error={null} loading={false} onClose={jest.fn()} onReload={reload} onSave={save} value={material(7)} visible />);
    await fireEvent.press(screen.getByLabelText('Users:View'));
    await view.rerender(<UserPermissionsForm canEdit error={null} loading={false} onClose={jest.fn()} onReload={reload} onSave={save} value={material(9)} visible />);
    await fireEvent.press(screen.getByLabelText('save'));
    await waitFor(() => expect(save).toHaveBeenCalledWith([], 7));
    expect(screen.queryByLabelText('discard')).toBeNull();
    await fireEvent.press(view.getByText('userPermissions.reload'));
    expect(screen.getByLabelText('discard')).toBeTruthy();
    expect(reload).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByLabelText('discard'));
    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
  });
  it('blocks submission when direct-permission editing is read-only', async () => {
    await render(<UserPermissionsForm canEdit={false} error={null} loading={false} onClose={jest.fn()} onReload={jest.fn()} onSave={jest.fn()} value={material()} visible />);
    expect(screen.queryByLabelText('save')).toBeNull();
  });
});

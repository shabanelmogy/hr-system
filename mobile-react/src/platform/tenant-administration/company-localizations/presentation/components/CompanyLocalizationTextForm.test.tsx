/* eslint-disable @typescript-eslint/no-require-imports */
import type { PropsWithChildren, ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import type { CompanyLocalizationText } from '../../domain/models/company-localization';
import { CompanyLocalizationTextForm } from './CompanyLocalizationTextForm';

interface FormProps extends PropsWithChildren { onSubmit?: () => void; }
interface ButtonProps extends PropsWithChildren { onPress: () => void; }
interface TextFieldProps { label: string; onChangeText: (value: string) => void; value: string; }

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/src/shared/contexts/AppReadOnlyContext', () => ({ useAppReadOnly: () => ({ isReadOnly: false }) }));
jest.mock('@/src/shared/components', () => {
  const Native = require('react-native');
  const { useDiscardChanges } = jest.requireActual('@/src/shared/components/dialogs/discard-changes/useDiscardChanges');
  return {
    useDiscardChanges,
    AppForm: ({ children, onSubmit }: FormProps) => <Native.View>{children}{onSubmit ? <Native.Pressable accessibilityLabel="save" onPress={onSubmit} /> : null}</Native.View>,
    AppFormSection: ({ children }: PropsWithChildren) => <Native.View>{children}</Native.View>,
    AppStateView: () => <Native.Text>state</Native.Text>,
    AppText: ({ children }: { children: ReactNode }) => <Native.Text>{children}</Native.Text>,
    AppTextField: ({ label, onChangeText, value }: TextFieldProps) => <Native.TextInput accessibilityLabel={label} onChangeText={onChangeText} value={value} />,
    AppButton: ({ children, onPress }: ButtonProps) => <Native.Pressable accessibilityLabel={String(children)} onPress={onPress}><Native.Text>{children}</Native.Text></Native.Pressable>,
    DiscardChangesDialog: ({ visible, onDiscard }: { visible: boolean; onDiscard: () => void }) => visible ? <Native.Pressable accessibilityLabel="discard" onPress={onDiscard} /> : null,
    showToast: { error: jest.fn(), success: jest.fn() },
  };
});

const item = (targetValue = 'Original {{name}}'): CompanyLocalizationText => ({
  key: 'companyLocalizations.welcome', baseValue: 'Welcome {{name}}', targetValue, shippedValue: 'Welcome {{name}}', isCustomized: true,
});

describe('CompanyLocalizationTextForm', () => {
  it('keeps a dirty value and the opening revision when an in-place query refetch arrives', async () => {
    const save = jest.fn<Promise<void>, [string, number]>().mockResolvedValue(undefined);
    const view = await render(<CompanyLocalizationTextForm baseLanguage="en" canEdit item={item()} onClose={jest.fn()} onReload={jest.fn().mockResolvedValue(undefined)} onSave={save} revision={4} source="mobile:translation" status="customized" targetLanguage="ar" visible />);

    await fireEvent.changeText(screen.getByLabelText('companyLocalizations.value'), ' First {{name}} ');
    expect(screen.getByLabelText('companyLocalizations.value').props.value).toBe(' First {{name}} ');
    await fireEvent.changeText(screen.getByLabelText('companyLocalizations.value'), '  Changed {{name}}  ');
    expect(screen.getByLabelText('companyLocalizations.value').props.value).toBe('  Changed {{name}}  ');
    await view.rerender(<CompanyLocalizationTextForm baseLanguage="en" canEdit item={item('Server newer {{name}}')} onClose={jest.fn()} onReload={jest.fn().mockResolvedValue(undefined)} onSave={save} revision={5} source="mobile:translation" status="customized" targetLanguage="ar" visible />);
    await fireEvent.press(screen.getByLabelText('save'));

    await waitFor(() => expect(save).toHaveBeenCalledWith('  Changed {{name}}  ', 4));
  });

  it('does not expose a submission callback when text editing is unavailable', async () => {
    const save = jest.fn<Promise<void>, [string, number]>().mockResolvedValue(undefined);
    await render(<CompanyLocalizationTextForm baseLanguage="en" canEdit={false} item={item()} onClose={jest.fn()} onReload={jest.fn().mockResolvedValue(undefined)} onSave={save} revision={4} source="mobile:translation" status="customized" targetLanguage="ar" visible />);

    expect(screen.queryByLabelText('save')).toBeNull();
  });
});

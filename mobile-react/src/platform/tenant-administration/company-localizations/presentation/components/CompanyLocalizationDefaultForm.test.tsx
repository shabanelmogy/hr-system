/* eslint-disable @typescript-eslint/no-require-imports */
import type { PropsWithChildren } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import type { CompanyLocalizationSettings } from '../../domain/models/company-localization';
import { CompanyLocalizationDefaultForm } from './CompanyLocalizationDefaultForm';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/src/shared/contexts/AppReadOnlyContext', () => ({ useAppReadOnly: () => ({ isReadOnly: false }) }));
jest.mock('@/src/shared/components', () => {
  const Native = require('react-native');
  const { useDiscardChanges } = jest.requireActual('@/src/shared/components/dialogs/discard-changes/useDiscardChanges');
  return { useDiscardChanges, AppForm: ({ children, onSubmit }: PropsWithChildren<{ onSubmit?: () => void }>) => <Native.View>{children}{onSubmit ? <Native.Pressable accessibilityLabel="save" onPress={onSubmit} /> : null}</Native.View>, AppFormSection: ({ children }: PropsWithChildren) => <Native.View>{children}</Native.View>, AppSelectField: ({ onChange }: { onChange: (value: string) => void }) => <Native.Pressable accessibilityLabel="language" onPress={() => onChange('ar')} />, AppButton: () => null, DiscardChangesDialog: () => null, showToast: { error: jest.fn(), success: jest.fn() } };
});

const settings = (revision: number, defaultLanguage: 'en' | 'ar' = 'en'): CompanyLocalizationSettings => ({ tenantId: 'tenant', companyId: 1, defaultLanguage, revision, languages: ['en', 'ar'], sources: [], catalogVersions: {} });

describe('CompanyLocalizationDefaultForm', () => {
  it('submits its opening revision through background refresh and captures a fresh revision after reopen', async () => {
    const save = jest.fn<Promise<void>, ['en' | 'ar', number]>().mockResolvedValue(undefined);
    const first = await render(<CompanyLocalizationDefaultForm canEdit onClose={jest.fn()} onReload={jest.fn().mockResolvedValue(undefined)} onSave={save} settings={settings(4)} />);
    await fireEvent.press(screen.getByLabelText('language'));
    await first.rerender(<CompanyLocalizationDefaultForm canEdit onClose={jest.fn()} onReload={jest.fn().mockResolvedValue(undefined)} onSave={save} settings={settings(5, 'ar')} />);
    await fireEvent.press(screen.getByLabelText('save'));
    await waitFor(() => expect(save).toHaveBeenCalledWith('ar', 4));

    await first.unmount();
    const second = await render(<CompanyLocalizationDefaultForm canEdit onClose={jest.fn()} onReload={jest.fn().mockResolvedValue(undefined)} onSave={save} settings={settings(6, 'ar')} />);
    await fireEvent.press(screen.getByLabelText('language'));
    await fireEvent.press(screen.getByLabelText('save'));
    await waitFor(() => expect(save).toHaveBeenLastCalledWith('ar', 6));
    await second.unmount();
  });
});

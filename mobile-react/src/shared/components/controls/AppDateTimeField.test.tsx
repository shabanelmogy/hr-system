/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AppDateTimeField } from './AppDateTimeField';
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }) }));

jest.mock('@/src/core/localization', () => ({ useLocalization: () => ({ direction: 'ltr', isRTL: false }) }));
jest.mock('@/src/core/theme', () => ({ useAppTheme: () => ({ theme: { colors: {}, radius: { md: 8 } } }) }));
jest.mock('@/src/shared/contexts/AppReadOnlyContext', () => ({ useAppReadOnly: () => ({ isReadOnly: true }) }));
jest.mock('@/src/shared/components/forms/AppForm', () => ({ useAppFormField: () => ({ error: undefined, clearError: jest.fn() }) }));
jest.mock('@/src/shared/components/icons/AppIcon', () => ({ AppIcon: () => null }));
jest.mock('@/src/shared/components/typography/AppText', () => {
  const N = require('react-native');
  return { AppText: ({ children }: React.PropsWithChildren) => <N.Text>{children}</N.Text> };
});
jest.mock('@/src/shared/components/controls/AppButton', () => ({ AppButton: () => null }));
jest.mock('@/src/shared/components/controls/AppIconButton', () => ({ AppIconButton: () => null }));
jest.mock('@/src/shared/components/surfaces/AppModal', () => ({ AppModal: () => null }));
jest.mock('@/src/shared/components/forms/AppFieldMessage', () => ({ AppFieldMessage: () => null }));

it('keeps read-only data entry disabled and allows an explicitly read-only-safe filter', async () => {
  const view = await render(<AppDateTimeField label="Date" value="" onChangeValue={jest.fn()} />);
  expect(screen.getByRole('button')).toBeDisabled();
  await view.rerender(<AppDateTimeField label="Date" value="" onChangeValue={jest.fn()} allowWhenReadOnly />);
  expect(screen.getByRole('button')).toBeEnabled();
  await view.rerender(<AppDateTimeField label="Date" value="" onChangeValue={jest.fn()} allowWhenReadOnly disabled />);
  expect(screen.getByRole('button')).toBeDisabled();
});

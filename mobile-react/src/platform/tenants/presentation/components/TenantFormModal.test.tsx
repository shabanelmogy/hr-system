import React from 'react';
import { render } from '@testing-library/react-native';
import { TenantFormModal } from './TenantFormModal';

const formErrors = { name: { type: 'required', message: 'Name is required' } };

jest.mock('react-hook-form', () => ({
  Controller: ({ render: renderField, name }: { render: (args: { field: { name: string; value: string; onChange: jest.Mock; onBlur: jest.Mock; ref: jest.Mock } }) => React.ReactNode; name: string }) => renderField({
    field: { name, value: '', onChange: jest.fn(), onBlur: jest.fn(), ref: jest.fn() },
  }),
}));

jest.mock('@/src/core/validation', () => ({
  toFormErrorMap: () => ({ name: 'Name is required' }),
  useZodForm: () => ({
    clearErrors: jest.fn(),
    control: {},
    handleSubmit: (onValid: (value: unknown) => void) => () => onValid({}),
    watch: () => '2026-01-01',
    formState: { errors: formErrors, isDirty: false, isSubmitting: false },
  }),
}));

jest.mock('@/src/core/localization', () => ({
  useLocalization: () => ({ direction: 'ltr', isRTL: false }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/src/shared/components', () => {
  const ReactNative = jest.requireActual<typeof import('react-native')>('react-native');
  const Field = ({ name }: { name?: string }) => <ReactNative.Text testID={`field-${name ?? 'unknown'}`} />;
  return {
    AppDateTimeField: Field,
    AppForm: ({ children, errors, presentation }: { children: React.ReactNode; errors: Record<string, string>; presentation: string }) => (
      <ReactNative.View testID="tenant-form">
        <ReactNative.Text testID="tenant-form-presentation">{presentation}</ReactNative.Text>
        <ReactNative.Text testID="tenant-form-errors">{JSON.stringify(errors)}</ReactNative.Text>
        {children}
      </ReactNative.View>
    ),
    AppSelectField: Field,
    AppSwitchField: Field,
    AppText: ({ children }: { children?: React.ReactNode }) => <ReactNative.Text>{children}</ReactNative.Text>,
    AppTextField: Field,
  };
});

describe('TenantFormModal adapted mobile pattern', () => {
  it('uses one stacked AppForm context and keeps validation visible under the form shell', async () => {
    const { getByTestId } = await render(
      <TenantFormModal
        form={{
          identifier: 'demo',
          name: '',
          isActive: true,
          subscriptionStatus: 'free',
          subscriptionStartedOn: '2026-01-01',
          subscriptionEndsOn: '',
          planName: 'Free',
          maxAdmins: '1',
          maxUsers: '5',
          billingEmail: '',
          contactName: '',
          contactPhone: '',
          notes: '',
          entitlements: [],
        }}
        isEdit={false}
        loading={false}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    expect(getByTestId('tenant-form')).toBeTruthy();
    expect(getByTestId('tenant-form-presentation').props.children).toBe('fullScreen');
    expect(getByTestId('tenant-form-errors').props.children).toContain('Name is required');
  });
});

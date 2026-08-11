import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import {
  AppTextField,
  type AppTextFieldProps,
} from '@/src/shared/components/controls/AppTextField';

export interface FormTextFieldProps<Values extends FieldValues>
  extends Omit<AppTextFieldProps, 'onBlur' | 'onChangeText' | 'value'> {
  control: Control<Values>;
  name: FieldPath<Values>;
}

export function FormTextField<Values extends FieldValues>({
  control,
  name,
  error,
  ...textFieldProps
}: FormTextFieldProps<Values>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <AppTextField
      {...textFieldProps}
      error={fieldState.error?.message ?? error}
      onBlur={field.onBlur}
      onChangeText={field.onChange}
      ref={field.ref}
      value={field.value == null ? '' : String(field.value)}
    />
  );
}

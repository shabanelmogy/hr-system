import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  type FieldErrors,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import { z } from 'zod';

type ZodFormOptions<TInput extends FieldValues, TOutput extends FieldValues> = Omit<
  UseFormProps<TInput, unknown, TOutput>,
  'resolver'
>;

/** The application-wide React Hook Form setup for Zod-backed forms. */
export function useZodForm<
  TInput extends FieldValues,
  TOutput extends FieldValues = TInput,
>(
  schema: z.ZodType<TOutput, TInput>,
  options: ZodFormOptions<TInput, TOutput> = {},
): UseFormReturn<TInput, unknown, TOutput> {
  return useForm<TInput, unknown, TOutput>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    ...options,
    resolver: zodResolver(schema),
  });
}

/** Converts flat React Hook Form errors into the error map consumed by AppForm. */
export function toFormErrorMap<TValues extends FieldValues>(
  errors: FieldErrors<TValues>,
): Partial<Record<Extract<keyof TValues, string>, string>> {
  const entries = Object.entries(errors).flatMap(([fieldName, fieldError]) => {
    const message = (fieldError as { message?: unknown } | undefined)?.message;
    return typeof message === 'string' ? [[fieldName, message] as const] : [];
  });

  return Object.fromEntries(entries) as Partial<
    Record<Extract<keyof TValues, string>, string>
  >;
}

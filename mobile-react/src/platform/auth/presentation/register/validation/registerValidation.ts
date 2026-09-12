import { z } from 'zod';

export const passwordPolicyPattern =
  /^(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

interface RegisterValidationMessages {
  required: string;
  minLength: (count: number) => string;
  maxLength: (count: number) => string;
  invalidEmail: string;
  invalidPassword: string;
  passwordsMustMatch: string;
}

export function createRegisterValidationSchema(messages: RegisterValidationMessages) {
  return z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, messages.required)
        .min(3, messages.minLength(3))
        .max(50, messages.maxLength(50)),
      lastName: z
        .string()
        .trim()
        .min(1, messages.required)
        .min(3, messages.minLength(3))
        .max(50, messages.maxLength(50)),
      userName: z
        .string()
        .trim()
        .min(1, messages.required)
        .min(3, messages.minLength(3))
        .max(50, messages.maxLength(50)),
      email: z.string().trim().min(1, messages.required).email(messages.invalidEmail),
      password: z
        .string()
        .min(1, messages.required)
        .min(8, messages.invalidPassword)
        .regex(passwordPolicyPattern, messages.invalidPassword),
      confirmPassword: z.string().min(1, messages.required),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: messages.passwordsMustMatch,
      path: ['confirmPassword'],
    });
}

export type RegisterFormData = z.infer<ReturnType<typeof createRegisterValidationSchema>>;

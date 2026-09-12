import { z } from 'zod';

export function createLoginValidationSchema(messages: {
  userNameRequired: string;
  userNameTooShort: string;
  userNameTooLong: string;
  passwordRequired: string;
}) {
  return z.object({
    userName: z
      .string()
      .trim()
      .min(1, messages.userNameRequired)
      .min(3, messages.userNameTooShort)
      .max(50, messages.userNameTooLong),
    password: z.string().trim().min(1, messages.passwordRequired),
  });
}

export type LoginFormData = z.infer<ReturnType<typeof createLoginValidationSchema>>;

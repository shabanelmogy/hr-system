import { z } from 'zod';

export function createLoginSchema(messages: {
  userNameRequired: string;
  passwordRequired: string;
}) {
  return z.object({
    userName: z.string().trim().min(1, messages.userNameRequired),
    password: z.string().trim().min(1, messages.passwordRequired),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

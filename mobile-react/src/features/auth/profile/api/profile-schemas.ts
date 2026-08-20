import { z } from 'zod';

export const userProfileSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  userName: z.string().min(1),
  firstName: z.string(),
  lastName: z.string(),
});

export const userProfilePhotoSchema = z.object({
  profilePicture: z.string().nullable(),
  contentType: z.string().nullable(),
});

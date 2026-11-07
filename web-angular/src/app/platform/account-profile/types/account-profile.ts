import * as z from 'zod/mini';

export const profileInfoSchema = z.object({
  id: z.string().check(z.minLength(1)),
  email: z.string(),
  userName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});
export type ProfileInfo = z.infer<typeof profileInfoSchema>;
export type ProfileUpdate = Pick<ProfileInfo, 'id' | 'userName' | 'firstName' | 'lastName'>;
export interface PasswordUpdate {
  readonly currentPassword: string;
  readonly newPassword: string;
}

const photoSchema = z.object({
  profilePicture: z.nullish(z.string()),
  contentType: z.nullish(z.string()),
});
export const profilePhotoLimit = 10 * 1024 * 1024;

export function profilePhotoDataUrl(value: unknown): string | null {
  const photo = photoSchema.parse(value);
  if (!photo.profilePicture) return null;
  const contentType = photo.contentType ?? 'image/jpeg';
  if (
    !['image/jpeg', 'image/png'].includes(contentType) ||
    photo.profilePicture.length > Math.ceil(profilePhotoLimit / 3) * 4 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(photo.profilePicture)
  )
    throw new Error('Invalid account photo response');
  return `data:${contentType};base64,${photo.profilePicture}`;
}

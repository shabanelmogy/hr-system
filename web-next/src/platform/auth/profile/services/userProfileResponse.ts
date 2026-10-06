import { z } from "zod";
import type { UserInfo, UserPhoto } from "./userProfileTypes";

const userInfoSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  userName: z.string().optional(),
  email: z.string().optional(),
  roles: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  profilePicture: z.string().nullable().optional(),
});

// The API returns `{ profilePicture: null, contentType: null }` when the user has no photo.
const userPhotoSchema = z.object({
  profilePicture: z.string().nullish().transform((value) => value ?? undefined),
  contentType: z.string().nullish().transform((value) => value ?? undefined),
});

export function parseUserInfoResponse(value: unknown): UserInfo {
  return userInfoSchema.parse(value);
}

export function parseUserPhotoResponse(value: unknown): UserPhoto {
  const { profilePicture, contentType } = userPhotoSchema.parse(value);
  return {
    ...(profilePicture !== undefined && { profilePicture }),
    ...(contentType !== undefined && { contentType }),
  };
}

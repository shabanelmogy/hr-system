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

const userPhotoSchema = z.object({
  profilePicture: z.string().optional(),
  contentType: z.string().optional(),
});

export function parseUserInfoResponse(value: unknown): UserInfo {
  return userInfoSchema.parse(value);
}

export function parseUserPhotoResponse(value: unknown): UserPhoto {
  return userPhotoSchema.parse(value);
}
